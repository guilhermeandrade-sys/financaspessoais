// Inicializa o cliente Supabase — sem autenticação, app aberto
var db = null;

function inicializarSupabase() {
  db = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarSupabase();
  inicializarApp();
});
