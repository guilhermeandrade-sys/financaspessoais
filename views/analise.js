// View: Análise por período

let _analiseAba = 'periodo'; // 'periodo' | 'evolucao' | 'busca'

async function renderizarAnalise() {
  const conteudo = document.getElementById('conteudo-principal');
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const inicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
  const fim = new Date(anoAtual, mesAtual, 0).toISOString().slice(0, 10);

  conteudo.innerHTML = `
    <div class="view-header">
      <h2 class="view-titulo">Análise</h2>
    </div>
    <div class="analise-abas">
      <button class="analise-aba ${_analiseAba === 'periodo' ? 'analise-aba--ativa' : ''}" onclick="_mudarAnaliseAba('periodo')">Por período</button>
      <button class="analise-aba ${_analiseAba === 'evolucao' ? 'analise-aba--ativa' : ''}" onclick="_mudarAnaliseAba('evolucao')">Evolução</button>
      <button class="analise-aba ${_analiseAba === 'busca' ? 'analise-aba--ativa' : ''}" onclick="_mudarAnaliseAba('busca')">Busca</button>
    </div>
    <div id="analise-conteudo"></div>
  `;

  await _renderizarAbaAnalise(inicio, fim);
}

function _mudarAnaliseAba(aba) {
  _analiseAba = aba;
  document.querySelectorAll('.analise-aba').forEach((b) => {
    b.classList.toggle('analise-aba--ativa', b.textContent.trim() === { periodo: 'Por período', evolucao: 'Evolução', busca: 'Busca' }[aba]);
  });
  const hoje = new Date();
  const inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);
  _renderizarAbaAnalise(inicio, fim);
}

async function _renderizarAbaAnalise(inicio, fim) {
  const area = document.getElementById('analise-conteudo');
  if (!area) return;

  if (_analiseAba === 'periodo') {
    area.innerHTML = `
      <div class="card" style="margin-bottom:var(--esp-md)">
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
      await _renderizarPeriodo(
        document.getElementById('analise-inicio').value,
        document.getElementById('analise-fim').value
      );
    };
    await _renderizarPeriodo(inicio, fim);

  } else if (_analiseAba === 'evolucao') {
    area.innerHTML = '<div class="loading">Carregando…</div>';
    await _renderizarEvolucao(area);

  } else if (_analiseAba === 'busca') {
    area.innerHTML = `
      <div class="card" style="margin-bottom:var(--esp-md)">
        <div class="form-grupo" style="margin-bottom:0">
          <input type="text" id="busca-texto" placeholder="Buscar por descrição…" autocomplete="off" />
        </div>
      </div>
      <div id="busca-resultado"><p class="texto-secundario centralizado" style="padding:var(--esp-xl)">Digite para buscar em todos os lançamentos.</p></div>
    `;
    let _timer = null;
    document.getElementById('busca-texto').oninput = (e) => {
      clearTimeout(_timer);
      const texto = e.target.value.trim();
      if (texto.length < 2) {
        document.getElementById('busca-resultado').innerHTML = '<p class="texto-secundario centralizado" style="padding:var(--esp-xl)">Digite ao menos 2 caracteres.</p>';
        return;
      }
      _timer = setTimeout(() => _executarBusca(texto), 400);
    };
    document.getElementById('busca-texto').focus();
  }
}

async function _renderizarPeriodo(dataInicio, dataFim) {
  const resultado = document.getElementById('analise-resultado');
  if (!resultado) return;
  resultado.innerHTML = '<div class="loading">Carregando…</div>';

  const { data: lancamentos } = await buscarLancamentosPorPeriodo(dataInicio, dataFim);
  if (!lancamentos) { resultado.innerHTML = ''; return; }

  const porCategoria = {};
  let totalDespesa = 0, totalReceita = 0;

  for (const l of lancamentos) {
    if (l.valor > 0) {
      totalReceita += l.valor;
    } else {
      totalDespesa += Math.abs(l.valor);
      porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + Math.abs(l.valor);
    }
  }

  const maxVal = Math.max(...Object.values(porCategoria), 1);

  const linhas = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => {
      const pct = Math.round((val / maxVal) * 100);
      return `
        <div class="analise-linha" onclick="navegarPara('lancamentos', {categoria: '${cat}'})">
          <div class="analise-linha__cabecalho">
            <span class="analise-linha__cat">${cat}</span>
            <span class="analise-linha__val negativo">${formatarMoeda(val)}</span>
          </div>
          <div class="barra-progresso barra-progresso--slim">
            <div class="barra-progresso__preenchimento" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

  resultado.innerHTML = `
    <div class="cards-saldo-grid" style="margin-bottom:var(--esp-md)">
      <div class="card card--destaque" style="text-align:center">
        <div class="card__titulo">Saldo</div>
        <div class="${totalReceita - totalDespesa >= 0 ? 'positivo' : 'negativo'} negrito card__valor">${formatarMoeda(totalReceita - totalDespesa)}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card__titulo">Receita</div>
        <div class="positivo negrito card__valor">${formatarMoeda(totalReceita)}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card__titulo">Despesa</div>
        <div class="negativo negrito card__valor">${formatarMoeda(totalDespesa)}</div>
      </div>
    </div>
    <div class="card">${linhas || '<p class="texto-secundario centralizado">Sem despesas no período.</p>'}</div>
  `;
}

async function _renderizarEvolucao(area) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  // Últimos 6 meses
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    let m = mesAtual - i;
    let a = ano;
    if (m < 1) { m += 12; a--; }
    meses.push({ ano: a, mes: m });
  }

  // Busca dados de todos os meses necessários em paralelo
  const resumos = await Promise.all(
    meses.map(({ ano: a, mes: m }) => calcularResumoMes(a, m))
  );

  // Categorias que tiveram gasto em algum mês
  const catsAtivas = new Set();
  for (const r of resumos) {
    Object.keys(r.porCategoria).forEach((c) => catsAtivas.add(c));
  }
  const cats = [...catsAtivas].sort((a, b) => {
    const totalA = resumos.reduce((s, r) => s + (r.porCategoria[a] || 0), 0);
    const totalB = resumos.reduce((s, r) => s + (r.porCategoria[b] || 0), 0);
    return totalB - totalA;
  });

  // Totais mensais de despesa
  const totaisMes = resumos.map((r) => r.despesa);
  const maxTotal = Math.max(...totaisMes, 1);

  const htmlTotais = `
    <div class="card" style="margin-bottom:var(--esp-md)">
      <h3 class="analise-secao-titulo">Despesa total por mês</h3>
      <div class="evolucao-barras">
        ${meses.map(({ ano: a, mes: m }, i) => {
          const val = totaisMes[i];
          const h = Math.round((val / maxTotal) * 80);
          return `
            <div class="evolucao-barra-col">
              <span class="evolucao-barra-val">${formatarMoedaCurto(val)}</span>
              <div class="evolucao-barra" style="height:${Math.max(h, 4)}px"></div>
              <span class="evolucao-barra-label">${_mesAbrev(m)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const htmlCats = cats.map((cat) => {
    const vals = resumos.map((r) => r.porCategoria[cat] || 0);
    const maxCat = Math.max(...vals, 1);
    return `
      <div class="analise-linha" style="margin-bottom:var(--esp-md)">
        <div class="analise-linha__cabecalho">
          <span class="analise-linha__cat">${cat}</span>
          <span class="texto-secundario" style="font-size:var(--tam-xs)">${TIPO_POR_CATEGORIA[cat] || ''}</span>
        </div>
        <div class="evolucao-tabela">
          ${meses.map(({ mes: m }, i) => {
            const val = vals[i];
            const pct = Math.round((val / maxCat) * 100);
            return `
              <div class="evolucao-cel">
                <span class="evolucao-cel__label">${_mesAbrev(m)}</span>
                <div class="barra-progresso barra-progresso--slim" style="margin:2px 0">
                  <div class="barra-progresso__preenchimento" style="width:${pct}%"></div>
                </div>
                <span class="evolucao-cel__val ${val === 0 ? 'texto-secundario' : ''}">${val > 0 ? formatarMoedaCurto(val) : '—'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  area.innerHTML = `
    ${htmlTotais}
    <div class="card">
      <h3 class="analise-secao-titulo">Por categoria (últimos 6 meses)</h3>
      ${htmlCats || '<p class="texto-secundario centralizado">Sem dados.</p>'}
    </div>
  `;
}

async function _executarBusca(texto) {
  const resultado = document.getElementById('busca-resultado');
  if (!resultado) return;
  resultado.innerHTML = '<div class="loading">Buscando…</div>';

  const { data, error } = await buscarLancamentosPorTexto(texto);
  if (error) { resultado.innerHTML = '<p class="erro centralizado">Erro na busca.</p>'; return; }
  if (!data || data.length === 0) {
    resultado.innerHTML = '<p class="texto-secundario centralizado" style="padding:var(--esp-xl)">Nenhum resultado.</p>';
    return;
  }

  const total = data.reduce((s, l) => s + l.valor, 0);
  const itens = data.map((l) => `
    <div class="lancamento-item" onclick="navegarPara('lancamentos', {ano: ${new Date(l.data_evento + 'T12:00:00').getFullYear()}, mes: ${new Date(l.data_evento + 'T12:00:00').getMonth() + 1}})">
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao">${l.descricao}</div>
        <div class="lancamento-item__meta">
          ${formatarData(l.data_evento)} · ${l.categoria}${l.subcategoria ? ' / ' + l.subcategoria : ''}
        </div>
      </div>
      <div class="lancamento-item__valor ${l.valor >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(l.valor)}</div>
    </div>
  `).join('');

  resultado.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:var(--esp-sm);font-size:var(--tam-sm)">
      <span class="texto-secundario">${data.length} resultado${data.length !== 1 ? 's' : ''}</span>
      <span class="negrito ${total >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(total)}</span>
    </div>
    <div class="card">${itens}</div>
  `;
}

function _mesAbrev(m) {
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m - 1];
}

function formatarMoedaCurto(val) {
  if (val >= 1000) return 'R$' + (val / 1000).toFixed(1).replace('.', ',') + 'k';
  return 'R$' + val.toFixed(0);
}
