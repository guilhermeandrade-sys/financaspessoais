// View: Análise por período

async function renderizarAnalise() {
  const conteudo = document.getElementById('conteudo-principal');
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const inicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
  const fim = new Date(anoAtual, mesAtual, 0).toISOString().slice(0, 10);

  conteudo.innerHTML = `
    <div class="view-header">
      <span class="view-header__titulo">Análise</span>
    </div>
    <div class="card">
      <div class="form-grupo">
        <label>De</label>
        <input type="date" id="analise-inicio" value="${inicio}" />
      </div>
      <div class="form-grupo">
        <label>Até</label>
        <input type="date" id="analise-fim" value="${fim}" />
      </div>
      <button id="analise-buscar" class="btn btn--primario">Buscar</button>
    </div>
    <div id="analise-resultado"></div>
  `;

  document.getElementById('analise-buscar').onclick = async () => {
    const di = document.getElementById('analise-inicio').value;
    const df = document.getElementById('analise-fim').value;
    await renderizarResultadoAnalise(di, df);
  };

  await renderizarResultadoAnalise(inicio, fim);
}

async function renderizarResultadoAnalise(dataInicio, dataFim) {
  const resultado = document.getElementById('analise-resultado');
  resultado.innerHTML = '<div class="loading">Carregando…</div>';

  const { data: lancamentos } = await buscarLancamentosPorPeriodo(dataInicio, dataFim);
  if (!lancamentos) { resultado.innerHTML = ''; return; }

  const porCategoria = {};
  let totalDespesa = 0;
  let totalReceita = 0;

  for (const l of lancamentos) {
    if (l.valor > 0) {
      totalReceita += l.valor;
    } else {
      totalDespesa += Math.abs(l.valor);
      porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + Math.abs(l.valor);
    }
  }

  const linhas = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => `
      <div class="lancamento-item">
        <div class="lancamento-item__info">
          <div class="lancamento-item__descricao">${cat}</div>
          <div class="lancamento-item__meta">${TIPO_POR_CATEGORIA[cat] || ''}</div>
        </div>
        <div class="lancamento-item__valor negativo">${formatarMoeda(val)}</div>
      </div>
    `).join('');

  resultado.innerHTML = `
    <div class="card" style="text-align:center;margin-bottom:var(--esp-md)">
      <div style="display:flex;justify-content:space-around">
        <div>
          <div class="card__titulo">Receita</div>
          <div class="positivo negrito">${formatarMoeda(totalReceita)}</div>
        </div>
        <div>
          <div class="card__titulo">Despesa</div>
          <div class="negativo negrito">${formatarMoeda(totalDespesa)}</div>
        </div>
        <div>
          <div class="card__titulo">Saldo</div>
          <div class="${totalReceita - totalDespesa >= 0 ? 'positivo' : 'negativo'} negrito">
            ${formatarMoeda(totalReceita - totalDespesa)}
          </div>
        </div>
      </div>
    </div>
    <div class="card">${linhas || '<p class="texto-secundario centralizado">Sem despesas no período.</p>'}</div>
  `;
}
