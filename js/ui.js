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
        <input type="text" name="descricao" required value="${lancamento.descricao || ''}" placeholder="Ex: Conta de luz" />
      </div>
      <div class="form-grupo">
        <label>Valor (use negativo para despesa)</label>
        <input type="number" name="valor" step="0.01" required value="${lancamento.valor || ''}" placeholder="-150.00" />
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
      <button type="submit" class="btn btn--primario" style="margin-top:var(--esp-sm)">
        ${lancamento.id ? 'Salvar' : 'Lançar'}
      </button>
    </form>
  `;
}

function inicializarFormLancamento(aoSalvar) {
  const selCategoria = document.getElementById('sel-categoria');
  const selSubcat = document.getElementById('sel-subcategoria');

  selCategoria.addEventListener('change', () => {
    const subs = SUBCATEGORIAS[selCategoria.value] || [];
    selSubcat.innerHTML = '<option value="">Selecione…</option>' +
      subs.map((s) => `<option value="${s}">${s}</option>`).join('');
  });

  document.getElementById('form-lancamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const dados = {
      descricao:    fd.get('descricao'),
      valor:        parseFloat(fd.get('valor')),
      data_evento:  fd.get('data_evento'),
      categoria:    fd.get('categoria'),
      subcategoria: fd.get('subcategoria') || null,
      meio:         fd.get('meio'),
      tipo:         TIPO_POR_CATEGORIA[fd.get('categoria')] || 'Variável',
      status:       'realizado',
      parcelas:     parseInt(fd.get('parcelas') || '1', 10),
    };
    await aoSalvar(dados);
  });
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
