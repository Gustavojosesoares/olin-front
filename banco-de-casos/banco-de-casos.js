// Referências dos elementos do DOM
const searchInput = document.getElementById('pesquisarCasos');
const filtroStatus = document.getElementById('filtroStatus');
const filtroPerito = document.getElementById('filtroPerito');
const filtroDataInicio = document.getElementById('filtroDataInicio');
const filtroDataFim = document.getElementById('filtroDataFim');
const btnMostrarFiltros = document.getElementById('btnMostrarFiltros');
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
const filtrosAvancados = document.getElementById('filtrosAvancados');
const casosList = document.getElementById('casosList');
const totalLabel = document.getElementById('totalCasosLabel');
const paginaAtual = document.getElementById('paginaAtual');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');

let todosCasos = [];
let pagina = 1;
const porPagina = 10;

// Buscar casos com token da API
async function carregarCasos() {
  const token = localStorage.getItem('token');
  try {
    const resposta = await fetch('https://case-api-icfc.onrender.com/cases', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resposta.json();
    todosCasos = data;
    aplicarFiltros(); // já aplica os filtros ao carregar
  } catch (erro) {
    casosList.innerHTML = '<tr><td colspan="4">Erro ao carregar os casos.</td></tr>';
  }
}

// Aplicar os filtros e atualizar a tabela
function aplicarFiltros() {
  const termo = searchInput.value.toLowerCase();
  const status = filtroStatus.value;
  const perito = filtroPerito.value.toLowerCase();
  const dataInicio = filtroDataInicio.value;
  const dataFim = filtroDataFim.value;

  const filtrados = todosCasos.filter(caso => {
    const titulo = caso.titulo?.toLowerCase() || '';
    const local = caso.localDoCaso?.toLowerCase() || '';
    const nomePerito = caso.peritoResponsavel?.name?.toLowerCase() || '';
    const dataCaso = new Date(caso.data);

    return (
      (titulo.includes(termo) || local.includes(termo)) &&
      (!status || caso.status === status) &&
      (!perito || nomePerito.includes(perito)) &&
      (!dataInicio || dataCaso >= new Date(dataInicio)) &&
      (!dataFim || dataCaso <= new Date(dataFim))
    );
  });

  exibirPagina(filtrados);
}

// Exibir os casos filtrados paginados
function exibirPagina(lista) {
  const inicio = (pagina - 1) * porPagina;
  const fim = pagina * porPagina;
  const paginaDados = lista.slice(inicio, fim);

  casosList.innerHTML = '';
  if (paginaDados.length === 0) {
    casosList.innerHTML = '<tr><td colspan="4">Nenhum caso encontrado.</td></tr>';
  } else {
    for (const caso of paginaDados) {
      casosList.innerHTML += `
        <tr>
          <td>${caso.titulo}</td>
          <td>${new Date(caso.data).toLocaleDateString()}</td>
          <td>${caso.peritoResponsavel?.name || 'N/A'}</td>
          <td>${caso.descricao}</td>
        </tr>`;
    }
  }

  totalLabel.textContent = `Total: ${lista.length}`;
  const totalPaginas = Math.ceil(lista.length / porPagina);
  paginaAtual.textContent = `${pagina} / ${totalPaginas}`;
  prevPage.disabled = pagina === 1;
  nextPage.disabled = pagina === totalPaginas;
}

// Eventos
searchInput.addEventListener('input', () => {
  pagina = 1;
  aplicarFiltros();
});

btnMostrarFiltros.addEventListener('click', () => {
  filtrosAvancados.classList.toggle('d-none');
});

btnAplicarFiltros.addEventListener('click', () => {
  pagina = 1;
  aplicarFiltros();
});

[filtroStatus, filtroPerito, filtroDataInicio, filtroDataFim].forEach(el => {
  el.addEventListener('change', () => {
    pagina = 1;
    aplicarFiltros();
  });
});

prevPage.addEventListener('click', () => {
  pagina--;
  aplicarFiltros();
});

nextPage.addEventListener('click', () => {
  pagina++;
  aplicarFiltros();
});

// Inicial
carregarCasos();
