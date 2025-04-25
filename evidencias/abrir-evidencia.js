let evidenciaIdGlobal; // Declare no escopo global

document.addEventListener('DOMContentLoaded', () => {
  const evidenciaTituloElement = document.getElementById('evidenciaTitulo');
  const evidenciaDescricaoElement = document.getElementById('evidenciaDescricao');
  const evidenciaLocalColetaElement = document.getElementById('evidenciaLocalColeta');
  const evidenciaDataColetaElement = document.getElementById('evidenciaDataColeta');
  const evidenciaArquivoElement = document.getElementById('evidenciaArquivo');
  const criarLaudoBtn = document.getElementById('criarLaudoBtn');
  const mensagemDiv = document.getElementById('mensagem');
  const listaDeLaudosElement = document.getElementById('listaDeLaudos');
  const mensagemLaudosDiv = document.getElementById('mensagemLaudos');

  // Função para obter o token do localStorage
  function getToken() {
    return localStorage.getItem('authToken');
  }

  // Função para obter o ID da evidência da URL
  function getEvidenciaIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    evidenciaIdGlobal = urlParams.get('id'); // Atribui ao escopo global
    return evidenciaIdGlobal;
  }

  const evidenciaId = getEvidenciaIdFromUrl();

  if (!evidenciaId) {
    mensagemDiv.textContent = 'ID da evidência não encontrado.';
    mensagemDiv.className = 'mensagem erro';
  } else {
    carregarDetalhesEvidencia(evidenciaId);
  }

  // Lógica para o botão Criar Laudo
  const criarLaudoButton = document.getElementById('criarLaudoBtn');
  console.log('criarLaudoButton:', criarLaudoButton);

  if (criarLaudoButton && evidenciaIdGlobal) {
    // Use evidenciaIdGlobal aqui
    criarLaudoButton.addEventListener('click', () => {
      console.log('Botão Criar Laudo clicado! Evidencia ID:', evidenciaIdGlobal); // Use aqui
      window.location.href = `criar-laudo.html?evidenciaId=${evidenciaIdGlobal}`; // E aqui
    });
    console.log('Event listener adicionado ao Botão Criar Laudo.');
  } else {
    console.log('Elemento criarLaudoBtn não encontrado ou evidenciaId ausente.');
  }

  async function carregarDetalhesEvidencia(id) {
    const apiUrlEvidencia = `http://localhost:8080/api/evidences/${id}`;
    const apiUrlLaudos = `http://localhost:8080/api/laudos/evidencia/${id}`;

    try {
      const [responseEvidencia, responseLaudos] = await Promise.all([
        fetch(apiUrlEvidencia, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        fetch(apiUrlLaudos, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
      ]);

      if (!responseEvidencia.ok)
        throw new Error(`Erro ao carregar detalhes da evidência: ${responseEvidencia.status}`);
      if (!responseLaudos.ok) {
        mensagemLaudosDiv.textContent = `Erro ao carregar laudos: ${responseLaudos.status}`;
        mensagemLaudosDiv.className = 'mensagem erro';
      }

      const evidencia = await responseEvidencia.json();
      const laudos = await responseLaudos.json();

      exibirDetalhesEvidencia(evidencia);
      exibirLaudosEvidencia(laudos);
    } catch (error) {
      console.error('Erro ao carregar detalhes da evidência e laudos:', error);
      mensagemDiv.textContent = 'Erro ao carregar os detalhes da evidência.';
      mensagemDiv.className = 'mensagem erro';
      mensagemLaudosDiv.textContent = 'Erro ao carregar os laudos associados.';
      mensagemLaudosDiv.className = 'mensagem erro';
    }
  }

  function exibirDetalhesEvidencia(evidencia) {
    evidenciaTituloElement.textContent = evidencia.titulo || '';
    evidenciaDescricaoElement.textContent = evidencia.descricao || '';
    evidenciaLocalColetaElement.textContent = evidencia.localColeta || '';
    evidenciaDataColetaElement.textContent = evidencia.dataColeta
      ? new Date(evidencia.dataColeta).toLocaleDateString()
      : '';
    evidenciaArquivoElement.textContent = evidencia.arquivoNome || 'Arquivo não disponível';
  }

  function exibirLaudosEvidencia(laudos) {
    listaDeLaudosElement.innerHTML = '';
    if (laudos && laudos.length > 0) {
      laudos.forEach(laudo => {
        const listItem = document.createElement('li');
        listItem.textContent = `Título: ${laudo.titulo || 'Sem título'} - Conclusão: ${
          laudo.conclusao ? laudo.conclusao.substring(0, 50) + '...' : 'Sem conclusão'
        }`;
        const abrirLaudoButton = document.createElement('button');
        abrirLaudoButton.textContent = 'Abrir Laudo';
        abrirLaudoButton.classList.add('abrir-laudo-button');
        abrirLaudoButton.addEventListener('click', () => {
          window.location.href = `abrir-laudo.html?id=${laudo._id}`;
        });
        listItem.appendChild(abrirLaudoButton);
        listaDeLaudosElement.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = 'Nenhum laudo associado a esta evidência.';
      listaDeLaudosElement.appendChild(listItem);
    }
  }
});
