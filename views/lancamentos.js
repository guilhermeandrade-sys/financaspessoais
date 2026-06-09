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
    <div class="lancamento-item" data-id="${l.id}">
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao">${l.descricao}</div>
        <div class="lancamento-item__meta">
          ${formatarData(l.data_evento)} · ${l.categoria} · ${l.meio}
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
