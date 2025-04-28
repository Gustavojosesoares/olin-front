document.addEventListener('DOMContentLoaded', () => {
  carregarUsuarios();

  // Evento de envio do formulário de edição
  document.getElementById('formEditarUsuario').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('editarIdUsuario').value;
    const nome = document.getElementById('editarNomeUsuario').value.trim();
    const email = document.getElementById('editarEmailUsuario').value.trim();
    const role = document.getElementById('editarRoleUsuario').value;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://case-api-icfc.onrender.com/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome, email, role })
      });

      if (!response.ok) throw new Error('Erro ao atualizar usuário.');

      alert('Usuário atualizado com sucesso!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
      modal.hide();
      carregarUsuarios(); // Recarrega a lista depois de editar
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  });
});

// Função para carregar usuários
async function carregarUsuarios() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://case-api-icfc.onrender.com/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const usuarios = await response.json();
    renderizarUsuarios(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

// Função para renderizar usuários
function renderizarUsuarios(usuarios) {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  usuarios.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.name}</td>
      <td>${usuario.email}</td>
      <td>${usuario.role}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning editar-usuario" 
          data-id="${usuario._id}" 
          data-nome="${usuario.name}" 
          data-email="${usuario.email}" 
          data-role="${usuario.role}">
          <i class="bi bi-pencil-square"></i> Editar
        </button>
      </td>
    `;
    userList.appendChild(tr);
  });

  // Adicionar evento nos botões "Editar"
  document.querySelectorAll('.editar-usuario').forEach(button => {
    button.addEventListener('click', function () {
      document.getElementById('editarIdUsuario').value = this.getAttribute('data-id');
      document.getElementById('editarNomeUsuario').value = this.getAttribute('data-nome');
      document.getElementById('editarEmailUsuario').value = this.getAttribute('data-email');
      document.getElementById('editarRoleUsuario').value = this.getAttribute('data-role');

      const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
      modal.show();
    });
  });
}

// Evento de envio do formulário de novo usuário
document.getElementById('formNovoUsuario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('nomeUsuario').value.trim();
  const email = document.getElementById('emailUsuario').value.trim();
  const senha = document.getElementById('senhaUsuario').value;
  const role = document.getElementById('roleUsuario').value;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch('https://case-api-icfc.onrender.com/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: nome, // <- aqui
        email: email,
        password: senha, // <- aqui
        role: role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar usuário.');
    }

    alert('Usuário criado com sucesso!');

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNovoUsuario'));
    modal.hide();

    // Limpar os campos do formulário
    document.getElementById('formNovoUsuario').reset();

    // Atualizar a lista de usuários
    carregarUsuarios();
  } catch (error) {
    console.error(error);
    alert('Erro ao criar usuário: ' + error.message);
  }
});
