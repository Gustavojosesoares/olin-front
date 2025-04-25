document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const casoId = params.get('id');

  if (!casoId) {
    document.getElementById('mensagem').textContent = 'ID do caso não fornecido na URL.';
    return;
  }

  try {
    const response = await fetch(`https://case-api-icfc.onrender.com/api/casos/${casoId}`);
    if (!response.ok) throw new Error('Erro ao buscar o caso.');

    const caso = await response.json();

    // Preenche os dados
    document.getElementById('casoTitulo').textContent = caso.titulo;
    document.getElementById('casoDescricao').textContent = caso.descricao;
    document.getElementById('casoData').textContent = new Date(caso.data).toLocaleDateString();
    document.getElementById('casoStatus').textContent = caso.status;
    document.getElementById('casoPerito').textContent = caso.peritoResponsavel?.name || 'N/A';
    document.getElementById('casoLocal').textContent = caso.localDoCaso;

    // Atualiza links dos botões com ID
    document.querySelector("a[href='evidencias.html']").href = `evidencias.html?id=${casoId}`;
    document.querySelector(
      "a[href='relatorio-final.html']"
    ).href = `relatorio-final.html?id=${casoId}`;
  } catch (error) {
    console.error(error);
    document.getElementById('mensagem').textContent = 'Erro ao carregar os dados do caso.';
  }
});

document.getElementById('btnSalvarObservacao').addEventListener('click', async () => {
  const observacao = document.getElementById('observacao').value.trim();
  const casoId = new URLSearchParams(window.location.search).get('id');

  if (!observacao) {
    return alert('Por favor, preencha a observação antes de salvar.');
  }

  try {
    const response = await fetch(`https://case-api-icfc.onrender.com/api/casos/${casoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descricao: observacao // Se for campo separado, altere para "observacao"
      })
    });

    if (!response.ok) throw new Error('Erro ao salvar observação.');

    document.getElementById('mensagem').textContent = 'Observação salva com sucesso.';
    document.getElementById('mensagem').classList.remove('text-danger');
    document.getElementById('mensagem').classList.add('text-success');
  } catch (error) {
    console.error(error);
    document.getElementById('mensagem').textContent = 'Erro ao salvar a observação.';
    document.getElementById('mensagem').classList.add('text-danger');
  }
});
