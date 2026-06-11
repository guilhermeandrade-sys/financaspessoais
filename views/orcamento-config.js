// View: Configuração de Orçamento + Recorrências

let _orcMesRef = new Date().getMonth() + 1;
let _orcAnoRef = new Date().getFullYear();
let _orcAba = 'orcamento'; // 'orcamento' | 'recorrencias'

async function renderizarOrcamentoConfig() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const validoAPartir = `${_orcAnoRef}-${String(_orcMesRef).padStart(2, '0')}-01`;
  const { data: orcamentos, error } = await buscarOrcamentoPorMes(_orcAnoRef, _orcMesRef);
  if (error) {
    conteudo.innerHTML = '<p class="erro centralizado">Erro ao carregar orçamento.</p>';
    return;
  }

  // Agrupa por categoria
  const porCategoria = {};
  for (const item of orcamentos || []) {
    const cat = item.categoria;
    if (!porCategoria[cat]) porCategoria[cat] = { total: null, subcats: [] };
    if (!item.subcategoria) {
      porCategoria[cat].total = item;
    } else {
      porCategoria[cat].subcats.push(item);
    }
  }

  // Todas as categorias do config (para exibir mesmo sem orçamento cadastrado)
  for (const cat of CATEGORIAS) {
    if (!porCategoria[cat]) porCategoria[cat] = { total: null, subcats: [] };
  }

  const blocos = CATEGORIAS.map((cat) => {
    const tipo = TIPO_POR_CATEGORIA[cat] || '—';
    const grupo = porCategoria[cat] || { total: null, subcats: [] };
    const subcatsConf = (SUBCATEGORIAS[cat] || []);

    // Subcategorias já com orçamento
    const subcatsComOrc = grupo.subcats.map((s) => s.subcategoria);
    // Subcategorias sem orçamento ainda
    const subcatsSemOrc = subcatsConf.filter((s) => !subcatsComOrc.includes(s));

    const linhasSubcat = [
      ...grupo.subcats.map((s) => _htmlLinhaSubcat(cat, s.subcategoria, s.valor_mensal, s.id)),
      ...subcatsSemOrc.map((s) => _htmlLinhaSubcat(cat, s, 0, null)),
    ];

    // Subcategorias extras (no BD mas não na config)
    const subcatsExtra = grupo.subcats
      .filter((s) => !subcatsConf.includes(s.subcategoria))
      .map((s) => _htmlLinhaSubcat(cat, s.subcategoria, s.valor_mensal, s.id));

    return `
    <div class="card orc-card" id="orc-cat-${_slug(cat)}">
      <div class="orc-card__header">
        <div>
          <span class="orc-card__nome">${cat}</span>
          <span class="badge-tipo ${tipo === 'Receita' ? 'badge-tipo--receita' : 'badge-tipo--despesa'}">${tipo}</span>
        </div>
      </div>
      <div class="orc-subcats">
        ${linhasSubcat.join('')}
        ${subcatsExtra.join('')}
      </div>
      <div class="orc-card__adicionar">
        <button class="btn btn--ghost btn--sm" onclick="_abrirAdicionarSubcat('${cat}')">+ subcategoria</button>
      </div>
    </div>
    `;
  }).join('');

  conteudo.innerHTML = `
    <div class="view-header">
      <h2 class="view-titulo">Orçamento</h2>
    </div>
    <div class="analise-abas" style="margin-bottom:var(--esp-md)">
      <button class="analise-aba ${_orcAba === 'orcamento' ? 'analise-aba--ativa' : ''}" onclick="_mudarOrcAba('orcamento')">Valores</button>
      <button class="analise-aba ${_orcAba === 'recorrencias' ? 'analise-aba--ativa' : ''}" onclick="_mudarOrcAba('recorrencias')">Recorrências</button>
    </div>
    <div id="orc-conteudo">
      <nav class="nav-mes" style="margin-bottom:var(--esp-md)">
        <button class="nav-mes__btn" id="orc-mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(_orcAnoRef, _orcMesRef)}</span>
        <button class="nav-mes__btn" id="orc-mes-proximo">›</button>
      </nav>
      <p class="texto-secundario" style="font-size:var(--tam-xs);margin-bottom:var(--esp-md)">
        Alterações valem a partir de ${formatarMesAno(_orcAnoRef, _orcMesRef)}
      </p>
      <div class="orc-lista">${blocos}</div>
    </div>
  `;

  document.getElementById('orc-mes-anterior').onclick = () => {
    _orcMesRef--;
    if (_orcMesRef < 1) { _orcMesRef = 12; _orcAnoRef--; }
    renderizarOrcamentoConfig();
  };
  document.getElementById('orc-mes-proximo').onclick = () => {
    _orcMesRef++;
    if (_orcMesRef > 12) { _orcMesRef = 1; _orcAnoRef++; }
    renderizarOrcamentoConfig();
  };
}

function _slug(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

function _htmlLinhaSubcat(cat, subcat, valor, orcId) {
  const idBase = `orc-${_slug(cat)}-${_slug(subcat)}`;
  return `
    <div class="orc-linha" id="${idBase}-linha">
      <span class="orc-linha__nome">${subcat}</span>
      <div class="orc-linha__controles">
        <input
          type="number"
          class="orc-linha__input"
          id="${idBase}-input"
          value="${valor || ''}"
          min="0"
          step="0.01"
          placeholder="0,00"
          onblur="_salvarLinhaOrc(this, '${cat}', '${subcat}', '${orcId || ''}')"
        />
        <button class="orc-linha__excluir" title="Remover" onclick="_excluirSubcat('${orcId || ''}', '${cat}', '${subcat}')">✕</button>
      </div>
    </div>
  `;
}

async function _salvarLinhaOrc(input, cat, subcat, orcId) {
  const valor = parseFloat(input.value.replace(',', '.'));
  if (isNaN(valor) || valor < 0) { input.value = ''; return; }
  const validoAPartir = `${_orcAnoRef}-${String(_orcMesRef).padStart(2, '0')}-01`;
  const { error } = await upsertOrcamentoSubcat(cat, subcat, valor, validoAPartir);
  if (error) {
    mostrarToast('Erro ao salvar orçamento.', 'erro');
  } else {
    input.classList.add('orc-linha__input--salvo');
    setTimeout(() => input.classList.remove('orc-linha__input--salvo'), 1200);
  }
}

async function _excluirSubcat(orcId, cat, subcat) {
  if (!confirm(`Remover orçamento de "${subcat}" em ${cat}?`)) return;
  if (orcId) {
    const { error } = await deletarOrcamento(orcId);
    if (error) { mostrarToast('Erro ao remover.', 'erro'); return; }
  }
  mostrarToast('Removido.', 'sucesso');
  renderizarOrcamentoConfig();
}

function _abrirAdicionarSubcat(cat) {
  const nome = prompt(`Nome da nova subcategoria em "${cat}":`)?.trim();
  if (!nome) return;
  const valor = parseFloat(prompt(`Valor mensal para "${nome}" (R$):`)?.replace(',', '.'));
  if (isNaN(valor) || valor < 0) { mostrarToast('Valor inválido.', 'erro'); return; }
  const validoAPartir = `${_orcAnoRef}-${String(_orcMesRef).padStart(2, '0')}-01`;
  upsertOrcamentoSubcat(cat, nome, valor, validoAPartir).then(({ error }) => {
    if (error) mostrarToast('Erro ao adicionar.', 'erro');
    else { mostrarToast('Subcategoria adicionada!', 'sucesso'); renderizarOrcamentoConfig(); }
  });
}

function _mudarOrcAba(aba) {
  _orcAba = aba;
  if (aba === 'recorrencias') {
    _renderizarRecorrencias();
  } else {
    renderizarOrcamentoConfig();
  }
}

async function _renderizarRecorrencias() {
  const conteudo = document.getElementById('orc-conteudo');
  if (!conteudo) return;
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const { data: recs, error } = await buscarTodasRecorrencias();
  if (error) { conteudo.innerHTML = '<p class="erro centralizado">Erro ao carregar.</p>'; return; }

  const totalAtivas = (recs || [])
    .filter((r) => r.ativa)
    .reduce((s, r) => s + Math.abs(r.valor_esperado), 0);

  const linhas = (recs || []).map((r) => `
    <div class="orc-linha" style="opacity:${r.ativa ? 1 : 0.45}">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:var(--tam-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.descricao}</div>
        <div class="texto-secundario" style="font-size:var(--tam-xs)">${r.categoria}${r.subcategoria ? ' / ' + r.subcategoria : ''} · dia ${r.dia_do_mes || '?'}</div>
      </div>
      <div class="orc-linha__controles">
        <input type="number" class="orc-linha__input" value="${Math.abs(r.valor_esperado)}" min="0" step="0.01"
          onblur="_salvarValorRec(this, '${r.id}')" />
        <button class="orc-linha__excluir" title="${r.ativa ? 'Desativar' : 'Ativar'}"
          onclick="_toggleRecorrencia('${r.id}', ${r.ativa})">${r.ativa ? '⏸' : '▶'}</button>
        <button class="orc-linha__excluir" title="Excluir"
          onclick="_excluirRecorrencia('${r.id}', '${r.descricao.replace(/'/g, '')}')">✕</button>
      </div>
    </div>
  `).join('');

  conteudo.innerHTML = `
    <div class="card" style="margin-bottom:var(--esp-md);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="card__titulo">Total mensal ativo</div>
        <div class="card__valor negativo">${formatarMoeda(totalAtivas)}</div>
      </div>
      <button class="btn btn--ghost btn--sm" onclick="_abrirNovaRecorrencia()">+ nova</button>
    </div>
    <div class="card">
      ${linhas || '<p class="texto-secundario centralizado" style="padding:var(--esp-lg)">Nenhuma recorrência cadastrada.</p>'}
    </div>
  `;
}

async function _salvarValorRec(input, id) {
  const valor = parseFloat(input.value.replace(',', '.'));
  if (isNaN(valor) || valor < 0) { input.value = ''; return; }
  const { error } = await atualizarRecorrencia(id, { valor_esperado: -Math.abs(valor) });
  if (error) mostrarToast('Erro ao salvar.', 'erro');
  else {
    input.classList.add('orc-linha__input--salvo');
    setTimeout(() => input.classList.remove('orc-linha__input--salvo'), 1200);
  }
}

async function _toggleRecorrencia(id, ativa) {
  const { error } = await atualizarRecorrencia(id, { ativa: !ativa });
  if (error) mostrarToast('Erro ao atualizar.', 'erro');
  else _renderizarRecorrencias();
}

async function _excluirRecorrencia(id, descricao) {
  if (!confirm(`Excluir a recorrência "${descricao}"?`)) return;
  const { error } = await deletarRecorrencia(id);
  if (error) mostrarToast('Erro ao excluir.', 'erro');
  else { mostrarToast('Recorrência excluída.', 'sucesso'); _renderizarRecorrencias(); }
}

function _abrirNovaRecorrencia() {
  const desc = prompt('Descrição da recorrência:')?.trim();
  if (!desc) return;
  const valor = parseFloat(prompt('Valor mensal esperado (R$):')?.replace(',', '.'));
  if (isNaN(valor) || valor <= 0) { mostrarToast('Valor inválido.', 'erro'); return; }
  const dia = parseInt(prompt('Dia do mês (ex: 10):') || '1', 10);
  const cat = prompt('Categoria:')?.trim();
  if (!cat || !CATEGORIAS.includes(cat)) { mostrarToast('Categoria inválida.', 'erro'); return; }
  const sub = prompt('Subcategoria (opcional):')?.trim() || null;
  const meio = prompt('Meio (cartao / pix / outro):')?.trim() || 'cartao';

  inserirRecorrenciaNova({
    descricao: desc, valor_esperado: -Math.abs(valor),
    dia_do_mes: dia, categoria: cat, subcategoria: sub,
    meio, ativa: true,
  }).then(({ error }) => {
    if (error) mostrarToast('Erro ao criar.', 'erro');
    else { mostrarToast('Recorrência criada!', 'sucesso'); _renderizarRecorrencias(); }
  });
}
