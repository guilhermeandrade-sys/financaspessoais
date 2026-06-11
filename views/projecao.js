// View: Projeção de meses futuros

async function renderizarProjecao() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const [
    { data: lancamentosAno },
    { data: recorrencias },
    { data: orcBase },
  ] = await Promise.all([
    buscarLancamentosAno(anoAtual),
    buscarRecorrenciasAtivas(),
    buscarOrcamentoPorMes(anoAtual, mesAtual),
  ]);

  // Orçamento mensal total (soma de todas as subcategorias de despesa)
  const totalOrcMensal = (orcBase || [])
    .filter((o) => TIPO_POR_CATEGORIA[o.categoria] !== 'Receita')
    .reduce((s, o) => s + o.valor_mensal, 0);

  // Agrupa lançamentos futuros por mês
  const lancFuturos = {};
  for (const l of lancamentosAno || []) {
    const [a, m] = l.data_evento.split('-').map(Number);
    if (a !== anoAtual) continue;
    if (m < mesAtual) continue; // ignora passado
    if (!lancFuturos[m]) lancFuturos[m] = [];
    lancFuturos[m].push(l);
  }

  // Total de recorrências ativas por mês (valor_esperado por recorrência)
  const totalRecMensal = (recorrencias || []).reduce((s, r) => s + Math.abs(r.valor_esperado), 0);

  // Monta blocos para meses futuros (do próximo mês até dezembro)
  const mesesFuturos = [];
  for (let m = mesAtual + 1; m <= 12; m++) {
    // Parcelas e lançamentos já cadastrados para esse mês futuro
    const lancMes = lancFuturos[m] || [];
    const comprometidoParcelas = lancMes
      .filter((l) => l.valor < 0)
      .reduce((s, l) => s + Math.abs(l.valor), 0);

    const livre = totalOrcMensal - comprometidoParcelas - totalRecMensal;
    const pctComprometido = totalOrcMensal > 0
      ? Math.round(((comprometidoParcelas + totalRecMensal) / totalOrcMensal) * 100)
      : null;

    // Detalhes de parcelas: agrupa por descricao
    const parcelas = lancMes.filter((l) => l.parcela_total > 1 && l.valor < 0);
    const recorrentesLancados = lancMes.filter((l) => (!l.parcela_total || l.parcela_total <= 1) && l.valor < 0);

    const htmlParcelas = parcelas.length > 0 ? parcelas.map((l) => `
      <div class="proj-detalhe">
        <span class="proj-detalhe__nome">${l.descricao}</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(Math.abs(l.valor))}</span>
      </div>
    `).join('') : '';

    const htmlRecLancados = recorrentesLancados.length > 0 ? recorrentesLancados.map((l) => `
      <div class="proj-detalhe">
        <span class="proj-detalhe__nome">${l.descricao}</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(Math.abs(l.valor))}</span>
      </div>
    `).join('') : '';

    const htmlRecorrencias = totalRecMensal > 0 ? `
      <div class="proj-detalhe proj-detalhe--grupo">
        <span class="proj-detalhe__nome texto-secundario">Recorrências (${(recorrencias || []).length}x)</span>
        <span class="proj-detalhe__valor negativo">${formatarMoeda(totalRecMensal)}</span>
      </div>
    ` : '';

    const temDetalhes = parcelas.length > 0 || recorrentesLancados.length > 0 || totalRecMensal > 0;

    mesesFuturos.push(`
      <div class="card proj-card" id="proj-${m}">
        <div class="proj-card__cabecalho" onclick="toggleProjecaoDetalhes(this)" ${!temDetalhes ? 'style="cursor:default"' : ''}>
          <div class="proj-card__linha">
            <span class="proj-card__mes">${formatarMesAno(anoAtual, m)}</span>
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
    `);
  }

  conteudo.innerHTML = `
    <div class="view-header">
      <h2 class="view-titulo">Projeção ${anoAtual}</h2>
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
      ${mesesFuturos.length > 0
        ? mesesFuturos.join('')
        : '<p class="texto-secundario centralizado" style="padding:var(--esp-xl)">Nenhum mês futuro para projetar neste ano.</p>'
      }
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
