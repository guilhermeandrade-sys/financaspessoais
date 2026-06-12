// View: Ajuda — manual de uso do app

const _SECOES_AJUDA = [
  {
    id: 'inicio',
    icone: '🚀',
    titulo: 'Início rápido',
    conteudo: `
      <p>Para lançar uma despesa ou receita, toque no botão <strong>+</strong> que fica fixo na tela. Ele está sempre visível, em qualquer aba.</p>
      <ol class="ajuda-lista">
        <li>Toque em <strong>+</strong></li>
        <li>Digite a descrição — o app sugere categoria automaticamente</li>
        <li>Informe o valor (sempre positivo — o app decide se é entrada ou saída pela categoria)</li>
        <li>Escolha a data do evento (não a data de pagamento da fatura)</li>
        <li>Selecione categoria e subcategoria</li>
        <li>Toque em <strong>Lançar</strong></li>
      </ol>
      <div class="ajuda-dica">💡 Para compras parceladas, basta informar o número de parcelas no campo correspondente — o app cria automaticamente uma entrada por mês.</div>
    `,
  },
  {
    id: 'conceitos',
    icone: '💡',
    titulo: 'Conceitos importantes',
    conteudo: `
      <h4 class="ajuda-subtitulo">Data do evento, não da fatura</h4>
      <p>A data registrada é <strong>quando a compra aconteceu</strong>, não quando cai na fatura. Uma compra de 10/junho feita no cartão entra em junho, mesmo que a fatura vença em julho.</p>

      <h4 class="ajuda-subtitulo">Receita vs. Despesa</h4>
      <p>Você não precisa informar manualmente — o app detecta pelo tipo da categoria. Categorias de <em>Renda</em> são receitas; todas as demais são despesas.</p>

      <h4 class="ajuda-subtitulo">Disponível por dia</h4>
      <p>Exibido na Home apenas no mês atual. Calcula quanto ainda dá pra gastar por dia até o fim do mês, considerando só as categorias <strong>Variável NE</strong> e <strong>Variável</strong> (Lazer, Pessoais, Diversas). Fixos e essenciais não entram nesse número.</p>

      <h4 class="ajuda-subtitulo">Tipos de gasto</h4>
      <ul class="ajuda-lista">
        <li><strong>Fixo</strong> — Moradia, Transporte, Comunicação, Dependentes</li>
        <li><strong>Variável Essencial</strong> — Saúde, Alimentação</li>
        <li><strong>Variável NE</strong> — Lazer, Pessoais</li>
        <li><strong>Variável</strong> — Diversas</li>
        <li><strong>Provisão</strong> — Educação, Provisão</li>
      </ul>
    `,
  },
  {
    id: 'home',
    icone: '🏠',
    titulo: 'Home',
    conteudo: `
      <p>A tela principal mostra o resumo do mês. Use as setas <strong>‹ ›</strong> para navegar entre meses anteriores e futuros.</p>
      <ul class="ajuda-lista">
        <li><strong>Saldo</strong> = receitas realizadas − despesas realizadas</li>
        <li><strong>% Poupança</strong> = quanto da renda foi guardado</li>
        <li><strong>Orçamento usado</strong> = total gasto ÷ total orçado</li>
        <li><strong>Cards por categoria</strong> — toque na categoria para ver os lançamentos filtrados; toque na seta › para expandir subcategorias</li>
        <li><strong>Barra colorida</strong> — verde = dentro do limite, amarelo = acima de 85%, vermelho = estourou</li>
        <li><strong>Projeção ↗</strong> — aparece quando o ritmo de gasto do mês indica que vai estourar o orçamento</li>
      </ul>
    `,
  },
  {
    id: 'lancamentos',
    icone: '📋',
    titulo: 'Lançamentos',
    conteudo: `
      <p>Lista completa de entradas e saídas do mês. Use os filtros para encontrar o que procura.</p>
      <ul class="ajuda-lista">
        <li><strong>Busca</strong> — filtra por qualquer palavra da descrição</li>
        <li><strong>Filtro de categoria</strong> — restringe a uma categoria específica</li>
        <li>Toque em qualquer lançamento para <strong>editar</strong> descrição, valor, data, categoria ou status</li>
        <li>Na edição, você pode excluir <strong>apenas aquela parcela</strong> ou <strong>todas as N parcelas</strong> de uma compra parcelada</li>
        <li>Lançamentos futuros podem ter status <strong>Projetado</strong> — não entram no saldo realizado, mas aparecem na Projeção</li>
      </ul>
      <div class="ajuda-dica">💡 O app avisa se você tentar lançar algo parecido com um lançamento recente (proteção contra duplicatas).</div>
    `,
  },
  {
    id: 'recorrencias',
    icone: '🔄',
    titulo: 'Recorrências',
    conteudo: `
      <p>Gastos que se repetem todo mês (Netflix, condomínio, mensalidade, etc.) podem ser cadastrados como recorrências.</p>
      <ul class="ajuda-lista">
        <li>Na primeira abertura do mês, o app exibe uma fila de confirmação</li>
        <li><strong>Confirmar</strong> — cria o lançamento realizado com o valor (editável na hora)</li>
        <li><strong>Rejeitar</strong> — descarta aquele mês (não cria lançamento)</li>
        <li><strong>Adiar</strong> — fecha por agora e volta a perguntar na próxima vez que abrir o app</li>
      </ul>
      <p>Gerencie as recorrências em <strong>Orçamento → Recorrências</strong>: você pode criar, editar o valor padrão, pausar ou excluir.</p>
    `,
  },
  {
    id: 'orcamento',
    icone: '🎯',
    titulo: 'Orçamento',
    conteudo: `
      <p>Define quanto você planeja gastar por categoria em cada mês. Acesse via aba <strong>Orçamento</strong>.</p>
      <ul class="ajuda-lista">
        <li>Na aba <strong>Valores</strong>: defina o teto de cada subcategoria — basta digitar e sair do campo</li>
        <li>Use as setas de mês para definir orçamentos diferentes em meses específicos</li>
        <li>Na aba <strong>Recorrências</strong>: gerencie seus gastos mensais fixos</li>
        <li>Na aba <strong>Categorias</strong>: crie, edite ou exclua categorias e subcategorias</li>
      </ul>
      <div class="ajuda-dica">⚠️ Renomear uma categoria não atualiza automaticamente os lançamentos já cadastrados com o nome antigo.</div>
    `,
  },
  {
    id: 'analise',
    icone: '📊',
    titulo: 'Análise',
    conteudo: `
      <p>Três visões para entender seus gastos além do mês corrente.</p>
      <ul class="ajuda-lista">
        <li><strong>Por período</strong> — escolha qualquer intervalo de datas e veja o total por categoria. Toque numa categoria para ver os lançamentos daquele período</li>
        <li><strong>Evolução</strong> — gráfico de barras dos últimos 6 meses com detalhamento por categoria</li>
        <li><strong>Busca</strong> — encontre qualquer lançamento pelo nome, em qualquer data</li>
      </ul>
    `,
  },
  {
    id: 'projecao',
    icone: '📅',
    titulo: 'Projeção',
    conteudo: `
      <p>Responde à pergunta: <em>"quanto ainda posso gastar nos próximos meses?"</em></p>
      <ul class="ajuda-lista">
        <li>Mostra os próximos 6 meses, cruzando o ano quando necessário</li>
        <li><strong>Comprometido</strong> = parcelas futuras já lançadas + recorrências ativas</li>
        <li><strong>Livre</strong> = orçamento mensal − comprometido</li>
        <li>Toque no card de um mês para ver o detalhamento das parcelas e recorrências</li>
      </ul>
      <div class="ajuda-dica">💡 Um item parcelado em 10x aparece nos próximos meses como comprometido, mesmo antes de as parcelas vencerem.</div>
    `,
  },
  {
    id: 'patrimonio',
    icone: '💼',
    titulo: 'Patrimônio & Projetos',
    conteudo: `
      <p>Fotografia do seu patrimônio líquido e das suas metas financeiras.</p>
      <h4 class="ajuda-subtitulo">Patrimônio</h4>
      <ul class="ajuda-lista">
        <li><strong>Ativos</strong> — investimentos, imóveis, veículos</li>
        <li><strong>Passivos</strong> — financiamentos, dívidas</li>
        <li><strong>Patrimônio líquido</strong> = total de ativos − total de passivos</li>
      </ul>
      <h4 class="ajuda-subtitulo">Projetos / Reservas</h4>
      <ul class="ajuda-lista">
        <li>Metas financeiras com valor alvo e valor já aplicado</li>
        <li>Agrupados por prazo: curto, médio, longo, aposentadoria</li>
        <li>Atualize o valor aplicado conforme faz aportes</li>
      </ul>
      <div class="ajuda-dica">💡 Os valores de patrimônio não se atualizam automaticamente — atualize manualmente quando mudar.</div>
    `,
  },
];

function abrirAjuda() {
  const overlay = document.createElement('div');
  overlay.id = 'ajuda-overlay';
  overlay.className = 'ajuda-overlay';
  overlay.innerHTML = `
    <div class="ajuda-painel">
      <div class="ajuda-header">
        <div>
          <h2 class="ajuda-titulo">Manual de uso</h2>
          <p class="ajuda-subtitulo-header">Finanças Pessoais — Gui & Li</p>
        </div>
        <button class="ajuda-fechar" onclick="fecharAjuda()" aria-label="Fechar ajuda">✕</button>
      </div>
      <div class="ajuda-corpo">
        ${_SECOES_AJUDA.map((s) => `
          <div class="ajuda-secao" id="ajuda-sec-${s.id}">
            <button class="ajuda-secao__header" onclick="_toggleSecaoAjuda('${s.id}')" aria-expanded="false">
              <span class="ajuda-secao__icone">${s.icone}</span>
              <span class="ajuda-secao__titulo">${s.titulo}</span>
              <span class="ajuda-secao__seta">›</span>
            </button>
            <div class="ajuda-secao__corpo oculto">
              ${s.conteudo}
            </div>
          </div>
        `).join('')}
        <div class="ajuda-rodape">
          <p>Dúvidas ou sugestões? Fale com o Gui 😄</p>
          <p class="texto-secundario" style="font-size:var(--tam-xs);margin-top:var(--esp-xs)">v${_versaoApp()}</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Abre a primeira seção automaticamente
  setTimeout(() => _toggleSecaoAjuda('inicio'), 80);

  // Fechar com ESC
  overlay._onKeyDown = (e) => { if (e.key === 'Escape') fecharAjuda(); };
  document.addEventListener('keydown', overlay._onKeyDown);
}

function fecharAjuda() {
  const overlay = document.getElementById('ajuda-overlay');
  if (!overlay) return;
  document.removeEventListener('keydown', overlay._onKeyDown);
  overlay.classList.add('ajuda-overlay--saindo');
  setTimeout(() => overlay.remove(), 220);
}

function _toggleSecaoAjuda(id) {
  const secao = document.getElementById(`ajuda-sec-${id}`);
  if (!secao) return;
  const corpo = secao.querySelector('.ajuda-secao__corpo');
  const seta  = secao.querySelector('.ajuda-secao__seta');
  const btn   = secao.querySelector('.ajuda-secao__header');
  const aberta = !corpo.classList.contains('oculto');

  // Fecha todas
  document.querySelectorAll('.ajuda-secao__corpo').forEach((c) => c.classList.add('oculto'));
  document.querySelectorAll('.ajuda-secao__seta').forEach((s) => s.textContent = '›');
  document.querySelectorAll('.ajuda-secao__header').forEach((b) => b.setAttribute('aria-expanded', 'false'));

  // Abre a clicada (toggle)
  if (!aberta) {
    corpo.classList.remove('oculto');
    seta.textContent = '⌄';
    btn.setAttribute('aria-expanded', 'true');
    // Scroll suave até a seção
    setTimeout(() => secao.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }
}

function _versaoApp() {
  // Extrai versão do cache name do service worker
  return 'sw v11';
}
