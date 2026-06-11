// View: Home

let mesSelecionado = new Date().getMonth() + 1;
let anoSelecionado = new Date().getFullYear();

async function renderizarHome() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const resumo = await calcularResumoMes(anoSelecionado, mesSelecionado);
  const dispDia = calcularDisponivelPorDia(resumo, anoSelecionado, mesSelecionado);

  const hoje = new Date();
  const ehMesAtual = hoje.getFullYear() === anoSelecionado && hoje.getMonth() + 1 === mesSelecionado;
  const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
  const diaAtual = ehMesAtual ? hoje.getDate() : diasNoMes;

  const cardsCategorias = CATEGORIAS
    .filter((c) => TIPO_POR_CATEGORIA[c] !== 'Receita')
    .map((cat) => {
      const realizado = resumo.porCategoria[cat] || 0;
      const orcado = resumo.orcamentoPorCategoria[cat] || 0;
      if (realizado === 0 && orcado === 0) return '';

      const subcatsOrc = resumo.orcamentoPorSubcategoria[cat] || {};
      const subcatsReal = resumo.porSubcategoria[cat] || {};
      const todasSubs = new Set([...Object.keys(subcatsOrc), ...Object.keys(subcatsReal)]);

      let linhasSubcat = '';
      if (todasSubs.size > 0) {
        linhasSubcat = [...todasSubs].sort().map((sub) => {
          const r = subcatsReal[sub] || 0;
          const o = subcatsOrc[sub] || 0;
          if (r === 0 && o === 0) return '';
          const pctSub = o > 0 ? Math.min((r / o) * 100, 100) : 0;
          const clsSub = pctSub >= 100 ? 'estourado' : pctSub >= 85 ? 'alerta' : '';
          return `
            <div class="subcat-linha subcat-linha--clicavel" onclick="irParaLancamentosCat(event,'${cat}','${sub}')">
              <div class="subcat-linha__nome">${sub}</div>
              <div class="subcat-linha__valores">
                <span class="${r > o && o > 0 ? 'negativo' : ''}">${formatarMoeda(r)}</span>
                ${o > 0 ? `<span class="texto-secundario"> / ${formatarMoeda(o)}</span>` : ''}
              </div>
              ${o > 0 ? `<div class="barra-progresso barra-progresso--slim"><div class="barra-progresso__preenchimento${clsSub ? ' barra-progresso__preenchimento--' + clsSub : ''}" style="width:${pctSub}%"></div></div>` : ''}
            </div>
          `;
        }).join('');
      }

      const pct = orcado > 0 ? Math.round((realizado / orcado) * 100) : null;

      // Projeção "vai estourar?" — só para mês atual com orçamento definido
      let htmlProjecao = '';
      if (ehMesAtual && orcado > 0 && realizado > 0 && diaAtual > 0) {
        const projecao = (realizado / diaAtual) * diasNoMes;
        if (projecao > orcado * 1.05) {
          // projeta estouro (margem de 5%)
          const excesso = projecao - orcado;
          htmlProjecao = `<div class="projecao projecao--alerta">↗ Projeção: ${formatarMoeda(projecao)} (+${formatarMoeda(excesso)})</div>`;
        } else if (projecao >= orcado * 0.85) {
          // projeta próximo do limite (85–105%)
          htmlProjecao = `<div class="projecao projecao--atencao">↗ Projeção: ${formatarMoeda(projecao)}</div>`;
        }
      }

      return `
        <div class="card card--categoria" data-cat="${cat}">
          <div class="card-cat__cabecalho" onclick="toggleSubcats(this)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="card__titulo card__titulo--link" onclick="irParaLancamentosCat(event,'${cat}',null)">${cat}</span>
              <span style="font-size:var(--tam-sm);color:var(--cor-texto-secundario)">
                ${orcado > 0 ? formatarMoeda(orcado) : '—'}
                ${todasSubs.size > 0 ? '<span class="subcat-seta">›</span>' : ''}
              </span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--esp-xs)">
              <span class="negrito">${formatarMoeda(realizado)}</span>
              ${pct !== null ? `<span class="texto-secundario" style="font-size:var(--tam-sm)">${pct}%</span>` : ''}
            </div>
            ${orcado > 0 ? htmlBarraProgresso(realizado, orcado) : ''}
            ${htmlProjecao}
          </div>
          ${linhasSubcat ? `<div class="subcats oculto">${linhasSubcat}</div>` : ''}
        </div>
      `;
    }).join('');

  // Indicadores resumidos (item 3)
  const totalOrcado = Object.values(resumo.orcamentoPorCategoria).reduce((s, v) => s + v, 0);
  const pctOrcamento = totalOrcado > 0 ? Math.round((resumo.despesa / totalOrcado) * 100) : null;
  const taxaPoupanca = resumo.receita > 0 ? Math.round(((resumo.receita - resumo.despesa) / resumo.receita) * 100) : null;
  const catsEstouradas = CATEGORIAS.filter((c) => {
    const r = resumo.porCategoria[c] || 0;
    const o = resumo.orcamentoPorCategoria[c] || 0;
    return o > 0 && r > o;
  }).length;

  const htmlIndicadores = (pctOrcamento !== null || taxaPoupanca !== null) ? `
    <div class="indicadores-strip">
      ${taxaPoupanca !== null ? `
        <div class="indicador">
          <span class="indicador__label">Poupança</span>
          <span class="indicador__valor ${taxaPoupanca >= 0 ? 'positivo' : 'negativo'}">${taxaPoupanca}%</span>
        </div>` : ''}
      ${pctOrcamento !== null ? `
        <div class="indicador">
          <span class="indicador__label">Orçamento usado</span>
          <span class="indicador__valor ${pctOrcamento >= 100 ? 'negativo' : pctOrcamento >= 85 ? 'cor-alerta' : ''}">${pctOrcamento}%</span>
        </div>` : ''}
      ${catsEstouradas > 0 ? `
        <div class="indicador">
          <span class="indicador__label">Estouradas</span>
          <span class="indicador__valor negativo">${catsEstouradas} cat${catsEstouradas > 1 ? '.' : '.'}</span>
        </div>` : `
        <div class="indicador">
          <span class="indicador__label">Estouradas</span>
          <span class="indicador__valor positivo">nenhuma</span>
        </div>`}
    </div>
  ` : '';

  conteudo.innerHTML = `
    <div class="view-header">
      <nav class="nav-mes">
        <button class="nav-mes__btn" id="mes-anterior">‹</button>
        <span class="nav-mes__label">${formatarMesAno(anoSelecionado, mesSelecionado)}</span>
        <button class="nav-mes__btn" id="mes-proximo">›</button>
      </nav>
    </div>

    <div class="cards-saldo-grid">
      <div class="card card--destaque" style="text-align:center">
        <div class="card__titulo">Saldo do mês</div>
        <div class="card__valor ${resumo.saldo >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(resumo.saldo)}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card__titulo">Receita</div>
        <div class="card__valor positivo">${formatarMoeda(resumo.receita)}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card__titulo">Despesa</div>
        <div class="card__valor negativo">${formatarMoeda(resumo.despesa)}</div>
      </div>
    </div>

    ${htmlIndicadores}

    ${ehMesAtual && dispDia > 0 ? `
    <div class="card" style="text-align:center">
      <div class="card__titulo">Disponível por dia</div>
      <div class="card__valor positivo">${formatarMoeda(dispDia)}</div>
    </div>
    ` : ''}

    <h3 style="margin:var(--esp-md) 0 var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Por categoria</h3>
    <div class="cards-categorias-grid">
      ${cardsCategorias || '<p class="texto-secundario centralizado" style="padding:var(--esp-lg)">Nenhum lançamento neste mês.</p>'}
    </div>
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

function toggleSubcats(cabecalho) {
  const subcats = cabecalho.nextElementSibling;
  if (!subcats || !subcats.classList.contains('subcats')) return;
  const seta = cabecalho.querySelector('.subcat-seta');
  subcats.classList.toggle('oculto');
  if (seta) seta.textContent = subcats.classList.contains('oculto') ? '›' : '⌄';
}

function irParaLancamentosCat(event, categoria, subcategoria) {
  event.stopPropagation();
  navegarPara('lancamentos', {
    categoria,
    subcategoria,
    ano: anoSelecionado,
    mes: mesSelecionado,
  });
}
