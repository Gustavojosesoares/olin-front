// Funções utilitárias para uso em todo o sistema

// Formatar data para exibição
export function formatarData(dataString) {
  if (!dataString) return '-';

  const data = new Date(dataString);
  if (isNaN(data.getTime())) return '-';

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Exibir mensagem de feedback
export function exibirMensagem(texto, tipo = 'info') {
  const mensagemEl = document.getElementById('mensagem');
  if (!mensagemEl) return;

  // Definir classes com base no tipo de mensagem
  let classes = 'mensagem p-3 rounded mb-3 ';
  switch (tipo) {
    case 'success':
      classes += 'bg-success text-white';
      break;
    case 'error':
      classes += 'bg-danger text-white';
      break;
    case 'warning':
      classes += 'bg-warning text-dark';
      break;
    default:
      classes += 'bg-info text-dark';
  }

  mensagemEl.className = classes;
  mensagemEl.textContent = texto;

  // Fazer a mensagem desaparecer após alguns segundos
  setTimeout(() => {
    mensagemEl.textContent = '';
    mensagemEl.className = 'mensagem';
  }, 5000);
}

// Carregar usuário atual do localStorage
export async function carregarUsuarioAtual() {
  const usuarioString = localStorage.getItem('usuarioAtual');
  if (!usuarioString) return null;

  try {
    return JSON.parse(usuarioString);
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    return null;
  }
}

// Atualizar exibição de data e hora atuais
export function atualizarHoraData() {
  const dateTimeEl = document.getElementById('currentDateTime');
  if (!dateTimeEl) return;

  const atualizarHora = () => {
    const agora = new Date();
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    dateTimeEl.textContent = agora.toLocaleDateString('pt-BR', options);
  };

  atualizarHora();
  setInterval(atualizarHora, 1000);
}

// Gerar ID único
export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
