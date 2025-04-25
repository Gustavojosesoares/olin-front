document.addEventListener('DOMContentLoaded', () => {
  const listaDeEvidenciasDiv = document.getElementById('listaDeEvidencias');
  const evidenciasList = document.getElementById('evidenciasList');
  const criarEvidenciaLink = document.getElementById('criarEvidenciaLink');
  const mensagemDiv = document.getElementById('mensagem');

  const apiUrlEvidencias = 'http://localhost:8080/api/evidences';

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
  if (!casoId) {
    mensagemDiv.textContent = 'ID do caso não encontrado na URL.';
    mensagemDiv.className = 'mensagem erro';
    listaDeEvidenciasDiv.style.display = 'none';
    if (criarEvidenciaLink) criarEvidenciaLink.style.display = 'none';
  } else {
    carregarEvidenciasDoCaso(casoId);
    if (criarEvidenciaLink) {
      criarEvidenciaLink.href = `criar-evidencia.html?casoId=${casoId}`;
    }
  }

  // Função para carregar as evidências do caso
  async function carregarEvidenciasDoCaso(casoId) {
    try {
      const response = await fetch(`${apiUrlEvidencias}?casoId=${casoId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (!response.ok) {
        throw new Error(`Erro ao carregar evidências: ${response.status}`);
      }
      const evidencias = await response.json();
      exibirEvidencias(evidencias);
    } catch (error) {
      console.error('Erro ao carregar evidências:', error);
      mensagemDiv.textContent = 'Erro ao carregar as evidências do caso.';
      mensagemDiv.className = 'mensagem erro';
    }
  }

  // Função para exibir as evidências na lista
  function exibirEvidencias(evidencias) {
    evidenciasList.innerHTML = '';
    if (evidencias && evidencias.length > 0) {
      evidencias.forEach(evidencia => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
                    <strong>Título:</strong> ${evidencia.titulo || 'Sem título'} -
                    <strong>Data Coleta:</strong> ${new Date(
                      evidencia.dataColeta
                    ).toLocaleDateString()} -
                    <strong>Tipo:</strong> ${evidencia.tipoArquivo}
                    <div class="evidencia-acoes">
                        <button class="visualizar-button" data-evidencia-id="${
                          evidencia._id
                        }">Visualizar</button>
                        ${
                          ['admin', 'perito'].includes(getUserRole())
                            ? `<button class="criar-laudo-button" data-evidencia-id="${evidencia._id}" data-caso-id="${casoId}">Criar Laudo</button>`
                            : ''
                        }
                    </div>
                `;
        evidenciasList.appendChild(listItem);
      });

      // Adicionar eventos para os botões de visualizar
      const visualizarButtons = evidenciasList.querySelectorAll('.visualizar-button');
      visualizarButtons.forEach(button => {
        button.addEventListener('click', function () {
          const evidenciaId = this.getAttribute('data-evidencia-id');
          window.location.href = `visualizar-evidencia.html?evidenciaId=${evidenciaId}`;
        });
      });

      // Adicionar eventos para os botões de criar laudo
      const criarLaudoButtons = evidenciasList.querySelectorAll('.criar-laudo-button');
      criarLaudoButtons.forEach(button => {
        button.addEventListener('click', function () {
          const casoId = this.getAttribute('data-caso-id');
          window.location.href = `criar-laudo.html?casoId=${casoId}&evidenciaId=${this.getAttribute(
            'data-evidencia-id'
          )}`;
        });
      });
    } else {
      evidenciasList.textContent = 'Nenhuma evidência encontrada para este caso.';
    }
  }

  // Função para obter o papel do usuário a partir do token
  function getUserRole() {
    const token = getToken();
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return payload.role; // Assumindo que o 'role' está no payload do token
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return null;
      }
    }
    return null;
  }
});
