const CONFIG = {
  supabaseUrl: 'https://crwyhklydsgjnclqetio.supabase.co',
  supabaseKey: 'sb_publishable_S4-l7ZshtILHz4G7x3HGcA_iDTsHn6W',
};

const CATEGORIAS = [
  'Moradia', 'Alimentação', 'Transporte', 'Comunicação', 'Saúde',
  'Pessoais', 'Lazer', 'Dependentes', 'Diversas', 'Educação',
  'Provisão', 'Serviços Financeiros', 'Renda Principal', 'Renda Extra',
];

const SUBCATEGORIAS = {
  'Moradia':             ['Condomínio', 'Financiamento', 'Energia Elétrica', 'Água', 'Cozinheira', 'Serviços de limpeza', 'Jardineiro', 'Decoração e outros', 'IPTU'],
  'Alimentação':         ['Supermercado', 'Feira', 'Padaria', 'Refeições em restaurante', 'Lanches & Snacks'],
  'Transporte':          ['Combustível', 'Seguro', 'Manutenção', 'Estacionamento', 'Pedágio', 'IPVA', 'Licenciamento', 'Lavagem / Higienização', 'Outros'],
  'Comunicação':         ['Telefone Celular', 'Internet', 'Apps (Netflix, Spotify, etc)'],
  'Saúde':               ['Dentista', 'Academia/Esportes', 'Nutricionista', 'Plano de Saúde', 'Outros'],
  'Pessoais':            ['Farmácia', 'Manicure', 'Compras', 'Salão/Barbeiro', 'Suplementos', 'Outros'],
  'Lazer':               ['Cinema/Teatro/Shows', 'Bares e Restaurantes', 'Viagens', 'Acampamento', 'Eventos', 'Outros'],
  'Dependentes':         ['Educação (colégio)', 'Rematrícula e Uniforme', 'Jiu Jitsu', 'Academia/Esportes', 'Outros'],
  'Diversas':            ['Animais de estimação', 'Imprevistos', 'Outros'],
  'Educação':            ['Cursos', 'Livros', 'Outros'],
  'Provisão':            ['Reserva de emergência', 'Outros'],
  'Serviços Financeiros':['Tarifas bancárias', 'Seguros', 'Outros'],
  'Renda Principal':     ['Guilherme HNK', 'Guilherme VR', 'Divisão Lucros AB Carreiras', 'PLR', '13º', 'Férias'],
  'Renda Extra':         ['Outras fontes de renda', 'Ajuda de custo', 'Venda de bens'],
};

const TIPO_POR_CATEGORIA = {
  'Moradia':              'Fixo',
  'Comunicação':          'Fixo',
  'Transporte':           'Fixo',
  'Dependentes':          'Fixo',
  'Serviços Financeiros': 'Fixo',
  'Saúde':                'Variável Essencial',
  'Alimentação':          'Variável Essencial',
  'Pessoais':             'Variável NE',
  'Lazer':                'Variável NE',
  'Diversas':             'Variável',
  'Educação':             'Provisão',
  'Provisão':             'Provisão',
  'Renda Principal':      'Receita',
  'Renda Extra':          'Receita',
};

const MEIOS = ['cartao', 'pix', 'outro'];

const VERSAO_APP = 'sw v11';

// Registra service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/financaspessoais/sw.js').catch(() => {});
  });
}
