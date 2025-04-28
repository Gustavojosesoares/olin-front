// inicio.js
document.addEventListener('DOMContentLoaded', function () {
  // Verificar autenticação
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './index.html';
    return;
  }

  // Exibir informações do usuário
  exibirInformacoesUsuario();

  // Configurar relógio
  atualizarDataHora();
  setInterval(atualizarDataHora, 60000);

  // Carregar casos e estatísticas
  carregarCasos();

  // Configurar formulário de novo caso
  document.getElementById('formNovoCaso').addEventListener('submit', criarNovoCaso);

  // Configurar paginação
  document.getElementById('prevPage').addEventListener('click', paginaAnterior);
  document.getElementById('nextPage').addEventListener('click', proximaPagina);
});

// Variáveis para paginação
let paginaAtual = 1;
let totalPaginas = 1;
const itensPorPagina = 10;
let todosCasos = [];

// Exibir informações do usuário logado
function exibirInformacoesUsuario() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    document.getElementById('userRoleDisplay').textContent = userData.role || 'Usuário';

    // Mostrar/ocultar funcionalidades baseadas no papel do usuário
    const isAdmin = userData.role === 'admin';
    document.querySelectorAll('.hidden-feature').forEach(el => {
      el.style.display = isAdmin ? 'block' : 'none';
    });
  }
}

// Atualizar data e hora
function atualizarDataHora() {
  const agora = new Date();
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  document.getElementById('currentDateTime').textContent = agora.toLocaleDateString(
    'pt-BR',
    options
  );
}

// Carregar casos da API
async function carregarCasos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://case-api-icfc.onrender.com/api/casos', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar casos');
    }

    const casos = await response.json();
    todosCasos = casos;
    totalPaginas = Math.ceil(casos.length / itensPorPagina);

    // Atualizar estatísticas
    atualizarEstatisticas(casos);

    // Mostrar casos na página atual
    mostrarCasosPaginados();

    // Atualizar informações de paginação
    atualizarPaginacao();
  } catch (error) {
    console.error('Erro ao carregar casos:', error);
    document.getElementById('mensagem').textContent =
      'Erro ao carregar casos. Por favor, tente novamente.';
  }
}

// Mostrar casos paginados
function mostrarCasosPaginados() {
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const casosPaginados = todosCasos.slice(inicio, fim);

  const casosListElement = document.getElementById('casosList');
  casosListElement.innerHTML = '';

  if (casosPaginados.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-center">Nenhum caso encontrado</td>';
    casosListElement.appendChild(tr);
    return;
  }

  casosPaginados.forEach(caso => {
    const tr = document.createElement('tr');

    // Determinar a classe CSS com base no status
    let statusClass = '';
    switch (caso.status) {
      case 'em andamento':
        statusClass = 'text-warning';
        break;
      case 'finalizado':
        statusClass = 'text-success';
        break;
      case 'arquivado':
        statusClass = 'text-secondary';
        break;
    }

    // Formatar data
    const data = new Date(caso.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');

    // Limite de caracteres para descrição
    const descricaoCurta =
      caso.descricao.length > 50 ? caso.descricao.substring(0, 50) + '...' : caso.descricao;

    tr.innerHTML = `
      <td>${caso.titulo}</td>
      <td>${dataFormatada}</td>
      <td><span class="${statusClass}">${caso.status}</span></td>
      <td title="${caso.descricao}">${descricaoCurta}</td>
      <td>${caso.tipo}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-info" onclick="visualizarCaso('${caso._id}')">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </td>
    `;

    casosListElement.appendChild(tr);
  });
}

// Atualizar estatísticas
function atualizarEstatisticas(casos) {
  const total = casos.length;
  const emAndamento = casos.filter(caso => caso.status === 'em andamento').length;
  const finalizados = casos.filter(caso => caso.status === 'finalizado').length;
  const arquivados = casos.filter(caso => caso.status === 'arquivado').length;

  document.getElementById('totalCasos').textContent = total;
  document.getElementById('casosAndamento').textContent = emAndamento;
  document.getElementById('casosFinalizados').textContent = finalizados;
  document.getElementById('casosArquivados').textContent = arquivados;
}

// Atualizar informações de paginação
function atualizarPaginacao() {
  document.getElementById('paginaAtual').textContent = `${paginaAtual} / ${totalPaginas || 1}`;

  // Habilitar/desabilitar botões de paginação
  document.getElementById('prevPage').disabled = paginaAtual <= 1;
  document.getElementById('nextPage').disabled = paginaAtual >= totalPaginas;
}

// Navegar para a página anterior
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    mostrarCasosPaginados();
    atualizarPaginacao();
  }
}

// Navegar para a próxima página
function proximaPagina() {
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    mostrarCasosPaginados();
    atualizarPaginacao();
  }
}

// Criar um novo caso
async function criarNovoCaso(event) {
  event.preventDefault();

  const titulo = document.getElementById('titulo').value;
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value;
  const localDoCaso = document.getElementById('localDoCaso').value;
  const status = document.getElementById('status').value;

  try {
    const token = localStorage.getItem('token');
    console.log(token);
    const userData = JSON.parse(localStorage.getItem('usuarioAtual'));
    console.log(userData);

    if (!userData || !userData.id) {
      alert('Sessão inválida, faça login novamente.');
      window.location.href = './index.html';
      return;
    }

    const novoCaso = {
      titulo,
      tipo,
      descricao,
      status,
      localDoCaso,
      peritoResponsavel: userData.id // Assumindo que o usuário logado é o perito responsável
    };

    const response = await fetch('https://case-api-icfc.onrender.com/api/casos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoCaso)
    });

    if (!response.ok) {
      throw new Error('Falha ao criar caso');
    }

    // Fechar modal após sucesso
    const modalElement = document.getElementById('modalNovoCaso');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // Limpar formulário
    document.getElementById('formNovoCaso').reset();

    // Recarregar casos
    carregarCasos();

    // Mostrar feedback de sucesso
    mostrarFeedback('Caso criado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao criar caso:', error);
    mostrarFeedback('Erro ao criar caso. Por favor, tente novamente.', 'danger');
  }
}

// Visualizar detalhes de um caso
async function visualizarCaso(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://case-api-icfc.onrender.com/api/casos/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar detalhes do caso');
    }

    const caso = await response.json();

    // Guarda o caso no localStorage para abrir na outra página
    localStorage.setItem('casoAtual', JSON.stringify(caso));
    window.location.href = `../casos/abrir-caso.html?id=${id}`;
  } catch (error) {
    console.error('Erro ao visualizar caso:', error);
    mostrarFeedback('Erro ao carregar detalhes do caso.', 'danger');
  }
}

window.visualizarCaso = visualizarCaso; // Torna a função acessível ao onclick

// Mostrar mensagem de feedback
function mostrarFeedback(mensagem, tipo) {
  const mensagemElement = document.getElementById('mensagem');
  mensagemElement.textContent = mensagem;
  mensagemElement.className = `mensagem mt-3 text-${tipo}`;

  // Esconder mensagem após 5 segundos
  setTimeout(() => {
    mensagemElement.textContent = '';
    mensagemElement.className = 'mensagem mt-3';
  }, 5000);
}
