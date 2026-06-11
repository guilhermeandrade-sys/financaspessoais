// Lógica de lançamentos e parcelamento

function gerarUUID() {
  return crypto.randomUUID();
}

function _normDesc(s) {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

async function verificarDuplicata(dados) {
  const d = new Date(dados.data_evento + 'T12:00:00');
  const antes = new Date(d); antes.setDate(d.getDate() - 3);
  const depois = new Date(d); depois.setDate(d.getDate() + 3);
  const { data: candidatos } = await buscarLancamentosPorPeriodo(
    antes.toISOString().slice(0, 10),
    depois.toISOString().slice(0, 10)
  );
  if (!candidatos) return null;
  const descNova = _normDesc(dados.descricao).slice(0, 18);
  return candidatos.find(
    (l) => Math.abs(l.valor - dados.valor) < 0.01 && _normDesc(l.descricao).includes(descNova)
  ) || null;
}

async function salvarLancamento(dados) {
  const { parcelas, ...base } = dados;

  if (parcelas > 1) {
    return salvarLancamentoParcelado(base, parcelas);
  }

  // Alerta de possível duplicata
  const duplicata = await verificarDuplicata(base);
  if (duplicata) {
    const confirmar = confirm(
      `Possível duplicata detectada:\n"${duplicata.descricao}" em ${formatarData(duplicata.data_evento)} (${formatarMoeda(duplicata.valor)})\n\nLançar mesmo assim?`
    );
    if (!confirmar) return null;
  }

  const { data, error } = await inserirLancamento(base);
  if (error) {
    mostrarToast('Erro ao salvar lançamento.', 'erro');
    return null;
  }
  mostrarToast('Lançamento salvo!', 'sucesso');
  invalidarIndiceSugestoes();
  return data;
}

async function salvarLancamentoParcelado(base, totalParcelas) {
  const grupoParcelas = gerarUUID();
  const valorParcela = Math.round((base.valor / totalParcelas) * 100) / 100;
  const lancamentos = [];

  for (let i = 1; i <= totalParcelas; i++) {
    const dataEvento = adicionarMeses(base.data_evento, i - 1);
    const isUltima = i === totalParcelas;
    // última parcela absorve diferença de centavos
    const valor = isUltima
      ? parseFloat((base.valor - valorParcela * (totalParcelas - 1)).toFixed(2))
      : valorParcela;

    lancamentos.push({
      ...base,
      valor,
      data_evento: dataEvento,
      descricao: `${base.descricao} ${i}/${totalParcelas}`,
      parcela_atual: i,
      parcela_total: totalParcelas,
      grupo_parcelas: grupoParcelas,
    });
  }

  const { error } = await inserirLancamentosEmLote(lancamentos);
  if (error) {
    mostrarToast('Erro ao salvar parcelas.', 'erro');
    return null;
  }
  mostrarToast(`${totalParcelas} parcelas lançadas!`, 'sucesso');
  invalidarIndiceSugestoes();
  return lancamentos;
}

function adicionarMeses(dataStr, meses) {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const d = new Date(ano, mes - 1 + meses, dia);
  // Ajusta caso o dia não exista no mês destino (ex: 31/jan + 1 mês = 28/fev)
  if (d.getDate() !== dia) d.setDate(0);
  return d.toISOString().slice(0, 10);
}

async function abrirFormNovoLancamento(aoSalvar) {
  abrirBottomSheet(htmlFormLancamento());
  inicializarFormLancamento(async (dados) => {
    const resultado = await salvarLancamento(dados);
    if (resultado) {
      fecharBottomSheet();
      if (aoSalvar) aoSalvar();
    }
  });
}
