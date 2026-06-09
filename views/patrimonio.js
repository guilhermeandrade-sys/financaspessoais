// View: Patrimônio e Projetos

async function renderizarPatrimonio() {
  const conteudo = document.getElementById('conteudo-principal');
  conteudo.innerHTML = '<div class="loading">Carregando…</div>';

  const [{ data: patrimonio }, { data: projetos }] = await Promise.all([
    buscarPatrimonio(),
    buscarProjetos(),
  ]);

  const ativos = (patrimonio || []).filter((p) => p.tipo === 'ativo');
  const passivos = (patrimonio || []).filter((p) => p.tipo === 'passivo');
  const totalAtivos = ativos.reduce((s, p) => s + p.valor, 0);
  const totalPassivos = passivos.reduce((s, p) => s + p.valor, 0);
  const liquido = totalAtivos - totalPassivos;

  const htmlLista = (itens) => itens.map((p) => `
    <div class="lancamento-item">
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao">${p.descricao}</div>
        <div class="lancamento-item__meta">${p.subtipo}${p.instituicao ? ' · ' + p.instituicao : ''}</div>
      </div>
      <div class="lancamento-item__valor ${p.tipo === 'ativo' ? 'positivo' : 'negativo'}">
        ${formatarMoeda(p.valor)}
      </div>
    </div>
  `).join('');

  const prazos = ['curto', 'medio', 'longo', 'aposentadoria'];
  const labels = { curto: 'Curto prazo', medio: 'Médio prazo', longo: 'Longo prazo', aposentadoria: 'Aposentadoria' };
  const htmlProjetos = prazos.map((prazo) => {
    const lista = (projetos || []).filter((p) => p.prazo === prazo);
    if (!lista.length) return '';
    return `
      <h4 style="margin:var(--esp-md) 0 var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase">${labels[prazo]}</h4>
      ${lista.map((p) => `
        <div class="card" style="margin-bottom:var(--esp-sm)">
          <div style="display:flex;justify-content:space-between">
            <span>${p.descricao}</span>
            <span class="texto-secundario" style="font-size:var(--tam-sm)">${p.ano_alvo || ''}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:var(--esp-xs)">
            <span class="positivo negrito">${formatarMoeda(p.valor_aplicado)}</span>
            <span class="texto-secundario">de ${formatarMoeda(p.valor_alvo)}</span>
          </div>
          ${htmlBarraProgresso(p.valor_aplicado, p.valor_alvo)}
        </div>
      `).join('')}
    `;
  }).join('');

  conteudo.innerHTML = `
    <div class="view-header">
      <span class="view-header__titulo">Patrimônio</span>
    </div>

    <div class="card card--destaque" style="text-align:center;margin-bottom:var(--esp-md)">
      <div class="card__titulo">Patrimônio líquido</div>
      <div class="card__valor ${liquido >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(liquido)}</div>
      <div style="display:flex;justify-content:space-around;margin-top:var(--esp-md)">
        <div>
          <div class="card__titulo">Ativos</div>
          <div class="positivo negrito">${formatarMoeda(totalAtivos)}</div>
        </div>
        <div>
          <div class="card__titulo">Passivos</div>
          <div class="negativo negrito">${formatarMoeda(totalPassivos)}</div>
        </div>
      </div>
    </div>

    ${ativos.length ? `
      <h3 style="margin-bottom:var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Ativos</h3>
      <div class="card">${htmlLista(ativos)}</div>
    ` : ''}

    ${passivos.length ? `
      <h3 style="margin:var(--esp-md) 0 var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Passivos</h3>
      <div class="card">${htmlLista(passivos)}</div>
    ` : ''}

    ${projetos && projetos.length ? `
      <h3 style="margin:var(--esp-md) 0 var(--esp-sm);color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Projetos / Reservas</h3>
      ${htmlProjetos}
    ` : ''}
  `;
}
