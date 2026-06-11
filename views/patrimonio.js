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
      <div style="display:flex;align-items:center;gap:var(--esp-sm)">
        <div class="lancamento-item__valor ${p.tipo === 'ativo' ? 'positivo' : 'negativo'}">
          ${formatarMoeda(p.valor)}
        </div>
        <button class="btn btn--ghost btn--sm" style="padding:2px 6px;font-size:var(--tam-xs)" onclick="_editarPatrimonio('${p.id}')">✏️</button>
        <button class="btn btn--ghost btn--sm" style="padding:2px 6px;font-size:var(--tam-xs)" onclick="_excluirPatrimonio('${p.id}','${p.descricao.replace(/'/g, '')}')">✕</button>
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
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <span>${p.descricao}</span>
              <span class="texto-secundario" style="font-size:var(--tam-sm);margin-left:var(--esp-sm)">${p.ano_alvo || ''}</span>
            </div>
            <div style="display:flex;gap:4px">
              <button class="btn btn--ghost btn--sm" style="padding:2px 6px;font-size:var(--tam-xs)" onclick="_editarProjeto('${p.id}')">✏️</button>
              <button class="btn btn--ghost btn--sm" style="padding:2px 6px;font-size:var(--tam-xs)" onclick="_excluirProjeto('${p.id}','${p.descricao.replace(/'/g, '')}')">✕</button>
            </div>
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

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--esp-sm)">
      <h3 style="color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Ativos</h3>
      <button class="btn btn--ghost btn--sm" onclick="_abrirFormPatrimonio('ativo')">+ adicionar</button>
    </div>
    ${ativos.length ? `<div class="card" style="margin-bottom:var(--esp-md)">${htmlLista(ativos)}</div>` : '<p class="texto-secundario" style="margin-bottom:var(--esp-md)">Nenhum ativo cadastrado.</p>'}

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--esp-sm)">
      <h3 style="color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Passivos</h3>
      <button class="btn btn--ghost btn--sm" onclick="_abrirFormPatrimonio('passivo')">+ adicionar</button>
    </div>
    ${passivos.length ? `<div class="card" style="margin-bottom:var(--esp-md)">${htmlLista(passivos)}</div>` : '<p class="texto-secundario" style="margin-bottom:var(--esp-md)">Nenhum passivo cadastrado.</p>'}

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--esp-sm)">
      <h3 style="color:var(--cor-texto-secundario);font-size:var(--tam-sm);text-transform:uppercase;letter-spacing:0.05em">Projetos / Reservas</h3>
      <button class="btn btn--ghost btn--sm" onclick="_abrirFormProjeto()">+ adicionar</button>
    </div>
    ${projetos && projetos.length ? htmlProjetos : '<p class="texto-secundario">Nenhum projeto cadastrado.</p>'}
  `;
}

// ===== PATRIMÔNIO — FORMULÁRIO =====

const _subtiposAtivo = ['investimento', 'imóvel', 'veículo', 'outro'];
const _subtiposPassivo = ['financiamento', 'dívida', 'outro'];

function _abrirFormPatrimonio(tipo, dados) {
  const subtipo = tipo === 'ativo' ? _subtiposAtivo : _subtiposPassivo;
  const optsSubtipo = subtipo.map((s) => `<option value="${s}" ${dados?.subtipo === s ? 'selected' : ''}>${s}</option>`).join('');
  abrirBottomSheet(`
    <h3 style="margin-bottom:var(--esp-md)">${dados ? 'Editar' : 'Novo'} ${tipo}</h3>
    <div class="form-grupo">
      <label class="form-label">Descrição</label>
      <input id="_pat-desc" class="form-input" type="text" value="${dados?.descricao || ''}" placeholder="ex: Tesouro Direto" autocomplete="off" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--esp-sm)">
      <div class="form-grupo">
        <label class="form-label">Subtipo</label>
        <select id="_pat-subtipo" class="form-input">${optsSubtipo}</select>
      </div>
      <div class="form-grupo">
        <label class="form-label">Valor (R$)</label>
        <input id="_pat-valor" class="form-input" type="number" min="0" step="0.01" value="${dados?.valor || ''}" placeholder="0,00" />
      </div>
    </div>
    <div class="form-grupo">
      <label class="form-label">Instituição (opcional)</label>
      <input id="_pat-inst" class="form-input" type="text" value="${dados?.instituicao || ''}" placeholder="ex: XP, Caixa" autocomplete="off" />
    </div>
    <button class="btn btn--primario" style="width:100%;margin-top:var(--esp-md)"
      onclick="_salvarPatrimonio('${tipo}', '${dados?.id || ''}')">Salvar</button>
  `);
  setTimeout(() => document.getElementById('_pat-desc')?.focus(), 100);
}

async function _salvarPatrimonio(tipo, id) {
  const descricao = document.getElementById('_pat-desc')?.value.trim();
  const subtipo = document.getElementById('_pat-subtipo')?.value;
  const valor = parseFloat(document.getElementById('_pat-valor')?.value.replace(',', '.'));
  const instituicao = document.getElementById('_pat-inst')?.value.trim() || null;
  if (!descricao) { mostrarToast('Informe a descrição.', 'erro'); return; }
  if (isNaN(valor) || valor < 0) { mostrarToast('Valor inválido.', 'erro'); return; }
  const campos = { tipo, subtipo, descricao, valor, instituicao };
  const { error } = id
    ? await atualizarPatrimonio(id, campos)
    : await inserirPatrimonio(campos);
  if (error) { mostrarToast('Erro ao salvar.', 'erro'); return; }
  fecharBottomSheet();
  mostrarToast(id ? 'Atualizado!' : 'Adicionado!', 'sucesso');
  renderizarPatrimonio();
}

async function _editarPatrimonio(id) {
  const { data: todos } = await buscarPatrimonio();
  const item = (todos || []).find((p) => p.id === id);
  if (!item) return;
  _abrirFormPatrimonio(item.tipo, item);
}

async function _excluirPatrimonio(id, descricao) {
  if (!confirm(`Excluir "${descricao}"?`)) return;
  const { error } = await deletarPatrimonio(id);
  if (error) { mostrarToast('Erro ao excluir.', 'erro'); return; }
  mostrarToast('Removido.', 'sucesso');
  renderizarPatrimonio();
}

// ===== PROJETOS — FORMULÁRIO =====

const _prazoOpts = ['curto', 'medio', 'longo', 'aposentadoria'];

function _abrirFormProjeto(dados) {
  const optsPrazo = _prazoOpts.map((p) => `<option value="${p}" ${dados?.prazo === p ? 'selected' : ''}>${p}</option>`).join('');
  abrirBottomSheet(`
    <h3 style="margin-bottom:var(--esp-md)">${dados ? 'Editar' : 'Novo'} projeto</h3>
    <div class="form-grupo">
      <label class="form-label">Descrição</label>
      <input id="_proj-desc" class="form-input" type="text" value="${dados?.descricao || ''}" placeholder="ex: Reserva de emergência" autocomplete="off" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--esp-sm)">
      <div class="form-grupo">
        <label class="form-label">Valor alvo (R$)</label>
        <input id="_proj-alvo" class="form-input" type="number" min="0" step="0.01" value="${dados?.valor_alvo || ''}" placeholder="0,00" />
      </div>
      <div class="form-grupo">
        <label class="form-label">Aplicado (R$)</label>
        <input id="_proj-aplicado" class="form-input" type="number" min="0" step="0.01" value="${dados?.valor_aplicado || ''}" placeholder="0,00" />
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--esp-sm)">
      <div class="form-grupo">
        <label class="form-label">Prazo</label>
        <select id="_proj-prazo" class="form-input">${optsPrazo}</select>
      </div>
      <div class="form-grupo">
        <label class="form-label">Ano alvo</label>
        <input id="_proj-ano" class="form-input" type="number" min="2024" value="${dados?.ano_alvo || ''}" placeholder="${new Date().getFullYear()}" />
      </div>
    </div>
    <button class="btn btn--primario" style="width:100%;margin-top:var(--esp-md)"
      onclick="_salvarProjeto('${dados?.id || ''}')">Salvar</button>
  `);
  setTimeout(() => document.getElementById('_proj-desc')?.focus(), 100);
}

async function _salvarProjeto(id) {
  const descricao = document.getElementById('_proj-desc')?.value.trim();
  const valor_alvo = parseFloat(document.getElementById('_proj-alvo')?.value.replace(',', '.'));
  const valor_aplicado = parseFloat(document.getElementById('_proj-aplicado')?.value.replace(',', '.') || '0');
  const prazo = document.getElementById('_proj-prazo')?.value;
  const ano_alvo = parseInt(document.getElementById('_proj-ano')?.value) || null;
  if (!descricao) { mostrarToast('Informe a descrição.', 'erro'); return; }
  if (isNaN(valor_alvo) || valor_alvo < 0) { mostrarToast('Valor alvo inválido.', 'erro'); return; }
  const campos = { descricao, valor_alvo, valor_aplicado: isNaN(valor_aplicado) ? 0 : valor_aplicado, prazo, ano_alvo };
  const { error } = id
    ? await atualizarProjeto(id, campos)
    : await inserirProjeto(campos);
  if (error) { mostrarToast('Erro ao salvar.', 'erro'); return; }
  fecharBottomSheet();
  mostrarToast(id ? 'Atualizado!' : 'Adicionado!', 'sucesso');
  renderizarPatrimonio();
}

async function _editarProjeto(id) {
  const { data: todos } = await buscarProjetos();
  const item = (todos || []).find((p) => p.id === id);
  if (!item) return;
  _abrirFormProjeto(item);
}

async function _excluirProjeto(id, descricao) {
  if (!confirm(`Excluir o projeto "${descricao}"?`)) return;
  const { error } = await deletarProjeto(id);
  if (error) { mostrarToast('Erro ao excluir.', 'erro'); return; }
  mostrarToast('Removido.', 'sucesso');
  renderizarPatrimonio();
}
