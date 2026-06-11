// Camada de acesso ao Supabase — toda comunicação com o banco passa por aqui
// Usa a variável global `db` inicializada em auth.js

// ===== CATEGORIAS =====

async function buscarCategorias() {
  const { data, error } = await db
    .from('fp_categorias')
    .select('*')
    .eq('ativa', true)
    .order('ordem');
  if (error) console.error('buscarCategorias:', error);
  return { data, error };
}

async function inserirCategoria(categoria) {
  const { data, error } = await db.from('fp_categorias').insert(categoria).select().single();
  if (error) console.error('inserirCategoria:', error);
  return { data, error };
}

async function atualizarCategoria(nome, campos) {
  const { data, error } = await db.from('fp_categorias').update(campos).eq('nome', nome).select().single();
  if (error) console.error('atualizarCategoria:', error);
  return { data, error };
}

async function deletarCategoria(nome) {
  const { error } = await db.from('fp_categorias').delete().eq('nome', nome);
  if (error) console.error('deletarCategoria:', error);
  return { error };
}

async function buscarSubcategorias(categoria) {
  const { data, error } = await db
    .from('fp_subcategorias')
    .select('nome')
    .eq('categoria', categoria)
    .order('nome');
  if (error) console.error('buscarSubcategorias:', error);
  return { data, error };
}

async function buscarTodasSubcategorias() {
  const { data, error } = await db
    .from('fp_subcategorias')
    .select('categoria, nome')
    .order('categoria')
    .order('nome');
  if (error) console.error('buscarTodasSubcategorias:', error);
  return { data, error };
}

async function inserirSubcategoria(categoria, nome) {
  const { data, error } = await db.from('fp_subcategorias').insert({ categoria, nome }).select().single();
  if (error) console.error('inserirSubcategoria:', error);
  return { data, error };
}

async function deletarSubcategoria(categoria, nome) {
  const { error } = await db.from('fp_subcategorias').delete().eq('categoria', categoria).eq('nome', nome);
  if (error) console.error('deletarSubcategoria:', error);
  return { error };
}

// ===== LANÇAMENTOS =====

async function buscarLancamentosPorMes(ano, mes) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = new Date(ano, mes, 0).toISOString().slice(0, 10);
  const { data, error } = await db
    .from('fp_lancamentos')
    .select('*')
    .gte('data_evento', inicio)
    .lte('data_evento', fim)
    .order('data_evento', { ascending: false });
  if (error) console.error('buscarLancamentosPorMes:', error);
  return { data, error };
}

async function buscarLancamentosPorTexto(texto) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .select('*')
    .ilike('descricao', `%${texto}%`)
    .order('data_evento', { ascending: false })
    .limit(200);
  if (error) console.error('buscarLancamentosPorTexto:', error);
  return { data, error };
}

async function buscarLancamentosAno(ano) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .select('data_evento, valor, categoria, subcategoria, descricao, parcela_atual, parcela_total')
    .gte('data_evento', `${ano}-01-01`)
    .lte('data_evento', `${ano}-12-31`)
    .order('data_evento');
  if (error) console.error('buscarLancamentosAno:', error);
  return { data, error };
}

async function buscarLancamentosPorPeriodo(dataInicio, dataFim) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .select('*')
    .gte('data_evento', dataInicio)
    .lte('data_evento', dataFim)
    .order('data_evento', { ascending: false });
  if (error) console.error('buscarLancamentosPorPeriodo:', error);
  return { data, error };
}

async function inserirLancamento(lancamento) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .insert(lancamento)
    .select()
    .single();
  if (error) console.error('inserirLancamento:', error);
  return { data, error };
}

async function inserirLancamentosEmLote(lancamentos) {
  const { data, error } = await db.from('fp_lancamentos').insert(lancamentos).select();
  if (error) console.error('inserirLancamentosEmLote:', error);
  return { data, error };
}

async function atualizarLancamento(id, campos) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .update(campos)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('atualizarLancamento:', error);
  return { data, error };
}

async function buscarLancamentoPorId(id) {
  const { data, error } = await db
    .from('fp_lancamentos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error('buscarLancamentoPorId:', error);
  return { data, error };
}

async function deletarLancamento(id) {
  const { error } = await db.from('fp_lancamentos').delete().eq('id', id);
  if (error) console.error('deletarLancamento:', error);
  return { error };
}

async function deletarGrupoParcelas(grupoParcelas) {
  const { error } = await db
    .from('fp_lancamentos')
    .delete()
    .eq('grupo_parcelas', grupoParcelas);
  if (error) console.error('deletarGrupoParcelas:', error);
  return { error };
}

// ===== ORÇAMENTO =====

async function buscarOrcamentoPorMes(ano, mes) {
  const valido = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const { data, error } = await db
    .from('fp_orcamento')
    .select('*')
    .lte('valido_a_partir', valido)
    .order('valido_a_partir', { ascending: false });
  if (error) console.error('buscarOrcamentoPorMes:', error);
  // Para cada (categoria, subcategoria), pega o registro mais recente (primeiro da ordenação desc)
  const vistos = new Set();
  const resultado = [];
  for (const item of data || []) {
    const chave = `${item.categoria}||${item.subcategoria || ''}`;
    if (!vistos.has(chave)) {
      vistos.add(chave);
      resultado.push(item);
    }
  }
  return { data: resultado, error };
}

async function inserirOrcamento(orcamento) {
  const { data, error } = await db.from('fp_orcamento').insert(orcamento).select().single();
  if (error) console.error('inserirOrcamento:', error);
  return { data, error };
}

async function upsertOrcamento(categoria, valorMensal, validoAPartir) {
  const { data, error } = await db
    .from('fp_orcamento')
    .upsert({ categoria, valor_mensal: valorMensal, valido_a_partir: validoAPartir }, {
      onConflict: 'categoria,valido_a_partir',
    })
    .select()
    .single();
  if (error) console.error('upsertOrcamento:', error);
  return { data, error };
}

async function upsertOrcamentoSubcat(categoria, subcategoria, valorMensal, validoAPartir) {
  const { data, error } = await db
    .from('fp_orcamento')
    .upsert(
      { categoria, subcategoria: subcategoria || null, valor_mensal: valorMensal, valido_a_partir: validoAPartir },
      { onConflict: 'categoria,subcategoria,valido_a_partir' }
    )
    .select()
    .single();
  if (error) console.error('upsertOrcamentoSubcat:', error);
  return { data, error };
}

async function deletarOrcamento(id) {
  const { error } = await db.from('fp_orcamento').delete().eq('id', id);
  if (error) console.error('deletarOrcamento:', error);
  return { error };
}

async function buscarTodoOrcamento() {
  const { data, error } = await db
    .from('fp_orcamento')
    .select('*')
    .order('valido_a_partir', { ascending: false });
  if (error) console.error('buscarTodoOrcamento:', error);
  return { data, error };
}

// ===== RECORRÊNCIAS =====

async function buscarTodasRecorrencias() {
  const { data, error } = await db
    .from('fp_recorrencias')
    .select('*')
    .order('ativa', { ascending: false })
    .order('descricao');
  if (error) console.error('buscarTodasRecorrencias:', error);
  return { data, error };
}

async function inserirRecorrenciaNova(rec) {
  const { data, error } = await db.from('fp_recorrencias').insert(rec).select().single();
  if (error) console.error('inserirRecorrenciaNova:', error);
  return { data, error };
}

async function deletarRecorrencia(id) {
  const { error } = await db.from('fp_recorrencias').delete().eq('id', id);
  if (error) console.error('deletarRecorrencia:', error);
  return { error };
}

async function buscarRecorrenciasAtivas() {
  const { data, error } = await db
    .from('fp_recorrencias')
    .select('*')
    .eq('ativa', true)
    .order('descricao');
  if (error) console.error('buscarRecorrenciasAtivas:', error);
  return { data, error };
}

async function buscarConfirmacoesDoMes(mesAno) {
  const { data, error } = await db
    .from('fp_recorrencias_confirmadas')
    .select('*')
    .eq('mes_ano', mesAno);
  if (error) console.error('buscarConfirmacoesDoMes:', error);
  return { data, error };
}

async function inserirConfirmacaoRecorrencia(recorrenciaId, mesAno, status) {
  const { data, error } = await db
    .from('fp_recorrencias_confirmadas')
    .insert({ recorrencia_id: recorrenciaId, mes_ano: mesAno, status })
    .select()
    .single();
  if (error) console.error('inserirConfirmacaoRecorrencia:', error);
  return { data, error };
}

async function inserirRecorrencia(recorrencia) {
  const { data, error } = await db
    .from('fp_recorrencias')
    .insert(recorrencia)
    .select()
    .single();
  if (error) console.error('inserirRecorrencia:', error);
  return { data, error };
}

async function atualizarRecorrencia(id, campos) {
  const { data, error } = await db
    .from('fp_recorrencias')
    .update(campos)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('atualizarRecorrencia:', error);
  return { data, error };
}

// ===== PATRIMÔNIO =====

async function buscarPatrimonio() {
  const { data, error } = await db
    .from('fp_patrimonio')
    .select('*')
    .order('tipo')
    .order('descricao');
  if (error) console.error('buscarPatrimonio:', error);
  return { data, error };
}

async function buscarPatrimonioPorId(id) {
  const { data, error } = await db.from('fp_patrimonio').select('*').eq('id', id).single();
  if (error) console.error('buscarPatrimonioPorId:', error);
  return { data, error };
}

async function inserirPatrimonio(item) {
  const { data, error } = await db
    .from('fp_patrimonio')
    .insert(item)
    .select()
    .single();
  if (error) console.error('inserirPatrimonio:', error);
  return { data, error };
}

async function atualizarPatrimonio(id, campos) {
  const { data, error } = await db
    .from('fp_patrimonio')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('atualizarPatrimonio:', error);
  return { data, error };
}

async function deletarPatrimonio(id) {
  const { error } = await db.from('fp_patrimonio').delete().eq('id', id);
  if (error) console.error('deletarPatrimonio:', error);
  return { error };
}

// ===== PROJETOS =====

async function buscarProjetoPorId(id) {
  const { data, error } = await db.from('fp_projetos').select('*').eq('id', id).single();
  if (error) console.error('buscarProjetoPorId:', error);
  return { data, error };
}

async function buscarProjetos() {
  const { data, error } = await db
    .from('fp_projetos')
    .select('*')
    .order('prazo')
    .order('descricao');
  if (error) console.error('buscarProjetos:', error);
  return { data, error };
}

async function inserirProjeto(projeto) {
  const { data, error } = await db
    .from('fp_projetos')
    .insert(projeto)
    .select()
    .single();
  if (error) console.error('inserirProjeto:', error);
  return { data, error };
}

async function atualizarProjeto(id, campos) {
  const { data, error } = await db
    .from('fp_projetos')
    .update(campos)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('atualizarProjeto:', error);
  return { data, error };
}

async function deletarProjeto(id) {
  const { error } = await db.from('fp_projetos').delete().eq('id', id);
  if (error) console.error('deletarProjeto:', error);
  return { error };
}
