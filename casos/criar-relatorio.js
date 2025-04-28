document.addEventListener('DOMContentLoaded', function () {
  // Elementos do DOM
  const relatorioForm = document.getElementById('relatorioForm');
  const tituloRelatorio = document.getElementById('tituloRelatorio');
  const textoRelatorio = document.getElementById('textoRelatorio');
  const caseTitulo = document.getElementById('caseTitulo');
  const caseId = document.getElementById('caseId');
  const caseStatus = document.getElementById('caseStatus');
  const caseResponsavel = document.getElementById('caseResponsavel');
  const caseData = document.getElementById('caseData');
  const spinnerCarregando = document.getElementById('spinnerCarregando');
  const mensagemDiv = document.getElementById('mensagem');
  const voltarBtn = document.getElementById('voltarBtn');
  const cancelarBtn = document.getElementById('cancelarBtn');
  const modalConfirmacao = new bootstrap.Modal(document.getElementById('modalConfirmacao'));
  const confirmarSalvarBtn = document.getElementById('confirmarSalvarBtn');

  // API base URL
  const API_BASE_URL = 'https://case-api-icfc.onrender.com';

  // Obter ID do caso da URL
  const urlParams = new URLSearchParams(window.location.search);
  const casoId = urlParams.get('id');

  if (!casoId) {
    mostrarMensagem('Nenhum caso especificado. Redirecionando...', 'erro');
    setTimeout(() => {
      window.location.href = '../inicio/inicio.html';
    }, 2000);
    return;
  }

  // Carregar detalhes do caso
  carregarDetalhesCaso();

  // Verificar se já existe um relatório para este caso
  verificarRelatorioExistente();

  // Handler para o envio do formulário
  relatorioForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // Mostrar modal de confirmação antes de salvar
    modalConfirmacao.show();
  });

  // Confirmar salvamento do relatório
  confirmarSalvarBtn.addEventListener('click', function () {
    modalConfirmacao.hide();
    salvarRelatorio();
  });

  // Funções auxiliares
  async function carregarDetalhesCaso() {
    try {
      exibirSpinner(true);

      const response = await fetch(`${API_BASE_URL}/api/casos/${casoId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do caso');
      }

      const caso = await response.json();

      // Preencher dados do caso na preview
      caseTitulo.textContent = caso.titulo;
      caseId.textContent = caso._id;
      caseStatus.textContent = caso.status;
      caseResponsavel.textContent = caso.responsavel ? caso.responsavel.nome : 'Não atribuído';

      // Formatar data
      const data = new Date(caso.criadoEm);
      caseData.textContent = data.toLocaleDateString('pt-BR');

      // Se o caso já estiver finalizado, alertar e redirecionar
      if (caso.status === 'Finalizado') {
        mostrarMensagem(
          'Este caso já foi finalizado e possui um relatório. Redirecionando...',
          'erro'
        );
        setTimeout(() => {
          window.location.href = `abrir-caso.html?id=${casoId}`;
        }, 3000);
      }
    } catch (error) {
      console.error('Erro:', error);
      mostrarMensagem('Erro ao carregar detalhes do caso. Por favor, tente novamente.', 'erro');
    } finally {
      exibirSpinner(false);
    }
  }

  async function verificarRelatorioExistente() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/relatorios/${casoId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Já existe um relatório
        mostrarMensagem('Este caso já possui um relatório final. Redirecionando...', 'erro');
        setTimeout(() => {
          window.location.href = `abrir-caso.html?id=${casoId}`;
        }, 3000);
      }
      // Se retornar 404, significa que não existe relatório, o que é o comportamento esperado
    } catch (error) {
      console.error('Erro ao verificar relatório:', error);
      // Não exibimos mensagem de erro aqui, pois é esperado que retorne 404 quando não há relatório
    }
  }

  async function salvarRelatorio() {
    try {
      if (!tituloRelatorio.value || !textoRelatorio.value) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
        return;
      }

      exibirSpinner(true);

      const dados = {
        titulo: tituloRelatorio.value,
        texto: textoRelatorio.value
      };

      const response = await fetch(`${API_BASE_URL}/api/relatorios/${casoId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar relatório');
      }

      const result = await response.json();

      mostrarMensagem('Relatório final criado com sucesso! O caso foi finalizado.', 'sucesso');

      // Adicionar botão para baixar PDF
      const baixarPdfBtn = document.createElement('button');
      baixarPdfBtn.className = 'btn btn-outline-secondary mt-3';
      baixarPdfBtn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Baixar Relatório em PDF';
      baixarPdfBtn.onclick = function () {
        window.open(`${API_BASE_URL}/api/relatorios/${casoId}/pdf`, '_blank');
      };
      mensagemDiv.appendChild(baixarPdfBtn);

      // Desabilitar formulário
      tituloRelatorio.disabled = true;
      textoRelatorio.disabled = true;
      document.getElementById('salvarRelatorioBtn').disabled = true;

      // Redirecionar após um breve momento
      setTimeout(() => {
        window.location.href = `abrir-caso.html?id=${casoId}`;
      }, 5000);
    } catch (error) {
      console.error('Erro:', error);
      mostrarMensagem(`Erro ao salvar relatório: ${error.message}`, 'erro');
    } finally {
      exibirSpinner(false);
    }
  }

  function mostrarMensagem(texto, tipo) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.style.display = 'block';

    // Rolar para a mensagem
    mensagemDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function exibirSpinner(mostrar) {
    spinnerCarregando.style.display = mostrar ? 'block' : 'none';
  }

  // Atualizar exibição da data/hora atual
  function atualizarDataHora() {
    const now = new Date();
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = now.toLocaleString('pt-BR', options);
  }

  // Exibir informações do usuário logado
  function exibirInfoUsuario() {
    const userRole = localStorage.getItem('userRole');
    document.getElementById('userRoleDisplay').textContent = userRole || 'Usuário';

    // Mostrar/esconder link de gerenciamento de usuários baseado no papel
    const isAdmin = userRole === 'Administrador';
    document.querySelectorAll('.hidden-feature').forEach(el => {
      el.style.display = isAdmin ? 'block' : 'none';
    });
  }

  // Inicialização
  atualizarDataHora();
  setInterval(atualizarDataHora, 60000); // Atualiza a cada minuto
  exibirInfoUsuario();
});
