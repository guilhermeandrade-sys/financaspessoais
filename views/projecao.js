// View: Projeção de meses futuros

async function renderizarProjecao() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  // Próximos 6 meses (cruza o ano se necessário)
  const mesesFuturos = [];
  for (let i = 1; i <= 6; i++) {
    let m = mesAtual + i;
    let a = anoAtual;
    if (m > 12) { m -= 12; a++; }
    mesesFuturos.push({ ano: a, mes: m });
  }

  // Anos envolvidos na projeção
  const anosNecessarios = [...new Set(mesesFuturos.map((x) => x.ano))];

  const [
    ...lancamentosAnos
  ] = await Promise.all([
    ...anosNecessarios.map((a) => buscarLancamentosAno(a)),
  ]);

  // Mapa ano → lançamentos
  const lancsPorAno = {};
  anosNecessarios.forEach((a, i) => {
    lancsPorAno[a] = lancamentosAnos[i].data || [];
  });

  const [{ data: recorrencias }, { data: orcBase }] = await Promise.all([
    buscarRecorrenciasAtivas(),
    buscarOrcamentoPorMes(anoAtual, mesAtual),
  ]);

  const totalOrcMensal = (orcBase || [])
    .filter((o) => TIPO_POR_CATEGORIA[o.categoria] !== 'Receita')
    .reduce((s, o) => s + o.valor_mensal, 0);

  const totalRecMensal = (recorrencias || []).reduce((s, r) => s + Math.abs(r.valor_esperado), 0);

  const blocos = mesesFuturos.map(({ ano, mes }) => {
    const lancs = (lancsPorAno[ano] || []).filter((l) => {
      const [a, m] = l.data_evento.split('-').map(Number);
      return a === ano && m === mes;
    });

    const comprometidoParcelas = lancs
      .filter((l) => l.valor < 0)
      .reduce((s, l) => s + Math.abs(l.valor), 0);

    const livre = totalOrcMensal - comprometidoParcelas - totalRecMensal;
    const pctComprometido = totalOrcMensal > 0
      ? Math.round(((comprometidoParcelas + totalRecMensal) / totalOrcMensal) * 100)
      : null;

    const parcelas = lancs.filter((l) => l.parcela_total > 1 && l.valor < 0);
    const recorrentesLancados = lancs.filter((l) => (!l.parcela_total || l.parcela_total <= 1) && l.valor < 0);

    const htmlParcelas = parcelas.map((l) => `
      <div class="proj-detalhe">
        <span class="proj-detalhe__nome">${l.descricao}</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(Math.abs(l.valor))}</span>
      </div>
    `).join('');

    const htmlRecLancados = recorrentesLancados.map((l) => `
      <div class="proj-detalhe">
        <span class="proj-detalhe__nome">${l.descricao}</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(Math.abs(l.valor))}</span>
      </div>
    `).join('');

    const htmlRecorrencias = totalRecMensal > 0 ? `
      <div class="proj-detalhe proj-detalhe--grupo">
        <span class="proj-detalhe__nome texto-secundario">Recorrências (${(recorrencias || []).length}x)</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(totalRecMensal)}</span>
      </div>
    ` : '';

    const temDetalhes = parcelas.length > 0 || recorrentesLancados.length > 0 || totalRecMensal > 0;

    return `
      <div class="card proj-card" id="proj-${ano}-${mes}">
        <div class="proj-card__cabecalho" onclick="toggleProjecaoDetalhes(this)" ${!temDetalhes ? 'style="cursor:default"' : ''}>
          <div class="proj-card__linha">
            <span class="proj-card__mes">${formatarMesAno(ano, mes)}</span>
            ${temDetalhes ? '<span class="proj-card__seta">›</span>' : ''}
          </div>
          <div class="proj-card__numeros">
            <div class="proj-numero">
              <span class="proj-numero__label">Comprometido</span>
              <span class="proj-numero__valor negativo">${formatarMoeda(comprometidoParcelas + totalRecMensal)}</span>
            </div>
            <div class="proj-numero">
              <span class="proj-numero__label">Orçamento</span>
              <span class="proj-numero__valor">${formatarMoeda(totalOrcMensal)}</span>
            </div>
            <div class="proj-numero">
              <span class="proj-numero__label">Livre</span>
              <span class="proj-numero__valor ${livre >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(livre)}</span>
            </div>
          </div>
          ${pctComprometido !== null ? `
          <div class="barra-progresso" style="margin-top:var(--esp-sm)">
            <div class="barra-progresso__preenchimento${pctComprometido >= 100 ? ' barra-progresso__preenchimento--estourado' : pctComprometido >= 80 ? ' barra-progresso__preenchimento--alerta' : ''}"
              style="width:${Math.min(pctComprometido, 100)}%"></div>
          </div>
          <span class="texto-secundario" style="font-size:var(--tam-xs)">${pctComprometido}% do orçamento comprometido</span>
          ` : ''}
        </div>
        ${temDetalhes ? `
        <div class="proj-detalhes oculto">
          ${htmlParcelas}
          ${htmlRecLancados}
          ${htmlRecorrencias}
        </div>` : ''}
      </div>
    `;
  });

  conteudo.innerHTML = `
    <div class="view-header">
      <h2 class="view-titulo">Próximos 6 meses</h2>
      <p class="texto-secundario" style="font-size:var(--tam-xs);margin-top:var(--esp-xs)">
        Parcelas cadastradas + recorrências ativas vs. orçamento mensal
      </p>
    </div>

    <div class="proj-mes-atual card" style="margin-bottom:var(--esp-md)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="negrito">${formatarMesAno(anoAtual, mesAtual)} (mês atual)</span>
        <span class="btn btn--ghost btn--sm" style="cursor:pointer" onclick="navegarPara('home')">Ver Home →</span>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--esp-md)">
      ${blocos.join('')}
    </div>
  `;
}

function toggleProjecaoDetalhes(cabecalho) {
  const detalhes = cabecalho.nextElementSibling;
  if (!detalhes || !detalhes.classList.contains('proj-detalhes')) return;
  const seta = cabecalho.querySelector('.proj-card__seta');
  detalhes.classList.toggle('oculto');
  if (seta) seta.textContent = detalhes.classList.contains('oculto') ? '›' : '⌄';
}
