// Lógica de recorrências e fila de confirmação mensal

async function verificarRecorrenciasPendentes() {
  const agora = new Date();
  const mesAno = mesAnoParaString(agora.getFullYear(), agora.getMonth() + 1);

  const { data: recorrencias } = await buscarRecorrenciasAtivas();
  if (!recorrencias || recorrencias.length === 0) return;

  const { data: confirmacoes } = await buscarConfirmacoesDoMes(mesAno);
  // Só exclui confirmado/rejeitado — 'adiado' reaparece na próxima sessão
  const idsFinalizados = new Set(
    (confirmacoes || [])
      .filter((c) => c.status === 'confirmado' || c.status === 'rejeitado')
      .map((c) => c.recorrencia_id)
  );
  const pendentes = recorrencias.filter((r) => !idsFinalizados.has(r.id));
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
      <input type="number" id="rec-valor" step="0.01" min="0" value="${Math.abs(rec.valor_esperado)}" />
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
    const agora = new Date();
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    const dia = Math.min(rec.dia_do_mes || agora.getDate(), ultimoDia);
    const dataEvento = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    await inserirLancamento({
      descricao: rec.descricao,
      valor: -Math.abs(valor),
      data_evento: dataEvento,
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
