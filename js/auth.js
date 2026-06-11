// Inicializa o cliente Supabase — sem autenticação, app aberto
var db = null;

function inicializarSupabase() {
  db = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

// Carrega categorias e subcategorias do banco, sobrescrevendo os defaults do config.js
async function carregarCategorias() {
  const [{ data: cats }, { data: subs }] = await Promise.all([
    buscarCategorias(),
    buscarTodasSubcategorias(),
  ]);

  if (!cats || cats.length === 0) return; // fallback: mantém config.js

  // Reconstrói os globals
  CATEGORIAS.length = 0;
  for (const c of cats) CATEGORIAS.push(c.nome);

  for (const key of Object.keys(TIPO_POR_CATEGORIA)) delete TIPO_POR_CATEGORIA[key];
  for (const c of cats) TIPO_POR_CATEGORIA[c.nome] = c.tipo;

  for (const key of Object.keys(SUBCATEGORIAS)) delete SUBCATEGORIAS[key];
  for (const s of subs || []) {
    if (!SUBCATEGORIAS[s.categoria]) SUBCATEGORIAS[s.categoria] = [];
    SUBCATEGORIAS[s.categoria].push(s.nome);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  inicializarSupabase();
  await carregarCategorias();
  inicializarApp();
});
