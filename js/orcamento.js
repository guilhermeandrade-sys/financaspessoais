// Lógica de orçamento e projeção

async function calcularResumoMes(ano, mes) {
  const { data: lancamentos } = await buscarLancamentosPorMes(ano, mes);
  const { data: orcamentos } = await buscarOrcamentoPorMes(ano, mes);

  const resumo = {
    receita: 0,
    despesa: 0,
    saldo: 0,
    porCategoria: {},       // { cat: valor }
    porSubcategoria: {},    // { cat: { subcat: valor } }
    orcamentoPorCategoria: {},    // { cat: valor }
    orcamentoPorSubcategoria: {}, // { cat: { subcat: valor } }
  };

  // Separa registros com e sem subcategoria para evitar double-counting
  const orcsComSub = (orcamentos || []).filter((o) => o.subcategoria);
  const orcsSemSub = (orcamentos || []).filter((o) => !o.subcategoria);
  const catsComSubcat = new Set(orcsComSub.map((o) => o.categoria));

  for (const orc of orcsComSub) {
    const cat = orc.categoria;
    const sub = orc.subcategoria;
    if (!resumo.orcamentoPorSubcategoria[cat]) resumo.orcamentoPorSubcategoria[cat] = {};
    resumo.orcamentoPorSubcategoria[cat][sub] = (resumo.orcamentoPorSubcategoria[cat][sub] || 0) + orc.valor_mensal;
    resumo.orcamentoPorCategoria[cat] = (resumo.orcamentoPorCategoria[cat] || 0) + orc.valor_mensal;
  }

  for (const orc of orcsSemSub) {
    // Só usa orçamento de categoria quando não há subcategorias definidas (evita double-counting)
    if (!catsComSubcat.has(orc.categoria)) {
      resumo.orcamentoPorCategoria[orc.categoria] = orc.valor_mensal;
    }
  }

  for (const l of lancamentos || []) {
    if (l.status !== 'realizado') continue;
    if (l.valor > 0) {
      resumo.receita += l.valor;
    } else {
      resumo.despesa += Math.abs(l.valor);
      const cat = l.categoria;
      const sub = l.subcategoria;
      resumo.porCategoria[cat] = (resumo.porCategoria[cat] || 0) + Math.abs(l.valor);
      if (sub) {
        if (!resumo.porSubcategoria[cat]) resumo.porSubcategoria[cat] = {};
        resumo.porSubcategoria[cat][sub] = (resumo.porSubcategoria[cat][sub] || 0) + Math.abs(l.valor);
      }
    }
  }

  resumo.saldo = resumo.receita - resumo.despesa;
  return resumo;
}

function calcularDisponivelPorDia(resumo, ano, mes) {
  const hoje = new Date();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const diaAtual = (hoje.getFullYear() === ano && hoje.getMonth() + 1 === mes)
    ? hoje.getDate()
    : diasNoMes;
  const diasRestantes = diasNoMes - diaAtual + 1;
  if (diasRestantes <= 0) return 0;

  let orcadoVariavel = 0;
  let gastoVariavel = 0;

  for (const [cat, valor] of Object.entries(resumo.orcamentoPorCategoria)) {
    const tipo = TIPO_POR_CATEGORIA[cat];
    if (tipo === 'Variável NE' || tipo === 'Variável') orcadoVariavel += valor;
  }
  for (const [cat, valor] of Object.entries(resumo.porCategoria)) {
    const tipo = TIPO_POR_CATEGORIA[cat];
    if (tipo === 'Variável NE' || tipo === 'Variável') gastoVariavel += valor;
  }

  const disponivel = orcadoVariavel - gastoVariavel;
  return disponivel > 0 ? disponivel / diasRestantes : 0;
}
