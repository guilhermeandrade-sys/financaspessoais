// Lógica de recorrências e fila de confirmação mensal

async function verificarRecorrenciasPendentes() {
  const agora = new Date();
  const mesAno = mesAnoParaString(agora.getFullYear(), agora.getMonth() + 1);

  const { data: recorrencias } = await buscarRecorrenciasAtivas();
  if (!recorrencias || recorrencias.length === 0) return;

  const { data: confirmacoes } = await buscarConfirmacoesDoMes(mesAno);
  const idsConfirmados = new Set((confirmacoes || []).map((c) => c.recorrencia_id));

  // Filtra as que ainda não foram processadas (sem status 'confirmado' ou 'rejeitado')
  const pendentes = recorrencias.filter((r) => !idsConfirmados.has(r.id));
  if (pendentes.length === 0) return;

  exibirFilaRecorrencias(pendentes, mesAno);
}

function exibirFilaRecorrencias(pendentes, mesAno) {
  let indice = 0;

  function renderizarCard() {
    if (indice >= pendentes.length) {
      fecharBottomSheet();
      mostrarToast('Recorrências processadas!', 'sucesso');
      return;
    }
    const rec = pendentes[indice];
    abrirBottomSheet(htmlCardRecorrencia(rec, pendentes.length, indice + 1));
    vincularAcoesRecorrencia(rec, mesAno, () => {
      indice++;
      renderizarCard();
    });
  }

  renderizarCard();
}

function htmlCardRecorrencia(rec, total, atual) {
  return `
    <p class="texto-secundario" style="margin-bottom:var(--esp-sm)">${atual} de ${total} recorrências</p>
    <h2 style="margin-bottom:var(--esp-md)">${rec.descricao}</h2>
    <div class="form-grupo">
      <label>Valor (editável)</label>
      <input type="number" id="rec-valor" step="0.01" value="${rec.valor_esperado}" />
    </div>
    <p class="texto-secundario" style="margin-bottom:var(--esp-md)">
      ${rec.categoria} · ${rec.subcategoria || ''} · ${rec.meio}
    </p>
    <div style="display:flex;gap:var(--esp-sm)">
      <button id="rec-confirmar" class="btn btn--primario" style="flex:1">Confirmar</button>
      <button id="rec-adiar"     class="btn btn--secundario" style="flex:1">Adiar</button>
      <button id="rec-rejeitar"  class="btn btn--perigo"     style="flex:1">Rejeitar</button>
    </div>
  `;
}

function vincularAcoesRecorrencia(rec, mesAno, proximo) {
  document.getElementById('rec-confirmar').onclick = async () => {
    const valor = parseFloat(document.getElementById('rec-valor').value);
    const hoje = new Date().toISOString().slice(0, 10);
    await inserirLancamento({
      descricao: rec.descricao,
      valor: -Math.abs(valor),
      data_evento: hoje,
      categoria: rec.categoria,
      subcategoria: rec.subcategoria,
      meio: rec.meio,
      tipo: TIPO_POR_CATEGORIA[rec.categoria] || 'Variável',
      status: 'realizado',
      grupo_recorrencia: rec.id,
    });
    await inserirConfirmacaoRecorrencia(rec.id, mesAno, 'confirmado');
    proximo();
  };

  document.getElementById('rec-rejeitar').onclick = async () => {
    await inserirConfirmacaoRecorrencia(rec.id, mesAno, 'rejeitado');
    proximo();
  };

  document.getElementById('rec-adiar').onclick = async () => {
    await inserirConfirmacaoRecorrencia(rec.id, mesAno, 'adiado');
    proximo();
  };
}
