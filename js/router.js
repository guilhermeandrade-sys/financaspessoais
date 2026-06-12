// Navegação SPA entre views

const VIEWS = {
  home:        renderizarHome,
  lancamentos: renderizarLancamentos,
  analise:     renderizarAnalise,
  patrimonio:  renderizarPatrimonio,
  projecao:    renderizarProjecao,
  orcamento:   renderizarOrcamentoConfig,
};

let viewAtual = 'home';

// Parâmetros passados entre views (ex: filtro de categoria)
let _navegacaoParams = null;

function pegarParams() {
  const p = _navegacaoParams;
  _navegacaoParams = null;
  return p;
}

function navegarPara(view, params) {
  if (!VIEWS[view]) return;
  viewAtual = view;

  if (params) _navegacaoParams = params;

  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.view === view);
  });

  VIEWS[view]();
}

function toggleTema() {
  const claro = document.body.classList.toggle('light-mode');
  localStorage.setItem('temaClaro', claro ? '1' : '');
  document.getElementById('btn-tema').textContent = claro ? '☀️' : '🌙';
}

function inicializarApp() {
  // Restaura preferência de tema
  if (localStorage.getItem('temaClaro')) {
    document.body.classList.add('light-mode');
    document.getElementById('btn-tema').textContent = '☀️';
  }

  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      modoRevisar = false; // sair do modo "A revisar" ao trocar de aba
      navegarPara(btn.dataset.view);
    });
  });

  document.getElementById('fab').addEventListener('click', () => {
    abrirFormNovoLancamento(() => {
      if (viewAtual === 'home') renderizarHome();
      else if (viewAtual === 'lancamentos') renderizarLancamentos();
    });
  });

  verificarRecorrenciasPendentes();
  navegarPara('home');
}
