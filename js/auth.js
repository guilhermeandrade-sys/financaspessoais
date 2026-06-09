// `supabase` é nome reservado pelo SDK global — cliente fica na variável `db`
var db = null;
let usuarioAtual = null;

function inicializarSupabase() {
  db = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

async function verificarSessao() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    usuarioAtual = session.user;
    return true;
  }
  return false;
}

async function fazerLogin(email, senha) {
  const { data, error } = await db.auth.signInWithPassword({ email, password: senha });
  if (error) return { error };
  usuarioAtual = data.user;
  return { data };
}

async function fazerLogout() {
  await db.auth.signOut();
  usuarioAtual = null;
  mostrarTelaLogin();
}

function obterUsuarioId() {
  return usuarioAtual?.id || null;
}

function mostrarTelaLogin() {
  document.getElementById('tela-login').classList.remove('oculto');
  document.getElementById('tela-app').classList.add('oculto');
}

function mostrarTelaApp() {
  document.getElementById('tela-login').classList.add('oculto');
  document.getElementById('tela-app').classList.remove('oculto');
}

document.addEventListener('DOMContentLoaded', async () => {
  inicializarSupabase();

  const autenticado = await verificarSessao();
  if (autenticado) {
    mostrarTelaApp();
    inicializarApp();
  } else {
    mostrarTelaLogin();
  }

  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const erroEl = document.getElementById('login-erro');

    erroEl.textContent = '';
    const { error } = await fazerLogin(email, senha);
    if (error) {
      erroEl.textContent = 'E-mail ou senha inválidos.';
      return;
    }
    mostrarTelaApp();
    inicializarApp();
  });
});
