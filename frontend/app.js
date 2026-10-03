const STORAGE_KEY = 'vivacondo.occurrences.v1';

const initialOccurrences = [
  { id: 'occ-1', title: 'Vazamento próximo ao elevador', category: 'Manutenção', location: 'Bloco A · 3º andar', description: 'Umidade apareceu no teto perto do elevador social.', status: 'Em andamento', createdAt: '2026-10-02T09:18:00', reporter: 'Mariana Costa', priority: 'high' },
  { id: 'occ-2', title: 'Luz queimada na garagem', category: 'Manutenção', location: 'Garagem · vaga 42', description: '', status: 'Pendente', createdAt: '2026-10-02T08:42:00', reporter: 'Paulo Henrique', priority: 'normal' },
  { id: 'occ-3', title: 'Limpeza da área da piscina', category: 'Limpeza', location: 'Área de lazer', description: '', status: 'Concluída', createdAt: '2026-10-01T17:05:00', reporter: 'Ana Martins', priority: 'low' },
  { id: 'occ-4', title: 'Portão da garagem não fecha', category: 'Segurança', location: 'Entrada da garagem', description: '', status: 'Pendente', createdAt: '2026-10-01T14:31:00', reporter: 'Carlos Almeida', priority: 'high' },
];

const accessEntries = [
  { initials: 'RC', name: 'Roberto Carvalho', detail: 'Morador · Bloco A, 204', time: '10:42', visitor: false },
  { initials: 'LM', name: 'Lucas Moreira', detail: 'Visitante · Bloco C, 102', time: '10:36', visitor: true },
  { initials: 'FS', name: 'Fernanda Souza', detail: 'Moradora · Bloco B, 305', time: '10:21', visitor: false },
];

const pageContent = document.querySelector('#page-content');
const dialog = document.querySelector('#occurrence-dialog');
const form = document.querySelector('#occurrence-form');
const toast = document.querySelector('#toast');
const notificationToggle = document.querySelector('#notification-toggle');
const notificationPanel = document.querySelector('#notification-panel');
let occurrences = loadOccurrences();
let toastTimer;

function loadOccurrences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : initialOccurrences;
  } catch {
    return initialOccurrences;
  }
}

function saveOccurrences() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(occurrences));
  } catch {
    showToast('Não foi possível salvar neste navegador.');
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value)).replace('.', '');
}

function formatToday() {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date()).replace('.', '');
}

function statusClass(status) {
  if (status === 'Concluída') return 'done';
  if (status === 'Em andamento') return 'progress';
  return 'pending';
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function isCriticalOccurrence(title, description, category) {
  const text = `${title} ${description}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const criticalTerms = ['vazamento', 'incendio', 'fogo', 'cheiro de gas', 'curto circuito', 'fio exposto', 'rachadura', 'trinca'];
  return category === 'Segurança' || criticalTerms.some((term) => text.includes(term));
}

function renderNotifications() {
  const alerts = occurrences.filter((item) => item.priority === 'high' && item.status !== 'Concluída');
  const badge = document.querySelector('#notification-badge');
  document.querySelector('#notification-count').textContent = alerts.length;
  badge.hidden = alerts.length === 0;
  document.querySelector('#notification-list').innerHTML = alerts.length
    ? alerts.map((item) => `<article class="notification-item"><strong>Requer atenção da síndica</strong><span>${escapeHTML(item.title)}</span><small>${escapeHTML(item.location)} · ${escapeHTML(item.status)}</small></article>`).join('')
    : '<p class="notification-empty">Nenhum chamado prioritário em aberto.</p>';
}

function updateNavigation(view) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.view === view;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function renderOccurrenceRows(items) {
  if (items.length === 0) return '<div class="empty-state">Nenhuma ocorrência encontrada.</div>';
  return items.map((item) => `
    <article class="occurrence-row">
      <span class="priority-dot ${escapeHTML(item.priority)}" aria-hidden="true"></span>
      <div class="occurrence-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.location)} · ${formatDate(item.createdAt)}</small></div>
      ${statusBadge(item.status)}
    </article>`).join('');
}

function renderAccessEntries() {
  return accessEntries.map((entry) => `
    <div class="access-item">
      <span class="access-avatar ${entry.visitor ? 'visitor' : ''}" aria-hidden="true">${entry.initials}</span>
      <span class="access-info"><strong>${entry.name}</strong><small>${entry.detail}</small></span>
      <time class="access-time">${entry.time}</time>
    </div>`).join('');
}

function renderDashboard() {
  const openCount = occurrences.filter((item) => item.status !== 'Concluída').length;
  const pendingCount = occurrences.filter((item) => item.status === 'Pendente').length;
  const recent = [...occurrences].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  pageContent.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">SÁBADO, 03 DE OUTUBRO DE 2026</p><h1>Bom dia, Ana <span aria-hidden="true">☀</span></h1><p class="page-subtitle">Aqui está o resumo do que acontece no seu condomínio.</p></div>
      <button class="button button-primary" type="button" data-action="new-occurrence"><span aria-hidden="true">＋</span> Nova ocorrência</button>
    </div>
    <div class="metrics-grid">
      <article class="metric-card"><div class="metric-top"><span>Ocorrências abertas</span><span class="metric-icon coral" aria-hidden="true">▤</span></div><div class="metric-value">${openCount}<span class="metric-note">${pendingCount} pendentes</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Unidades ocupadas</span><span class="metric-icon" aria-hidden="true">⌂</span></div><div class="metric-value">118<span class="metric-note">de 124 unidades</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Acessos hoje</span><span class="metric-icon amber" aria-hidden="true">⇥</span></div><div class="metric-value">36<span class="metric-note">+8 desde ontem</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Taxa de adimplência</span><span class="metric-icon" aria-hidden="true">◷</span></div><div class="metric-value">94<span class="metric-note">% neste mês</span></div></article>
    </div>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header"><div class="panel-heading"><h2>Ocorrências recentes</h2><p>Acompanhe os chamados do condomínio</p></div><a class="text-link" href="#ocorrencias" data-view="ocorrencias">Ver todas <span aria-hidden="true">→</span></a></div>
        <div class="occurrence-list">${renderOccurrenceRows(recent)}</div>
      </section>
      <section class="panel access-panel">
        <div class="panel-header"><div class="panel-heading"><h2>Últimos acessos</h2><p>Movimentações de hoje</p></div><a class="text-link" href="#acessos" data-view="acessos" aria-label="Ver todos os acessos">↗</a></div>
        <div class="access-list">${renderAccessEntries()}</div>
      </section>
    </div>
    <section class="occupancy-panel"><span class="occupancy-mark" aria-hidden="true">⌂</span><span class="occupancy-copy"><span><strong>Ocupação do condomínio</strong><small>6 unidades disponíveis para locação</small></span><span class="occupancy-value">95<small>%</small></span></span></section>`;
  updateNavigation('inicio');
  document.querySelector('#breadcrumb-current').textContent = 'Visão geral';
  document.querySelector('#nav-open-count').textContent = openCount;
}

function renderOccurrences() {
  pageContent.innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">ROTINA DO CONDOMÍNIO</p><h1>Ocorrências</h1><p class="page-subtitle">Registre e acompanhe solicitações dos moradores.</p></div><button class="button button-primary" type="button" data-action="new-occurrence"><span aria-hidden="true">＋</span> Nova ocorrência</button></div>
    <section class="metrics-grid">
      <article class="metric-card"><div class="metric-top"><span>Total de chamados</span><span class="metric-icon" aria-hidden="true">▤</span></div><div class="metric-value">${occurrences.length}<span class="metric-note">registrados</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Pendentes</span><span class="metric-icon amber" aria-hidden="true">◷</span></div><div class="metric-value">${occurrences.filter((item) => item.status === 'Pendente').length}<span class="metric-note">aguardando atendimento</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Em andamento</span><span class="metric-icon coral" aria-hidden="true">↻</span></div><div class="metric-value">${occurrences.filter((item) => item.status === 'Em andamento').length}<span class="metric-note">em atendimento</span></div></article>
      <article class="metric-card"><div class="metric-top"><span>Concluídas</span><span class="metric-icon" aria-hidden="true">✓</span></div><div class="metric-value">${occurrences.filter((item) => item.status === 'Concluída').length}<span class="metric-note">resolvidas</span></div></article>
    </section>
    <section class="panel list-panel">
      <div class="panel-header list-heading"><div class="panel-heading"><h2>Todos os chamados</h2><p>Atualize o andamento diretamente na lista</p></div><div class="section-toolbar"><input class="search-box" id="occurrence-search" type="search" placeholder="Buscar ocorrência" aria-label="Buscar ocorrência"><select class="filter-select" id="occurrence-filter" aria-label="Filtrar por status"><option value="Todas">Todas</option><option value="Pendente">Pendentes</option><option value="Em andamento">Em andamento</option><option value="Concluída">Concluídas</option></select></div></div>
      <div class="table-header"><span>OCORRÊNCIA</span><span>CATEGORIA</span><span>ABERTA EM</span><span>STATUS</span><span></span></div>
      <div id="occurrence-table-body"></div>
    </section>`;
  updateNavigation('ocorrencias');
  document.querySelector('#breadcrumb-current').textContent = 'Ocorrências';
  document.querySelector('#nav-open-count').textContent = occurrences.filter((item) => item.status !== 'Concluída').length;
  renderOccurrenceTable();
}

function renderOccurrenceTable() {
  const body = document.querySelector('#occurrence-table-body');
  if (!body) return;
  const query = document.querySelector('#occurrence-search').value.trim().toLocaleLowerCase('pt-BR');
  const filter = document.querySelector('#occurrence-filter').value;
  const filtered = [...occurrences]
    .filter((item) => filter === 'Todas' || item.status === filter)
    .filter((item) => `${item.title} ${item.location} ${item.category}`.toLocaleLowerCase('pt-BR').includes(query))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  body.innerHTML = filtered.length ? filtered.map((item) => `
    <div class="table-row" data-id="${escapeHTML(item.id)}">
      <span class="table-title"><span class="priority-dot ${escapeHTML(item.priority)}" aria-hidden="true"></span><span>${escapeHTML(item.title)}</span></span>
      <span class="table-muted">${escapeHTML(item.category)}</span>
      <span class="table-muted">${formatDate(item.createdAt)} · ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}</span>
      <select class="status-select" aria-label="Status de ${escapeHTML(item.title)}" data-action="change-status"><option ${item.status === 'Pendente' ? 'selected' : ''}>Pendente</option><option ${item.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option><option ${item.status === 'Concluída' ? 'selected' : ''}>Concluída</option></select>
      <span class="table-muted">${escapeHTML(item.location)}</span>
    </div>`).join('') : '<div class="empty-state">Nenhuma ocorrência encontrada.</div>';
}

function renderPlaceholder(view) {
  const pages = {
    acessos: { title: 'Controle de acessos', eyebrow: 'SEGURANÇA E PORTARIA', icon: '⇥', message: 'O painel de acessos está em preparação. Os últimos registros já aparecem na visão geral.' },
    financeiro: { title: 'Financeiro', eyebrow: 'GESTÃO FINANCEIRA', icon: '◷', message: 'O módulo financeiro será desenvolvido em uma próxima etapa do projeto.' },
    assistente: { title: 'Assistente do condomínio', eyebrow: 'INTELIGÊNCIA ARTIFICIAL', icon: '✳', message: 'O assistente virtual está planejado para responder dúvidas com base no regimento interno.' },
  };
  const page = pages[view] || pages.acessos;
  pageContent.innerHTML = `<div class="page-heading"><div><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p class="page-subtitle">Residencial Horizonte</p></div></div><section class="panel placeholder-panel"><div><span class="metric-icon">${page.icon}</span><h2>Em desenvolvimento</h2><p>${page.message}</p><a class="button button-quiet" href="#inicio" data-view="inicio">Voltar à visão geral</a></div></section>`;
  updateNavigation(view);
  document.querySelector('#breadcrumb-current').textContent = page.title;
}

function navigate(view) {
  if (view === 'inicio') renderDashboard();
  else if (view === 'ocorrencias') renderOccurrences();
  else renderPlaceholder(view);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    const view = viewLink.dataset.view;
    if (view === 'assistente') showToast('O assistente virtual será disponibilizado em uma próxima etapa.');
    navigate(view);
    window.history.replaceState(null, '', `#${view}`);
  }
  if (event.target.closest('[data-action="new-occurrence"]')) dialog.showModal();
  if (event.target.closest('.close-dialog')) dialog.close();
  if (event.target.closest('#notification-toggle')) {
    const expanded = notificationToggle.getAttribute('aria-expanded') === 'true';
    notificationToggle.setAttribute('aria-expanded', String(!expanded));
    notificationPanel.hidden = expanded;
  } else if (!event.target.closest('#notification-panel')) {
    notificationToggle.setAttribute('aria-expanded', 'false');
    notificationPanel.hidden = true;
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'occurrence-search') renderOccurrenceTable();
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'occurrence-filter') renderOccurrenceTable();
  if (event.target.matches('[data-action="change-status"]')) {
    const row = event.target.closest('[data-id]');
    const occurrence = occurrences.find((item) => item.id === row.dataset.id);
    if (occurrence) {
      occurrence.status = event.target.value;
      saveOccurrences();
      renderNotifications();
      renderOccurrences();
      showToast('Status da ocorrência atualizado.');
    }
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  occurrences.unshift({
    id: `occ-${crypto.randomUUID()}`,
    title: data.get('title').trim(),
    category: data.get('category'),
    location: data.get('location').trim(),
    description: data.get('description').trim(),
    status: 'Pendente',
    createdAt: new Date().toISOString(),
    reporter: 'Ana Martins',
    priority: isCriticalOccurrence(data.get('title'), data.get('description'), data.get('category')) ? 'high' : 'normal',
  });
  saveOccurrences();
  renderNotifications();
  form.reset();
  dialog.close();
  if (window.location.hash === '#ocorrencias') renderOccurrences();
  else renderDashboard();
  showToast('Ocorrência registrada com sucesso.');
});

document.querySelector('#today-label').textContent = formatToday();
renderNotifications();
const initialView = window.location.hash.slice(1);
navigate(['ocorrencias', 'acessos', 'financeiro', 'assistente'].includes(initialView) ? initialView : 'inicio');