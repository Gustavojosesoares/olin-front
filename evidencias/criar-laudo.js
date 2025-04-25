document.addEventListener('DOMContentLoaded', () => {
  const laudoForm = document.getElementById('laudoForm');
  const evidenciaIdInput = document.getElementById('evidenciaId');
  const evidenciaIdExibicaoSpan = document.getElementById('evidenciaIdExibicao');
  const tituloInput = document.getElementById('titulo');
  const descricaoInput = document.getElementById('descricao');
  const conclusaoInput = document.getElementById('conclusao');
  const anexosInput = document.getElementById('anexos');
  const mensagemDiv = document.getElementById('mensagem');

  // Função para obter o token do localStorage
  function getToken() {
    return localStorage.getItem('authToken');
  }

  // Função para obter o ID da evidência da URL
  function getEvidenciaIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('evidenciaId');
  }

  const evidenciaId = getEvidenciaIdFromUrl();

  if (evidenciaId) {
    evidenciaIdInput.value = evidenciaId;
    evidenciaIdExibicaoSpan.textContent = evidenciaId;
  } else {
    mensagemDiv.textContent = 'ID da evidência não fornecido.';
    mensagemDiv.className = 'mensagem erro';
    //laudoForm.style.display = 'none';
  }

  laudoForm.addEventListener('submit', async e => {
    e.preventDefault();

    const titulo = tituloInput.value;
    const descricao = descricaoInput.value;
    const conclusao = conclusaoInput.value;
    const anexos = anexosInput.files;
    const evidencia = evidenciaIdInput.value;

    if (!evidencia) {
      mensagemDiv.textContent = 'Erro: Evidência não identificada.';
      mensagemDiv.className = 'mensagem erro';
      return;
    }

    const formData = new FormData();
    formData.append('evidenciaId', evidencia);
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('conclusao', conclusao);
    for (let i = 0; i < anexos.length; i++) {
      formData.append('anexos', anexos[i]); // 'anexos' será o nome do campo para os arquivos no backend
    }

    try {
      const response = await fetch('http://localhost:8080/api/laudos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        mensagemDiv.textContent = data.message || 'Laudo criado com sucesso!';
        mensagemDiv.className = 'mensagem sucesso';
        laudoForm.reset();
        // Redirecionar de volta para a página de detalhes da evidência
        window.location.href = `abrir-evidencia.html?id=${evidencia}`;
      } else {
        mensagemDiv.textContent = data.message || 'Erro ao criar laudo.';
        mensagemDiv.className = 'mensagem erro';
      }
    } catch (error) {
      console.error('Erro ao criar laudo:', error);
      mensagemDiv.textContent = 'Erro ao criar laudo.';
      mensagemDiv.className = 'mensagem erro';
    }
  });
});
