document.addEventListener('DOMContentLoaded', () => {
  const casoIdExibicao = document.getElementById('casoIdExibicao');
  const casoIdInput = document.getElementById('casoId');
  const relatorioFinalForm = document.getElementById('relatorioFinalForm');
  const mensagemDiv = document.getElementById('mensagem');

  // Função para obter o token do localStorage
  function getToken() {
    return localStorage.getItem('authToken');
  }

  // Função para obter o ID do caso da URL
  function getCasoIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('casoId');
  }

  const casoId = getCasoIdFromUrl();

  if (casoId) {
    casoIdExibicao.textContent = casoId;
    casoIdInput.value = casoId;
  } else {
    mensagemDiv.textContent = 'ID do caso não encontrado na URL.';
    mensagemDiv.className = 'mensagem erro';
  }

  relatorioFinalForm.addEventListener('submit', async event => {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const texto = document.getElementById('texto').value;

    if (!titulo || !texto) {
      mensagemDiv.textContent = 'Por favor, preencha o título e o texto do relatório.';
      mensagemDiv.className = 'mensagem erro';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/relatorios/${casoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ titulo, texto })
      });

      const data = await response.json();

      if (response.ok) {
        mensagemDiv.textContent = data.message;
        mensagemDiv.className = 'mensagem sucesso';
        // Redirecionar para a página de detalhes do caso ou outra página relevante
        setTimeout(() => {
          window.location.href = `../casos/abrir-caso.html?id=${casoId}`;
        }, 2000);
      } else {
        mensagemDiv.textContent = data.error || 'Erro ao criar relatório final.';
        mensagemDiv.className = 'mensagem erro';
      }
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      mensagemDiv.textContent = 'Erro ao enviar relatório final.';
      mensagemDiv.className = 'mensagem erro';
    }
  });
});
