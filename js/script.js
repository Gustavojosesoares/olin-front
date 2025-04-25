// js/script.js

import { getCasosPorUsuario } from '../api/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Obter o ID do usuário autenticado do localStorage
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('Usuário não autenticado.');
    return;
  }

  // Buscar casos do usuário
  const casos = await getCasosPorUsuario(userId);

  // Renderizar casos na tabela
  renderizarCasos(casos);

  // Atualizar estatísticas
  atualizarEstatisticas(casos);
});

// Função para renderizar casos na tabela
function renderizarCasos(casos) {
  const tbody = document.getElementById('casosList');
  tbody.innerHTML = '';

  casos.forEach(caso => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${caso.codigo}</td>
      <td>${formatarData(caso.dataAbertura)}</td>
      <td>${formatarData(caso.ultimaAtualizacao)}</td>
      <td>${caso.observacao}</td>
    `;

    tbody.appendChild(tr);
  });

  // Atualizar total de casos
  document.getElementById('totalCasosLabel').textContent = `Total: ${casos.length}`;
}

// Função para atualizar estatísticas
function atualizarEstatisticas(casos) {
  const total = casos.length;
  const emAndamento = casos.filter(c => c.status === 'Em Andamento').length;
  const finalizados = casos.filter(c => c.status === 'Finalizado').length;
  const arquivados = casos.filter(c => c.status === 'Arquivado').length;

  document.getElementById('totalCasos').textContent = total;
  document.getElementById('casosAndamento').textContent = emAndamento;
  document.getElementById('casosFinalizados').textContent = finalizados;
  document.getElementById('casosArquivados').textContent = arquivados;
}

// Função para formatar datas
function formatarData(data) {
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
}



