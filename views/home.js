// View: Home

let mesSelecionado = new Date().getMonth() + 1;
let anoSelecionado = new Date().getFullYear();

async function renderizarHome() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const resumo = await calcularResumoMes(anoSelecionado, mesSelecionado);
  const dispDia = calcularDisponivePorDia(resumo, anoSelecionado, mesSelecionado);

  const cardsCategorias = CATEGORIAS
    .filter((c) => TIPO_POR_CATEGORIA[c] !== 'Receita')
    .map((cat) => {
      const realizado = resumo.porCategoria[cat] || 0;
      const orcado = resumo.orcamentoPorCategoria[cat] || 0;
      if (realizado === 0 && orcado === 0) return '';
      return `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="card__titulo">${cat}</span>
            <span style="font-size:var(--tam-sm);color:var(--cor-texto-secundario)">
              ${orcado > 0 ? formatarMoeda(orcado) : '—'}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--esp-xs)">
            <span class="negrito">${formatarMoeda(realizado)}</span>
            ${orcado > 0 ? `<span class="texto-secundario" style="font-size:var(--tam-sm)">${Math.round((realizado/orcado)*100)}%</span>` : ''}
          </div>
          ${orcado > 0 ? htmlBarraProgresso(realizado, orcado) : ''}
        </div>
      `;
    }).join('');

  conteudo.innerHTML = `
    <div class="view-header">
      <nav class="nav-mes">
        <button class="nav-mes__btn" id="mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(anoSelecionado, mesSelecionado)}</span>
        <button class="nav-mes__btn" id="mes-proximo">›</button>
      </nav>
    </div>

    <div class="card card--destaque" style="text-align:center;margin-bottom:var(--esp-md)">
      <div class="card__titulo">Saldo do mês</div>
      <div class="card__valor ${resumo.saldo >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(resumo.saldo)}</div>
      <div style="display:flex;justify-content:space-around;margin-top:var(--esp-md)">
        <div>
          <div class="card__titulo">Receita</div>
          <div class="positivo negrito">${formatarMoeda(resumo.receita)}</div>
        </div>
        <div>
          <div class="card__titulo">Despesa</div>
          <div class="negativo negrito">${formatarMoeda(resumo.despesa)}</div>
        </div>
      </div>
    </div>

    ${dispDia > 0 ? `
    <div class="card" style="text-align:center;margin-bottom:var(--esp-md)">
      <div class="card__titulo">Disponível por dia</div>
      <div class="card__valor positivo">${formatarMoeda(dispDia)}</div>
    </div>
    ` : ''}

    <h3 style="margin-bottom:var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Por categoria</h3>
    ${cardsCategorias || '<p class="texto-secundario centralizado" style="padding:var(--esp-lg)">Nenhum lançamento neste mês.</p>'}
  `;

  document.getElementById('mes-anterior').onclick = () => {
    mesSelecionado--;
    if (mesSelecionado < 1) { mesSelecionado = 12; anoSelecionado--; }
    renderizarHome();
  };
  document.getElementById('mes-proximo').onclick = () => {
    mesSelecionado++;
    if (mesSelecionado > 12) { mesSelecionado = 1; anoSelecionado++; }
    renderizarHome();
  };
}
