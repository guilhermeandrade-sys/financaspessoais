// Componentes e utilitários de interface

// ===== FORMATAÇÃO =====

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarMesAno(ano, mes) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[mes - 1]} ${ano}`;
}

function mesAnoParaString(ano, mes) {
  return `${ano}-${String(mes).padStart(2, '0')}`;
}

// ===== TOAST =====

let timerToast = null;

function mostrarToast(mensagem, tipo = '') {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.className = `toast${tipo ? ' toast--' + tipo : ''}`;
  if (timerToast) clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.add('oculto'), 3000);
}

// ===== BOTTOM SHEET =====

function abrirBottomSheet(html) {
  const bs = document.getElementById('bottom-sheet');
  document.getElementById('bottom-sheet__conteudo').innerHTML = html;
  bs.classList.remove('oculto');
  bs.querySelector('.bottom-sheet__backdrop').onclick = fecharBottomSheet;
}

function fecharBottomSheet() {
  document.getElementById('bottom-sheet').classList.add('oculto');
  document.getElementById('bottom-sheet__conteudo').innerHTML = '';
}

// ===== AUTO-SUGESTÃO DE CATEGORIA =====

// Dicionário estático — fallback quando o histórico ainda é ralo
const DICIONARIO_SUGESTAO = [
  { p: ['supermercado', 'carrefour', 'mercadao', 'covabra', 'idealmarket', 'boa super', 'mercado', 'atacadao', 'assai', 'extra '], c: 'Alimentação', s: 'Supermercado' },
  { p: ['padaria', 'padoca', 'paes', 'bakery', 'confeitaria', 'cafe', 'cafeteria', 'gelato', 'sorvete'], c: 'Alimentação', s: 'Padaria' },
  { p: ['restaurante', 'pizzaria', 'lanchonete', 'burguer', 'sushi', 'churrascaria', 'assados', 'kitchen', 'grill'], c: 'Alimentação', s: 'Refeições em restaurante' },
  { p: ['ifood', 'rappi', 'uber eats', 'delivery'], c: 'Alimentação', s: 'Refeições em restaurante' },
  { p: ['feira', 'hortifruti', 'verdura', 'legume'], c: 'Alimentação', s: 'Feira' },
  { p: ['mcdonalds', 'burger king', 'subway', 'bobs ', 'giraffas', 'frango', 'lanche'], c: 'Alimentação', s: 'Lanches & Snacks' },
  { p: ['posto ', 'combustivel', 'gasolina', 'etanol', 'shell', 'ipiranga', 'petrobras', 'br dist'], c: 'Transporte', s: 'Combustível' },
  { p: ['estacionamento', 'estac ', 'parking', 'park '], c: 'Transporte', s: 'Estacionamento' },
  { p: ['pedagio', 'zul tag', 'sem parar', 'conectcar'], c: 'Transporte', s: 'Pedágio' },
  { p: ['seguro auto', 'porto seguro', 'suhai', 'allianz', 'tokio'], c: 'Transporte', s: 'Seguro' },
  { p: ['ipva', 'licenciamento', 'detran'], c: 'Transporte', s: 'IPVA' },
  { p: ['autozone', 'midas', 'mecanica', 'borracharia', 'funilaria', 'manutencao auto'], c: 'Transporte', s: 'Manutenção' },
  { p: ['uber', 'taxi', '99pop', 'cabify'], c: 'Transporte', s: 'Outros' },
  { p: ['netflix', 'spotify', 'apple', 'google one', 'youtube', 'amazon prime', 'disney', 'hbo', 'microsoft', 'adobe', 'dropbox', 'icloud'], c: 'Comunicação', s: 'Apps (Netflix, Spotify, etc)' },
  { p: ['claro', 'vivo', 'tim ', 'oi ', 'nextel', 'celular', 'telefone', 'telecom'], c: 'Comunicação', s: 'Telefone Celular' },
  { p: ['internet', 'fibra', 'banda larga', 'net ', 'sky ', 'oi fibra'], c: 'Comunicação', s: 'Internet' },
  { p: ['drogasil', 'drogaria', 'droga', 'farmacia', 'ultrafarma', 'pacheco', 'nissei'], c: 'Pessoais', s: 'Farmácia' },
  { p: ['manicure', 'esmalte', 'unha'], c: 'Pessoais', s: 'Manicure' },
  { p: ['salao', 'barbeiro', 'barbearia', 'cabeleireiro', 'hair'], c: 'Pessoais', s: 'Salão/Barbeiro' },
  { p: ['academia', 'gym', 'smartfit', 'bodytech', 'bluefit', 'pilates', 'crossfit'], c: 'Saúde', s: 'Academia/Esportes' },
  { p: ['dentista', 'odonto', 'dental', 'ortodontia'], c: 'Saúde', s: 'Dentista' },
  { p: ['nutricionista', 'nutricao'], c: 'Saúde', s: 'Nutricionista' },
  { p: ['suplemento', 'whey', 'creatina', 'growth', 'integralmédica', 'max titanium'], c: 'Pessoais', s: 'Suplementos' },
  { p: ['renner', 'riachuelo', 'cea ', 'shein', 'zara', 'hm ', 'forever 21', 'decathlon', 'netshoes', 'centauro', 'shopee', 'mercadolivre', 'amazon', 'americanas', 'magazine', 'casas bahia'], c: 'Pessoais', s: 'Compras' },
  { p: ['condominio', 'condominium'], c: 'Moradia', s: 'Condomínio' },
  { p: ['financiamento', 'prestacao imovel', 'caixa economica hab', 'itau hab'], c: 'Moradia', s: 'Financiamento' },
  { p: ['energia', 'eletricidade', 'cpfl', 'cemig', 'enel', 'light ', 'coelba'], c: 'Moradia', s: 'Energia Elétrica' },
  { p: ['cozinheira', 'diarista', 'faxina', 'limpeza', 'domestica'], c: 'Moradia', s: 'Serviços de limpeza' },
  { p: ['jardim', 'jardineiro'], c: 'Moradia', s: 'Decoração e outros' },
  { p: ['iptu'], c: 'Moradia', s: 'IPTU' },
  { p: ['colegio', 'escola', 'aurum', 'educacao infantil', 'mensalidade escolar'], c: 'Dependentes', s: 'Educação (colégio)' },
  { p: ['jiu jitsu', 'jiujitsu', 'judo', 'karate', 'natacao', 'futebol infantil'], c: 'Dependentes', s: 'Jiu Jitsu' },
  { p: ['cinema', 'moviecom', 'cinemark', 'kinoplex'], c: 'Lazer', s: 'Cinema/Teatro/Shows' },
  { p: ['teatro', 'show ', 'ingresso', 'sympla', 'ticket', 'bilheteria'], c: 'Lazer', s: 'Cinema/Teatro/Shows' },
  { p: ['acampamento', 'camping', 'trilha'], c: 'Lazer', s: 'Acampamento' },
  { p: ['bar ', 'balada', 'pub ', 'cerveja', 'drinks', 'happy hour'], c: 'Lazer', s: 'Bares e Restaurantes' },
  { p: ['viagem', 'hotel', 'airbnb', 'booking', 'passagem', 'aereo', 'gol ', 'latam', 'azul '], c: 'Lazer', s: 'Viagens' },
  { p: ['pet ', 'petshop', 'veterinario', 'racao', 'petz ', 'cobasi'], c: 'Diversas', s: 'Animais de estimação' },
];

function _normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Índice histórico: Map de token → array de {categoria, subcategoria}
let _indiceHistorico = null;

function _construirIndice(lancamentos) {
  const indice = new Map();
  for (const l of lancamentos) {
    if (!l.categoria || !l.descricao) continue;
    const tokens = _normalizar(l.descricao).split(' ').filter(t => t.length >= 3);
    for (const token of tokens) {
      if (!indice.has(token)) indice.set(token, []);
      indice.get(token).push({ categoria: l.categoria, subcategoria: l.subcategoria || '' });
    }
  }
  return indice;
}

function _buscarNoIndice(texto) {
  if (!_indiceHistorico) return null;
  const tokens = _normalizar(texto).split(' ').filter(t => t.length >= 3);
  if (!tokens.length) return null;

  // Conta votos por (categoria, subcategoria)
  const votos = new Map();
  for (const token of tokens) {
    // Busca exata e parcial (token como prefixo de chave existente)
    for (const [chave, entradas] of _indiceHistorico) {
      if (chave.startsWith(token) || chave.includes(token)) {
        for (const e of entradas) {
          const k = `${e.categoria}||${e.subcategoria}`;
          votos.set(k, (votos.get(k) || 0) + 1);
        }
      }
    }
  }

  if (!votos.size) return null;
  // Pega o mais votado
  const [melhor] = [...votos.entries()].sort((a, b) => b[1] - a[1]);
  const [cat, sub] = melhor[0].split('||');
  return { categoria: cat, subcategoria: sub };
}

function _buscarNoDicionario(texto) {
  const norm = _normalizar(texto);
  for (const entrada of DICIONARIO_SUGESTAO) {
    if (entrada.p.some(p => norm.includes(p))) {
      return { categoria: entrada.c, subcategoria: entrada.s };
    }
  }
  return null;
}

function buscarSugestao(texto) {
  if (!texto || texto.length < 3) return null;
  // Histórico tem prioridade sobre dicionário estático
  return _buscarNoIndice(texto) || _buscarNoDicionario(texto);
}

async function carregarIndiceSugestoes() {
  // Busca lançamentos dos últimos 12 meses para construir o índice
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1).toISOString().slice(0, 10);
  const fim = hoje.toISOString().slice(0, 10);
  const { data } = await buscarLancamentosPorPeriodo(inicio, fim);
  _indiceHistorico = _construirIndice(data || []);
}

// ===== FORMULÁRIO DE LANÇAMENTO =====

function htmlFormLancamento(lancamento = {}) {
  const categoriasSel = CATEGORIAS.map((c) =>
    `<option value="${c}" ${lancamento.categoria === c ? 'selected' : ''}>${c}</option>`
  ).join('');

  const subcatSel = lancamento.categoria
    ? (SUBCATEGORIAS[lancamento.categoria] || []).map((s) =>
        `<option value="${s}" ${lancamento.subcategoria === s ? 'selected' : ''}>${s}</option>`
      ).join('')
    : '';

  const hoje = new Date().toISOString().slice(0, 10);

  return `
    <h2 style="margin-bottom:var(--esp-md);font-size:var(--tam-lg)">
      ${lancamento.id ? 'Editar Lançamento' : 'Novo Lançamento'}
    </h2>
    <form id="form-lancamento">
      <div class="form-grupo">
        <label>Descrição</label>
        <input type="text" name="descricao" id="inp-descricao" required
               value="${lancamento.descricao || ''}"
               placeholder="Ex: Conta de luz"
               autocomplete="off" />
        <div id="sugestao-categoria" class="sugestao-chip oculto"></div>
      </div>
      <div class="form-grupo">
        <label>Valor <span id="badge-tipo" class="badge-tipo"></span></label>
        <input type="number" name="valor" step="0.01" min="0" required
               value="${lancamento.valor != null ? Math.abs(lancamento.valor) : ''}"
               placeholder="150,00" />
      </div>
      <div class="form-grupo">
        <label>Data do evento</label>
        <input type="date" name="data_evento" required value="${lancamento.data_evento || hoje}" />
      </div>
      <div class="form-grupo">
        <label>Categoria</label>
        <select name="categoria" required id="sel-categoria">
          <option value="">Selecione…</option>
          ${categoriasSel}
        </select>
      </div>
      <div class="form-grupo">
        <label>Subcategoria</label>
        <select name="subcategoria" id="sel-subcategoria">
          <option value="">Selecione…</option>
          ${subcatSel}
        </select>
      </div>
      <div class="form-grupo">
        <label>Meio de pagamento</label>
        <select name="meio" required>
          <option value="cartao" ${lancamento.meio === 'cartao' ? 'selected' : ''}>Cartão</option>
          <option value="pix"    ${lancamento.meio === 'pix'    ? 'selected' : ''}>PIX</option>
          <option value="outro"  ${lancamento.meio === 'outro'  ? 'selected' : ''}>Outro</option>
        </select>
      </div>
      <div class="form-grupo" id="grupo-parcelas" style="${lancamento.id ? 'display:none' : ''}">
        <label>Parcelado em quantas vezes? (deixe 1 para à vista)</label>
        <input type="number" name="parcelas" min="1" max="60" value="1" />
      </div>
      <div class="form-grupo">
        <label>Observação <span class="texto-secundario" style="font-weight:400">(opcional)</span></label>
        <input type="text" name="observacao" value="${lancamento.observacao || ''}"
               placeholder="Ex: reembolso pendente, aniversário da Li…" autocomplete="off" />
      </div>
      <button type="submit" class="btn btn--primario" style="margin-top:var(--esp-sm)">
        ${lancamento.id ? 'Salvar' : 'Lançar'}
      </button>
    </form>
  `;
}

function _aplicarSugestao(cat, sub) {
  const selCat = document.getElementById('sel-categoria');
  const selSub = document.getElementById('sel-subcategoria');
  if (!selCat) return;

  selCat.value = cat;
  // Atualiza subcategorias disponíveis
  const subs = SUBCATEGORIAS[cat] || [];
  selSub.innerHTML = '<option value="">Selecione…</option>' +
    subs.map(s => `<option value="${s}">${s}</option>`).join('');
  if (sub && subs.includes(sub)) selSub.value = sub;
}

function inicializarFormLancamento(aoSalvar) {
  const selCategoria = document.getElementById('sel-categoria');
  const selSubcat    = document.getElementById('sel-subcategoria');
  const inpDesc      = document.getElementById('inp-descricao');
  const chipSugestao = document.getElementById('sugestao-categoria');

  // Carrega o índice histórico em background (sem bloquear o form)
  if (!_indiceHistorico) {
    carregarIndiceSugestoes();
  }

  function atualizarBadgeTipo() {
    const badge = document.getElementById('badge-tipo');
    if (!badge) return;
    const tipo = TIPO_POR_CATEGORIA[selCategoria.value];
    if (!selCategoria.value) { badge.textContent = ''; badge.className = 'badge-tipo'; return; }
    if (tipo === 'Receita') {
      badge.textContent = '↑ Receita';
      badge.className = 'badge-tipo badge-tipo--receita';
    } else {
      badge.textContent = '↓ Despesa';
      badge.className = 'badge-tipo badge-tipo--despesa';
    }
  }

  // Atualiza subcategorias e badge quando categoria muda manualmente
  selCategoria.addEventListener('change', () => {
    const subs = SUBCATEGORIAS[selCategoria.value] || [];
    selSubcat.innerHTML = '<option value="">Selecione…</option>' +
      subs.map(s => `<option value="${s}">${s}</option>`).join('');
    chipSugestao.classList.add('oculto');
    atualizarBadgeTipo();
  });

  // Badge inicial se já tem categoria (modo edição)
  atualizarBadgeTipo();

  // Auto-sugestão ao digitar
  let timerSugestao = null;
  inpDesc.addEventListener('input', () => {
    clearTimeout(timerSugestao);
    timerSugestao = setTimeout(() => {
      // Só sugere se categoria ainda não foi preenchida
      if (selCategoria.value) return;
      const sug = buscarSugestao(inpDesc.value);
      if (sug) {
        chipSugestao.innerHTML =
          `<span class="sugestao-chip__label">Sugestão:</span>
           <button type="button" class="sugestao-chip__btn"
                   onclick="_aplicarSugestao('${sug.categoria}','${sug.subcategoria}');this.closest('.sugestao-chip').classList.add('oculto')">
             ${sug.categoria}${sug.subcategoria ? ' / ' + sug.subcategoria : ''}
           </button>`;
        chipSugestao.classList.remove('oculto');
      } else {
        chipSugestao.classList.add('oculto');
      }
    }, 280);
  });

  // Se já tem descrição ao abrir (edição), sugere imediatamente
  if (inpDesc.value && !selCategoria.value) {
    setTimeout(() => {
      const sug = buscarSugestao(inpDesc.value);
      if (sug) {
        chipSugestao.innerHTML =
          `<span class="sugestao-chip__label">Sugestão:</span>
           <button type="button" class="sugestao-chip__btn"
                   onclick="_aplicarSugestao('${sug.categoria}','${sug.subcategoria}');this.closest('.sugestao-chip').classList.add('oculto')">
             ${sug.categoria}${sug.subcategoria ? ' / ' + sug.subcategoria : ''}
           </button>`;
        chipSugestao.classList.remove('oculto');
      }
    }, 400);
  }

  document.getElementById('form-lancamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cat = fd.get('categoria');
    const tipo = TIPO_POR_CATEGORIA[cat] || 'Variável';
    const valorAbs = Math.abs(parseFloat(fd.get('valor')));
    const dados = {
      descricao:    fd.get('descricao'),
      valor:        tipo === 'Receita' ? valorAbs : -valorAbs,
      data_evento:  fd.get('data_evento'),
      categoria:    cat,
      subcategoria: fd.get('subcategoria') || null,
      meio:         fd.get('meio'),
      tipo,
      status:       'realizado',
      parcelas:     parseInt(fd.get('parcelas') || '1', 10),
      observacao:   fd.get('observacao') || null,
    };
    await aoSalvar(dados);
  });
}

// Invalida o índice quando um novo lançamento é salvo (para capturar o aprendizado)
function invalidarIndiceSugestoes() {
  _indiceHistorico = null;
}

// ===== BARRA DE PROGRESSO =====

function htmlBarraProgresso(realizado, orcado) {
  const pct = orcado > 0 ? Math.min((realizado / orcado) * 100, 100) : 0;
  const cls = pct >= 100 ? 'estourado' : pct >= 85 ? 'alerta' : '';
  return `
    <div class="barra-progresso">
      <div class="barra-progresso__preenchimento${cls ? ' barra-progresso__preenchimento--' + cls : ''}"
           style="width:${pct}%"></div>
    </div>
  `;
}
