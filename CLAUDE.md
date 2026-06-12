# CLAUDE.md — Finanças Pessoais (Gui & Li)

Este é o documento de referência permanente do projeto. Leia antes de qualquer ação.
Atualizar este arquivo sempre que uma decisão de arquitetura, regra de negócio ou convenção mudar — na mesma sessão em que a mudança ocorrer.

---

## Visão geral

App web PWA (instalável no celular) para controle financeiro pessoal do casal Gui e Li.
Dois usuários ativos. Ambos podem lançar e consultar de seus próprios dispositivos.

**Repositório:** https://github.com/guilhermeandrade-sys/financaspessoais
**Hospedagem:** GitHub Pages
**Backend:** Supabase (projeto compartilhado com AB Carreiras — prefixo `fp_` em todas as tabelas)

---

## Stack

- **Frontend:** HTML + CSS + JS vanilla, sem frameworks
- **Backend:** Supabase (PostgreSQL + Auth + REST API)
- **Hospedagem:** GitHub Pages
- **PWA:** manifest.json + service worker — permite instalação como ícone na home screen do celular, sem App Store
- **Autenticação:** Supabase Auth — dois usuários fixos (Gui e Li)

---

## Supabase

- **URL:** `https://crwyhklydsgjnclqetio.supabase.co`
- **Anon/Publishable key:** `sb_publishable_S4-l7ZshtILHz4G7x3HGcA_iDTsHn6W`
- **Secret key:** nunca expor no frontend — usar apenas em scripts server-side ou GitHub Actions

**Prefixo obrigatório:** `fp_` em todas as tabelas deste projeto.
O banco é compartilhado com a AB Carreiras. O prefixo garante isolamento lógico total.

---

## Modelo mental do controle financeiro

- **Regime de caixa pela data do evento** — não pela data de pagamento da fatura
- Uma compra parcelada em 3x feita em 15/junho gera 3 lançamentos: jun/15, jul/15, ago/15
- Cartão de crédito é apenas o meio de pagamento — não interfere no timing dos lançamentos
- ~70% dos gastos via cartão de crédito, ~30% via PIX/conta
- Orçamento mensal definido por categoria no início do ano, replicável e editável

---

## Entidades e tabelas

### `fp_lancamentos`
Átomo do sistema. Um registro por evento financeiro.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | gerado automaticamente |
| data_evento | date | data do evento (não da fatura) |
| descricao | text | texto livre obrigatório |
| valor | numeric | positivo = receita, negativo = despesa |
| meio | text | 'cartao', 'pix', 'outro' |
| categoria | text | ver lista de categorias |
| subcategoria | text | ver lista de subcategorias |
| tipo | text | derivado da categoria automaticamente (ver mapeamento) |
| parcela_atual | int | ex: 1 (null se não parcelado) |
| parcela_total | int | ex: 3 (null se não parcelado) |
| grupo_parcelas | uuid | agrupa as N parcelas de uma mesma compra |
| grupo_recorrencia | uuid | agrupa lançamentos de uma mesma recorrência |
| status | text | 'realizado' ou 'projetado' |
| usuario_id | uuid | FK para auth.users |
| created_at | timestamptz | automático |

### `fp_orcamento`
Orçamento mensal por categoria.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| categoria | text | |
| valor_mensal | numeric | |
| valido_a_partir | date | primeiro dia do mês de vigência |
| created_at | timestamptz | |

**Regra:** ao alterar um orçamento, o app pergunta "replicar para os meses seguintes?". Se sim, insere/atualiza registros para todos os meses futuros do ano corrente.

### `fp_recorrencias`
Templates de lançamentos mensais recorrentes.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| descricao | text | ex: "Netflix", "Claro", "Condomínio" |
| valor_esperado | numeric | valor padrão (editável na confirmação mensal) |
| meio | text | |
| categoria | text | |
| subcategoria | text | |
| dia_do_mes | int | dia esperado do lançamento |
| ativa | boolean | |
| created_at | timestamptz | |

**Comportamento:** no primeiro acesso do mês, exibe fila de confirmação das recorrências ativas. Usuário pode confirmar (com edição de valor), rejeitar (descarta o mês) ou adiar. Recorrências confirmadas não reaparecem no mesmo mês.

### `fp_recorrencias_confirmadas`
Controla quais recorrências já foram processadas em cada mês.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| recorrencia_id | uuid FK | |
| mes_ano | text | ex: '2026-06' |
| status | text | 'confirmado', 'rejeitado', 'adiado' |
| created_at | timestamptz | |

### `fp_patrimonio`
Ativos e passivos do casal.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| tipo | text | 'ativo' ou 'passivo' |
| subtipo | text | 'investimento', 'imovel', 'financiamento', 'divida', etc |
| descricao | text | |
| instituicao | text | |
| valor | numeric | valor atual do ativo ou saldo devedor |
| prazo_projeto | text | 'curto', 'medio', 'longo', 'aposentadoria' |
| updated_at | timestamptz | |

### `fp_projetos`
Reservas financeiras com metas por prazo.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| descricao | text | |
| valor_alvo | numeric | |
| valor_aplicado | numeric | |
| ano_alvo | int | |
| prazo | text | 'curto', 'medio', 'longo', 'aposentadoria' |
| created_at | timestamptz | |

---

## Categorias, subcategorias e tipos

O **tipo é derivado da categoria** — nunca solicitado ao usuário no momento do lançamento.

| Categoria | Tipo derivado |
|---|---|
| Moradia | Fixo |
| Comunicação | Fixo |
| Transporte | Fixo |
| Dependentes | Fixo |
| Serviços Financeiros | Fixo |
| Saúde | Variável Essencial |
| Alimentação | Variável Essencial |
| Pessoais | Variável NE |
| Lazer | Variável NE |
| Diversas | Variável |
| Educação | Provisão |
| Provisão | Provisão |
| Renda Principal | Receita |
| Renda Extra | Receita |

Subcategorias por categoria (lista expansível — nunca reduzir sem confirmar com o usuário):

- **Moradia:** Condomínio, Financiamento, Energia Elétrica, Água, Cozinheira, Serviços de limpeza, Jardineiro, Decoração e outros, IPTU
- **Alimentação:** Supermercado, Feira, Padaria, Refeições em restaurante, Lanches & Snacks
- **Transporte:** Combustível, Seguro, Manutenção, Estacionamento, Pedágio, IPVA, Licenciamento, Outros
- **Comunicação:** Telefone Celular, Internet, Apps (Netflix, Spotify, etc)
- **Saúde:** Dentista, Academia/Esportes, Nutricionista, Plano de Saúde, Outros
- **Pessoais:** Farmácia, Manicure, Compras, Salão/Barbeiro, Suplementos, Outros
- **Lazer:** Cinema/Teatro/Shows, Bares e Restaurantes, Viagens, Acampamento, Eventos, Outros
- **Dependentes:** Educação (colégio), Rematrícula e Uniforme, Jiu Jitsu, Outros
- **Diversas:** Animais de estimação, Imprevistos, Outros
- **Renda Principal:** Guilherme HNK, Guilherme VR, Divisão Lucros AB Carreiras, PLR, 13º, Férias
- **Renda Extra:** Outras fontes de renda, Ajuda de custo, Venda de bens

---

## Lógica de parcelamento

Usuário informa: valor total, número de parcelas, data do primeiro evento.

O app gera N lançamentos automaticamente:
- Valor parcela = valor total / N (arredondado 2 casas; última parcela absorve diferença de centavos)
- Data de cada parcela = data informada + (n−1) meses
- Todos com `status = 'realizado'`
- Todos compartilham o mesmo `grupo_parcelas` UUID
- Descrição inclui sufixo automático " X/N" (ex: "Seguro carro 1/10")

---

## Lógica de recorrências

1. No primeiro acesso de cada mês, verificar se há recorrências ativas sem entrada em `fp_recorrencias_confirmadas` para o mês corrente
2. Se houver, exibir fila de confirmação (modal ou bottom sheet)
3. Cada card mostra: descrição, valor esperado (campo editável), categoria
4. Ações disponíveis: **Confirmar** (cria lançamento realizado), **Rejeitar** (registra como rejeitado, não cria lançamento), **Adiar** (registra como `adiado`, fecha por agora e volta na próxima abertura do app)
5. Registrar resultado em `fp_recorrencias_confirmadas`
6. **Importante:** apenas `confirmado` e `rejeitado` removem a recorrência da fila. Status `adiado` não exclui — ela reaparece no próximo acesso dentro do mesmo mês

---

## Visões do app

### Home (tela inicial)
- Mês corrente com navegação para meses anteriores e futuros
- Saldo do mês = Receita realizada − Despesa realizada
- Cards por categoria: valor realizado vs. orçado + barra de progresso + alerta visual se estourou
- Valor disponível por dia (secundário): `(orçamento Variável NE + Variável − gasto Variável NE + Variável realizado) ÷ dias restantes` — **só exibido no mês atual e quando o valor é > 0**; exclui fixos e essenciais
- FAB sempre visível para novo lançamento

### Projeção de meses futuros
- Lista dos **próximos 6 meses**, cruzando o ano quando necessário
- Por mês: comprometido (parcelas futuras já lançadas + recorrências ativas) vs. livre (orçamento − comprometido)
- Responde: "quanto ainda posso gastar em julho?"

### Análise por período
- Filtros: mensal / trimestral / semestral / período customizado
- Gasto total por categoria com comparação ao orçado
- Filtro por tipo (Fixo / Variável Essencial / Variável NE / Provisão)
- Lista de lançamentos do período com busca por descrição

### Patrimônio
- Lista separada de ativos e passivos
- Patrimônio líquido = total ativos − total passivos

### Projetos/Reservas
- Lista de projetos com barra de progresso (aplicado vs. alvo)
- Agrupado por prazo (curto / médio / longo / aposentadoria)

---

## UX e comportamento mobile

- **Mobile-first:** layout base para 390px, adaptável para desktop
- **Tab bar inferior:** Home | Lançamentos | Análise | Patrimônio | Projeção | Orçamento
- **FAB (botão flutuante):** presente em todas as telas, abre formulário de lançamento
- **Formulário de lançamento:** bottom sheet deslizável no mobile
- **Botão ?:** fixo no canto superior direito (à esquerda do botão de tema); abre overlay de ajuda com 9 seções accordion (manual de uso completo)
- **Overlay de ajuda:** full-screen no mobile (bottom sheet animado), modal centralizado no desktop; fecha com ESC ou botão ✕
- **PWA:** `manifest.json` + service worker (cache `financas-v11`) + ícones em `icons/icon-192.png` e `icons/icon-512.png` — permite instalação na home screen sem App Store
- Dois usuários autenticados — cada lançamento registra `usuario_id`

---

## Estrutura de arquivos

```
/
├── index.html              # shell da aplicação (SPA)
├── manifest.json           # PWA manifest
├── sw.js                   # service worker (cache financas-v11)
├── icons/
│   ├── icon-192.png        # ícone PWA 192×192
│   └── icon-512.png        # ícone PWA 512×512
├── css/
│   └── style.css           # estilos globais com variáveis CSS
├── js/
│   ├── config.js           # URL e chave Supabase, constantes globais
│   ├── auth.js             # autenticação e gestão de sessão
│   ├── router.js           # navegação entre views (SPA)
│   ├── db.js               # camada de acesso ao Supabase (todas as queries aqui)
│   ├── lancamentos.js      # lógica de lançamentos, parcelamento
│   ├── recorrencias.js     # lógica de recorrências e fila de confirmação
│   ├── orcamento.js        # lógica de orçamento e projeção
│   ├── patrimonio.js       # lógica de patrimônio e projetos
│   └── ui.js               # componentes e utilitários de interface
└── views/
    ├── home.js             # view Home
    ├── lancamentos.js      # view lista de lançamentos
    ├── analise.js          # view análise por período
    ├── patrimonio.js       # view patrimônio e projetos
    ├── projecao.js         # view projeção dos próximos 6 meses
    ├── orcamento-config.js # view configuração de orçamento, recorrências e categorias
    └── ajuda.js            # overlay de ajuda (manual de uso, 9 seções accordion)
```

---

## Convenções de código

### Geral
- Linguagem de comentários, variáveis, funções e mensagens: **português**
- Nomes de arquivos e funções: camelCase para funções, kebab-case para arquivos
- Sem frameworks JS — vanilla apenas
- Sem dependências externas sempre que possível — se necessário, carregar via CDN com versão fixada

### Camada de dados (`db.js`)
- **Toda** comunicação com o Supabase passa por `db.js` — nenhuma view ou módulo faz fetch direto
- Funções retornam `{ data, error }` — tratamento de erro sempre no chamador
- Queries nomeadas de forma descritiva: `buscarLancamentosPorMes()`, `inserirLancamento()`, etc.
- Nunca expor a secret key no frontend

### Estado da aplicação
- Estado global mínimo — cada view busca o que precisa via `db.js`
- Estado de UI (loading, erro, mês selecionado) gerenciado localmente na view
- Sem localStorage para dados financeiros — tudo no Supabase

### CSS
- Variáveis CSS em `:root` para todas as cores, espaçamentos e tipografia
- Mobile-first: estilos base para mobile, `@media (min-width: 768px)` para desktop
- Nomenclatura BEM para classes: `.card__titulo`, `.card--destaque`

### Tratamento de erros
- Erros de rede/Supabase sempre logados no console com contexto
- Usuário sempre recebe feedback visual em caso de erro (toast ou mensagem inline)
- Nunca deixar operação falhar silenciosamente

### Segurança
- RLS (Row Level Security) habilitado em todas as tabelas `fp_*` no Supabase
- Políticas RLS: usuário só lê e escreve seus próprios registros (exceto onde for dado acesso compartilhado explícito)
- Anon key no frontend é aceitável — o RLS é a barreira real

### Git
- Commits em português, descritivos: "adiciona formulário de lançamento parcelado"
- Um commit por funcionalidade completa — não commitar trabalho pela metade
- Branch `main` sempre funcional e deployável

---

## Protocolo de atualização deste arquivo

- Atualizar este CLAUDE.md **na mesma sessão** em que qualquer decisão de arquitetura, regra de negócio ou convenção mudar
- Nunca deixar o arquivo desatualizado em relação ao código existente
- Se houver conflito entre o CLAUDE.md e o código, o CLAUDE.md é a fonte de verdade — ajustar o código
