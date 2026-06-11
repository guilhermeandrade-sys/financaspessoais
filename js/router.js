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

function inicializarApp() {
  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.addEventListener('click', () => navegarPara(btn.dataset.view));
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
