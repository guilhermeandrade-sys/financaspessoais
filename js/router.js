// Navegação SPA entre views

const VIEWS = {
  home:        renderizarHome,
  lancamentos: renderizarLancamentos,
  analise:     renderizarAnalise,
  patrimonio:  renderizarPatrimonio,
};

let viewAtual = 'home';

function navegarPara(view) {
  if (!VIEWS[view]) return;
  viewAtual = view;

  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.view === view);
  });

  VIEWS[view]();
}

function inicializarApp() {
  // Tab bar
  document.querySelectorAll('.tab-item').forEach((btn) => {
    btn.addEventListener('click', () => navegarPara(btn.dataset.view));
  });

  // FAB
  document.getElementById('fab').addEventListener('click', () => {
    abrirFormNovoLancamento(() => {
      if (viewAtual === 'home') renderizarHome();
      else if (viewAtual === 'lancamentos') renderizarLancamentos();
    });
  });

  // Verifica recorrências pendentes do mês
  verificarRecorrenciasPendentes();

  // Renderiza view inicial
  navegarPara('home');
}

// Inicializa o app assim que a sessão for confirmada em auth.js
// (chamado por auth.js após login ou sessão válida)
