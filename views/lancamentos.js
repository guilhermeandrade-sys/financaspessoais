// View: Lista de Lançamentos

let mesListagem = new Date().getMonth() + 1;
let anoListagem = new Date().getFullYear();
let filtroCategoria = '';
let filtroSubcategoria = '';
let filtroBusca = '';

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
    if (filtroBusca && !l.descricao.toLowerCase().includes(filtroBusca.toLowerCase())) return false;
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

  const temFiltro = filtroCategoria || filtroSubcategoria || filtroBusca;

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

  // Resumo do período filtrado
  const receita = lancamentos.filter(l => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const despesa = lancamentos.filter(l => l.valor < 0).reduce((s, l) => s + Math.abs(l.valor), 0);
  const saldo = receita - despesa;

  conteudo.innerHTML = `
    <div class="view-header">
      <nav class="nav-mes">
        <button class="nav-mes__btn" id="list-mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(anoListagem, mesListagem)}</span>
        <button class="nav-mes__btn" id="list-mes-proximo">›</button>
      </nav>
    </div>

    <div class="cards-saldo-grid" style="margin-bottom:var(--esp-md)">
      <div class="card" style="text-align:center">
        <div class="card__titulo">Receita</div>
        <div class="positivo negrito">${formatarMoeda(receita)}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card__titulo">Despesa</div>
        <div class="negativo negrito">${formatarMoeda(despesa)}</div>
      </div>
      <div class="card card--destaque" style="text-align:center">
        <div class="card__titulo">Saldo</div>
        <div class="${saldo >= 0 ? 'positivo' : 'negativo'} negrito">${formatarMoeda(saldo)}</div>
      </div>
    </div>

    <div class="filtros-lancamentos">
      <input id="filtro-busca" class="filtro-select" type="text"
        placeholder="🔍 Buscar descrição…" value="${filtroBusca}"
        style="flex:2;min-width:0" />
      <select id="filtro-cat" class="filtro-select">
        ${selCatOpts}
      </select>
      ${filtroCategoria ? `
      <select id="filtro-subcat" class="filtro-select">
        ${selSubOpts}
      </select>` : ''}
      ${temFiltro ? `<button class="filtro-limpar" onclick="limparFiltros()">✕</button>` : ''}
    </div>

    ${temFiltro ? `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--esp-sm);font-size:var(--tam-sm)">
      <span class="texto-secundario">${lancamentos.length} lançamento${lancamentos.length !== 1 ? 's' : ''}</span>
      <span class="negrito ${saldo >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(saldo)}</span>
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

  let timerBusca = null;
  document.getElementById('filtro-busca').addEventListener('input', (e) => {
    clearTimeout(timerBusca);
    timerBusca = setTimeout(() => {
      filtroBusca = e.target.value;
      renderizarLancamentos();
    }, 300);
  });
}

function limparFiltros() {
  filtroCategoria = '';
  filtroSubcategoria = '';
  filtroBusca = '';
  renderizarLancamentos();
}

async function abrirEdicaoLancamento(id) {
  const { data: l } = await buscarLancamentoPorId(id);
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

  // Botão excluir esta parcela
  const btnExcluir = document.createElement('button');
  btnExcluir.className = 'btn btn--perigo';
  btnExcluir.style.marginTop = 'var(--esp-sm)';
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

  // Botão excluir grupo de parcelas
  if (l.grupo_parcelas && l.parcela_total > 1) {
    const btnGrupo = document.createElement('button');
    btnGrupo.className = 'btn btn--perigo';
    btnGrupo.style.marginTop = 'var(--esp-xs)';
    btnGrupo.textContent = `Excluir todas as ${l.parcela_total} parcelas`;
    btnGrupo.onclick = async () => {
      if (!confirm(`Excluir todas as ${l.parcela_total} parcelas de "${l.descricao.replace(/ \d+\/\d+$/, '')}"?`)) return;
      const { error } = await deletarGrupoParcelas(l.grupo_parcelas);
      if (error) {
        mostrarToast('Erro ao excluir parcelas.', 'erro');
      } else {
        fecharBottomSheet();
        mostrarToast('Todas as parcelas excluídas.', 'sucesso');
        renderizarLancamentos();
      }
    };
    painel.appendChild(btnGrupo);
  }
}
