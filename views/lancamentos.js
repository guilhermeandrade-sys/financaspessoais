// View: Lista de Lançamentos

let mesListagem = new Date().getMonth() + 1;
let anoListagem = new Date().getFullYear();

async function renderizarLancamentos() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const { data: lancamentos, error } = await buscarLancamentosPorMes(anoListagem, mesListagem);
  if (error) {
    conteudo.innerHTML = '<p class="erro centralizado">Erro ao carregar lançamentos.</p>';
    return;
  }

  const itens = (lancamentos || []).map((l) => `
    <div class="lancamento-item" data-id="${l.id}" onclick="abrirEdicaoLancamento('${l.id}')">
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao">${l.descricao}</div>
        <div class="lancamento-item__meta">
          ${formatarData(l.data_evento)} · ${l.categoria}${l.subcategoria ? ' / ' + l.subcategoria : ''} · ${l.meio}
          ${l.parcela_total > 1 ? ` · ${l.parcela_atual}/${l.parcela_total}` : ''}
        </div>
      </div>
      <div class="lancamento-item__valor ${l.valor >= 0 ? 'positivo' : 'negativo'}">
        ${formatarMoeda(l.valor)}
      </div>
    </div>
  `).join('');

  conteudo.innerHTML = `
    <div class="view-header">
      <nav class="nav-mes">
        <button class="nav-mes__btn" id="list-mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(anoListagem, mesListagem)}</span>
        <button class="nav-mes__btn" id="list-mes-proximo">›</button>
      </nav>
    </div>
    <div class="card">
      ${itens || '<p class="texto-secundario centralizado" style="padding:var(--esp-lg)">Nenhum lançamento neste mês.</p>'}
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
    });
    if (error) {
      mostrarToast('Erro ao salvar.', 'erro');
    } else {
      fecharBottomSheet();
      mostrarToast('Lançamento atualizado!', 'sucesso');
      renderizarLancamentos();
    }
  });

  // Botão excluir
  const painel = document.getElementById('bottom-sheet__conteudo');
  const btnExcluir = document.createElement('button');
  btnExcluir.className = 'btn btn--perigo';
  btnExcluir.style.marginTop = 'var(--esp-xs)';
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
