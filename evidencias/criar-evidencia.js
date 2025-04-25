document.addEventListener('DOMContentLoaded', () => {
  const evidenciaForm = document.getElementById('evidenciaForm');
  const casoIdInput = document.getElementById('casoId');
  const tituloInput = document.getElementById('titulo');
  const descricaoInput = document.getElementById('descricao');
  const localColetaInput = document.getElementById('localColeta');
  const dataColetaInput = document.getElementById('dataColeta');
  const arquivoInput = document.getElementById('arquivo');
  const evidenciaMensagemDiv = document.getElementById('evidenciaMensagem');

  const apiUrlEvidencias = 'http://localhost:8080/api/evidences'; // Mantenha este endpoint

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
    casoIdInput.value = casoId;
  } else {
    evidenciaMensagemDiv.textContent = 'ID do caso não encontrado na URL.';
    evidenciaMensagemDiv.className = 'mensagem erro';
    //evidenciaForm.style.display = 'none';
  }

  // Evento de submit do formulário de criação de evidência
  evidenciaForm.addEventListener('submit', async e => {
    e.preventDefault();

    const titulo = tituloInput.value;
    const descricao = descricaoInput.value;
    const localColeta = localColetaInput.value;
    const dataColeta = dataColetaInput.value;
    const arquivo = arquivoInput.files[0];
    const caso = casoIdInput.value;

    if (!titulo || !dataColeta || !arquivo || !caso) {
      evidenciaMensagemDiv.textContent =
        'Por favor, preencha todos os campos obrigatórios e selecione um arquivo.';
      evidenciaMensagemDiv.className = 'mensagem erro';
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('localColeta', localColeta);
    formData.append('dataColeta', dataColeta);
    formData.append('arquivo', arquivo); // O nome 'arquivo' deve corresponder ao middleware
    formData.append('caso', caso);

    try {
      const response = await fetch(apiUrlEvidencias, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData // Envia o FormData para incluir o arquivo
      });

      const data = await response.json();

      if (response.ok) {
        evidenciaMensagemDiv.textContent = data.message || 'Evidência criada com sucesso!';
        evidenciaMensagemDiv.className = 'mensagem sucesso';
        evidenciaForm.reset();
        window.location.href = `listar-evidencias.html?casoId=${caso}`;
      } else {
        evidenciaMensagemDiv.textContent = data.message || 'Erro ao criar evidência.';
        evidenciaMensagemDiv.className = 'mensagem erro';
      }
    } catch (error) {
      console.error('Erro ao criar evidência:', error);
      evidenciaMensagemDiv.textContent = 'Erro ao criar evidência.';
      evidenciaMensagemDiv.className = 'mensagem erro';
    }
  });
});
