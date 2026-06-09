// Lógica de patrimônio e projetos

async function calcularPatrimonioLiquido() {
  const { data } = await buscarPatrimonio();
  if (!data) return 0;
  return data.reduce((acc, item) => {
    return item.tipo === 'ativo' ? acc + item.valor : acc - item.valor;
  }, 0);
}
