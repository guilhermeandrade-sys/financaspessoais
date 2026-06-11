const CACHE_NOME = 'financas-v7';
const ARQUIVOS_CACHE = [
  '/financaspessoais/',
  '/financaspessoais/index.html',
  '/financaspessoais/css/style.css',
  '/financaspessoais/js/config.js',
  '/financaspessoais/js/auth.js',
  '/financaspessoais/js/db.js',
  '/financaspessoais/js/ui.js',
  '/financaspessoais/js/lancamentos.js',
  '/financaspessoais/js/recorrencias.js',
  '/financaspessoais/js/orcamento.js',
  '/financaspessoais/js/patrimonio.js',
  '/financaspessoais/views/home.js',
  '/financaspessoais/views/lancamentos.js',
  '/financaspessoais/views/analise.js',
  '/financaspessoais/views/patrimonio.js',
  '/financaspessoais/views/projecao.js',
  '/financaspessoais/views/orcamento-config.js',
  '/financaspessoais/js/router.js',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  // Requisições ao Supabase sempre vão para a rede
  if (evento.request.url.includes('supabase.co')) return;

  evento.respondWith(
    caches.match(evento.request).then((resposta) => resposta || fetch(evento.request))
  );
});
