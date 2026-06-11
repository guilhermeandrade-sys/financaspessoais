// View: Lista de Lançamentos

let mesListagem = new Date().getMonth() + 1;
let anoListagem = new Date().getFullYear();
let filtroCategoria = '';
let filtroSubcategoria = '';

async function renderizarLancamentos() {
  // Absorve parâmetros vindos de outra view (ex: clique na home)
  const params = pegarParams();
  if (params) {
    if (params.mes)  mesListagem  = params.mes;
    if (params.ano)  anoListagem  = params.ano;
    if (params.categoria !== undefined)    filtroCategoria    = params.categoria    || '';
    if (params.subcategoria !== undefined) filtroSubcategoria = params.subcategoria || '';
  }

  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const { data: todos, error } = await buscarLancamentosPorMes(anoListagem, mesListagem);
  if (error) {
    conteudo.innerHTML = '<p class="erro centralizado">Erro ao carregar lançamentos.</p>';
    return;
  }

  // Subcategorias disponíveis para a categoria filtrada
  const subcatsDisponiveis = filtroCategoria
    ? [...new Set((todos || []).filter(l => l.categoria === filtroCategoria && l.subcategoria).map(l => l.subcategoria))].sort()
    : [];

  // Aplica filtros
  const lancamentos = (todos || []).filter((l) => {
    if (filtroCategoria    && l.categoria    !== filtroCategoria)    return false;
    if (filtroSubcategoria && l.subcategoria !== filtroSubcategoria) return false;
    return true;
  });

  // Opções de categoria únicas
  const categorias = [...new Set((todos || []).map(l => l.categoria))].sort();

  const selCatOpts = `<option value="">Todas as categorias</option>` +
    categorias.map(c => `<option value="${c}" ${filtroCategoria === c ? 'selected' : ''}>${c}</option>`).join('');

  const selSubOpts = filtroCategoria
    ? `<option value="">Todas as subcategorias</option>` +
      subcatsDisponiveis.map(s => `<option value="${s}" ${filtroSubcategoria === s ? 'selected' : ''}>${s}</option>`).join('')
    : '';

  const itens = lancamentos.map((l) => `
    <div class="lancamento-item" onclick="abrirEdicaoLancamento('${l.id}')">
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao">${l.descricao}</div>
        <div class="lancamento-item__meta">
          ${formatarData(l.data_evento)} · ${l.categoria}${l.subcategoria ? ' / ' + l.subcategoria : ''} · ${l.meio}
          ${l.parcela_total > 1 ? ` · ${l.parcela_atual}/${l.parcela_total}` : ''}
          ${l.observacao ? `<br><span class="lancamento-item__obs">📝 ${l.observacao}</span>` : ''}
        </div>
      </div>
      <div class="lancamento-item__valor ${l.valor >= 0 ? 'positivo' : 'negativo'}">
        ${formatarMoeda(l.valor)}
      </div>
    </div>
  `).join('');

  const totalFiltrado = lancamentos.reduce((s, l) => s + l.valor, 0);
  const temFiltro = filtroCategoria || filtroSubcategoria;

  conteudo.innerHTML = `
    <div class="view-header">
      <nav class="nav-mes">
        <button class="nav-mes__btn" id="list-mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(anoListagem, mesListagem)}</span>
        <button class="nav-mes__btn" id="list-mes-proximo">›</button>
      </nav>
    </div>

    <div class="filtros-lancamentos">
      <select id="filtro-cat" class="filtro-select">
        ${selCatOpts}
      </select>
      ${filtroCategoria ? `
      <select id="filtro-subcat" class="filtro-select">
        ${selSubOpts}
      </select>` : ''}
      ${temFiltro ? `<button class="filtro-limpar" onclick="limparFiltros()">✕ Limpar</button>` : ''}
    </div>

    ${temFiltro ? `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--esp-sm);font-size:var(--tam-sm)">
      <span class="texto-secundario">${lancamentos.length} lançamento${lancamentos.length !== 1 ? 's' : ''}</span>
      <span class="negrito ${totalFiltrado >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(totalFiltrado)}</span>
    </div>` : ''}

    <div class="card">
      ${itens || '<p class="texto-secundario centralizado" style="padding:var(--esp-lg)">Nenhum lançamento encontrado.</p>'}
    </div>
  `;

  document.getElementById('list-mes-anterior').onclick = () => {
    mesListagem--;
    if (mesListagem < 1) { mesListagem = 12; anoListagem--; }
    renderizarLancamentos();
  };
  document.getElementById('list-mes-proximo').onclick = () => {
    mesListagem++;
    if (mesListagem > 12) { mesListagem = 1; anoListagem++; }
    renderizarLancamentos();
  };

  document.getElementById('filtro-cat').onchange = (e) => {
    filtroCategoria = e.target.value;
    filtroSubcategoria = '';
    renderizarLancamentos();
  };

  const selSub = document.getElementById('filtro-subcat');
  if (selSub) {
    selSub.onchange = (e) => {
      filtroSubcategoria = e.target.value;
      renderizarLancamentos();
    };
  }
}

function limparFiltros() {
  filtroCategoria = '';
  filtroSubcategoria = '';
  renderizarLancamentos();
}

async function abrirEdicaoLancamento(id) {
  const { data: lancamentos } = await buscarLancamentosPorMes(anoListagem, mesListagem);
  const l = (lancamentos || []).find((x) => x.id === id);
  if (!l) return;

  abrirBottomSheet(htmlFormLancamento(l));
  inicializarFormLancamento(async (dados) => {
    const { error } = await atualizarLancamento(id, {
      descricao:    dados.descricao,
      valor:        dados.valor,
      data_evento:  dados.data_evento,
      categoria:    dados.categoria,
      subcategoria: dados.subcategoria,
      meio:         dados.meio,
      tipo:         dados.tipo,
      observacao:   dados.observacao,
    });
    if (error) {
      mostrarToast('Erro ao salvar.', 'erro');
    } else {
      fecharBottomSheet();
      mostrarToast('Lançamento atualizado!', 'sucesso');
      renderizarLancamentos();
    }
  });

  const painel = document.getElementById('bottom-sheet__conteudo');
  const btnExcluir = document.createElement('button');
  btnExcluir.className = 'btn btn--perigo';
  btnExcluir.textContent = 'Excluir lançamento';
  btnExcluir.onclick = async () => {
    if (!confirm('Excluir este lançamento?')) return;
    const { error } = await deletarLancamento(id);
    if (error) {
      mostrarToast('Erro ao excluir.', 'erro');
    } else {
      fecharBottomSheet();
      mostrarToast('Lançamento excluído.', 'sucesso');
      renderizarLancamentos();
    }
  };
  painel.appendChild(btnExcluir);
}
