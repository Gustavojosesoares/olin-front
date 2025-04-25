document.addEventListener('DOMContentLoaded', () => {
  const novoCasoForm = document.getElementById('novoCasoForm');
  const mensagemDiv = document.getElementById('novoCasoMensagem');

  const apiUrlCasos = 'http://localhost:8080/api/casos';

  function getToken() {
    return localStorage.getItem('authToken');
  }

  novoCasoForm.addEventListener('submit', async e => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const localDoCaso = document.getElementById('localDoCaso').value;
    const data = document.getElementById('data').value;
    const status = document.getElementById('status').value;

    try {
      const response = await fetch(apiUrlCasos, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ titulo, descricao, localDoCaso, data, status })
      });

      const data = await response.json();

      if (response.ok) {
        mensagemDiv.textContent = data.message || 'Caso criado com sucesso!';
        mensagemDiv.className = 'mensagem sucesso';
        novoCasoForm.reset();
        window.location.href = '../casos/casos.html'; // Redireciona de volta para a lista de casos
      } else {
        const erroMensagem = data.message || 'Erro ao criar caso.';
        mensagemDiv.textContent = erroMensagem;
        mensagemDiv.className = 'mensagem erro';
      }
    } catch (error) {
      console.error('Erro ao criar caso:', error);
      mensagemDiv.textContent = 'Erro ao criar caso.';
      mensagemDiv.className = 'mensagem erro';
    }
  });
});
