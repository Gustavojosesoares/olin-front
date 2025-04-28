// Função para carregar detalhes do caso
async function carregarDetalhesCaso(casoId) {
  try {
    mostrarSpinner();
    const token = localStorage.getItem('token');
    const response = await fetch(`https://case-api-icfc.onrender.com/api/casos/${casoId}`, {
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

    // Preencher campos
    renderizarCampo('tituloCaso', caso.titulo);
    renderizarCampo('tipoCaso', caso.tipo);
    renderizarCampo('localCaso', caso.localDoCaso || 'Não especificado');
    renderizarCampo('descricaoCaso', caso.descricao || 'Sem descrição');

    // Formatar e preencher data
    if (caso.dataAbertura) {
      const dataFormatada = formatarData(caso.dataAbertura);
      renderizarCampo('dataCaso', dataFormatada);
    }

    // Formatar status com badge
    if (caso.status) {
      let statusClass = '';
      switch (caso.status.toLowerCase()) {
        case 'em andamento':
          statusClass = 'badge bg-warning';
          break;
        case 'finalizado':
          statusClass = 'badge bg-success';
          break;
        case 'arquivado':
          statusClass = 'badge bg-secondary';
          break;
        default:
          statusClass = 'badge bg-light';
      }
      document.getElementById(
        'statusCaso'
      ).innerHTML = `<span class="${statusClass}">${caso.status}</span>`;
    }

    // Perito responsável
    if (caso.peritoResponsavel) {
      if (typeof caso.peritoResponsavel === 'object') {
        renderizarCampo('peritoResponsavel', caso.peritoResponsavel.name || 'Não especificado');
      } else {
        renderizarCampo('peritoResponsavel', 'ID: ' + caso.peritoResponsavel);
      }
    } else {
      renderizarCampo('peritoResponsavel', 'Não especificado');
    }

    // Criado por
    if (caso.criadoPor) {
      if (typeof caso.criadoPor === 'object') {
        renderizarCampo('criadoPor', caso.criadoPor.name || 'Não especificado');
      } else {
        renderizarCampo('criadoPor', 'ID: ' + caso.criadoPor);
      }
    } else {
      renderizarCampo('criadoPor', 'Não especificado');
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes do caso:', error);
    mostrarFeedback('Erro ao carregar detalhes do caso. Por favor, tente novamente.', 'danger');
  } finally {
    esconderSpinner(); // <<< Esconder o spinner, independente de sucesso ou erro
  }
}

// Função utilitária: renderizar conteúdo no HTML
function renderizarCampo(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    if (
      elemento.tagName === 'INPUT' ||
      elemento.tagName === 'TEXTAREA' ||
      elemento.tagName === 'SELECT'
    ) {
      elemento.value = valor;
    } else {
      elemento.textContent = valor;
    }
  }
}

// criar relatório
document.addEventListener('DOMContentLoaded', function () {
  // Adicionar manipulador de evento para o botão Criar Relatório
  const criarRelatorioBtn = document.getElementById('criarRelatorioBtn');
  if (criarRelatorioBtn) {
    criarRelatorioBtn.addEventListener('click', function () {
      // Obter o ID do caso atual da URL
      const urlParams = new URLSearchParams(window.location.search);
      const casoId = urlParams.get('id');

      // Redirecionar para a página de criação de relatório com o ID do caso
      window.location.href = `criar-relatorio.html?id=${casoId}`;
    });
  }
});

// Excluir caso
async function excluirCaso(casoId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://case-api-icfc.onrender.com/api/casos/${casoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir caso');
    }

    mostrarFeedback('Caso excluído com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = '../inicio/inicio.html';
    }, 2000);
  } catch (error) {
    console.error('Erro ao excluir caso:', error);
    mostrarFeedback('Erro ao excluir caso. Por favor, tente novamente.', 'danger');
  }
}

// Função utilitária: mostrar mensagens de feedback
function mostrarFeedback(mensagem, tipo) {
  const mensagemElement = document.getElementById('mensagem');
  mensagemElement.textContent = mensagem;
  mensagemElement.className = `mensagem mt-3 alert alert-${tipo}`;

  setTimeout(() => {
    mensagemElement.textContent = '';
    mensagemElement.className = 'mensagem mt-3';
  }, 5000);
}

// Função utilitária: formatar data
function formatarData(data) {
  const novaData = new Date(data);
  return novaData.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Botão Evidências
document.addEventListener('DOMContentLoaded', function () {
  const evidenciasBtn = document.getElementById('evidenciasBtn');

  evidenciasBtn.addEventListener('click', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const casoId = urlParams.get('id');

    if (casoId) {
      window.location.href = `../evidencias/listar-evidencias.html?caso=${casoId}`;
    } else {
      mostrarFeedback('Não foi possível identificar o caso atual.', 'danger');
    }
  });
});

// Botões Editar e Excluir
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const casoId = params.get('id');

  if (casoId) {
    await carregarDetalhesCaso(casoId);
  } else {
    console.error('ID do caso não encontrado na URL.');
  }

  const editarBtn = document.getElementById('editarBtn');
  const excluirBtn = document.getElementById('excluirBtn');
  const confirmarExclusaoBtn = document.getElementById('confirmarExclusaoBtn');

  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData?.role === 'admin') {
    excluirBtn.style.display = 'inline-block';
  }

  editarBtn.addEventListener('click', () => {
    window.location.href = `editar-caso.html?id=${casoId}`;
  });

  excluirBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarExclusao'));
    modal.show();
  });

  confirmarExclusaoBtn.addEventListener('click', () => {
    excluirCaso(casoId);
  });
});

function mostrarSpinner() {
  const spinner = document.getElementById('spinnerCarregando');
  spinner.style.display = 'block';
}

function esconderSpinner() {
  const spinner = document.getElementById('spinnerCarregando');
  spinner.style.display = 'none';
}
