const SESSION_KEY = 'vivacondo.sprint1.token';
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
let data = { condominium: null, users: [], units: [], commonAreas: [] };
let currentUser = null;
let currentView = 'inicio';
let toastTimer;
let accessToken = sessionStorage.getItem(SESSION_KEY);

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`/api${path}`, { ...options, headers });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 401
      ? 'E-mail, senha ou perfil inválido. Confira os dados e tente novamente.'
      : payload?.message || 'Não foi possível concluir a operação. Tente novamente.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadAccountData() {
  const [units, users, commonAreas] = currentUser.profile === 'SINDICO'
    ? await Promise.all([
      apiRequest('/units'),
      apiRequest('/residents'),
      apiRequest('/areas'),
    ])
    : [[], [], await apiRequest('/areas')];
  data = {
    condominium: {
      id: currentUser.condominiumId,
      name: currentUser.condominiumName,
      address: currentUser.address,
    },
    units,
    users: users.map((user) => ({ ...user, profile: 'MORADOR' })),
    commonAreas,
  };
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('pt-BR');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function showStartupError(error) {
  app.innerHTML = `
    <section class="auth-screen">
      <div class="auth-card">
        <span class="brand-mark" aria-hidden="true">v</span>
        <h1>Não foi possível conectar ao sistema</h1>
        <p class="page-subtitle">${escapeHTML(error.message)}</p>
        <p class="page-subtitle">Verifique se a API e o PostgreSQL estão em execução.</p>
      </div>
    </section>`;
}

function renderBootstrap() {
  app.innerHTML = `
    <section class="auth-screen">
      <form class="auth-card" id="bootstrap-form">
        <a class="brand auth-brand" href="#" aria-label="VivaCondo">
          <span class="brand-mark" aria-hidden="true">v</span><span>vivacondo</span>
        </a>
        <p class="eyebrow">CONFIGURAÇÃO INICIAL · SPRINT 1</p>
        <h1>Criar o acesso da síndica</h1>
        <p class="page-subtitle">Cadastre o condomínio e a primeira conta administrativa para começar.</p>
        <div class="prototype-notice">Esta configuração cria o primeiro acesso administrativo do condomínio.</div>
        <label for="bootstrap-condominium">Nome do condomínio</label>
        <input id="bootstrap-condominium" name="condominium" maxlength="150" required />
        <label for="bootstrap-address">Endereço</label>
        <input id="bootstrap-address" name="address" maxlength="255" required />
        <label for="bootstrap-name">Nome da síndica</label>
        <input id="bootstrap-name" name="name" maxlength="100" autocomplete="name" required />
        <label for="bootstrap-email">E-mail</label>
        <input id="bootstrap-email" name="email" type="email" maxlength="150" autocomplete="email" required />
        <label for="bootstrap-password">Senha <span class="optional-label">mínimo de 8 caracteres</span></label>
        <input id="bootstrap-password" name="password" type="password" minlength="8" autocomplete="new-password" required />
        <p class="form-error" id="bootstrap-error" role="alert"></p>
        <button class="button button-primary button-wide" type="submit">Criar acesso</button>
      </form>
    </section>`;
}

function renderLogin(errorMessage = '') {
  app.innerHTML = `
    <section class="auth-screen">
      <form class="auth-card" id="login-form">
        <a class="brand auth-brand" href="#" aria-label="VivaCondo">
          <span class="brand-mark" aria-hidden="true">v</span><span>vivacondo</span>
        </a>
        <p class="eyebrow">ACESSO AO CONDOMÍNIO</p>
        <h1>Bem-vindo ao VivaCondo</h1>
        <p class="page-subtitle">${escapeHTML(data.condominium?.name ?? 'Acesse seu condomínio')}</p>
        <label for="login-email">E-mail</label>
        <input id="login-email" name="email" type="email" autocomplete="username" required />
        <label for="login-password">Senha</label>
        <input id="login-password" name="password" type="password" autocomplete="current-password" required />
        <label for="login-profile">Perfil</label>
        <select id="login-profile" name="profile" required>
          <option value="SINDICO">Síndico(a)</option>
          <option value="MORADOR">Morador(a)</option>
        </select>
        <p class="form-error" id="login-error" role="alert">${escapeHTML(errorMessage)}</p>
        <button class="button button-primary button-wide" type="submit">Entrar</button>
      </form>
    </section>`;
}

function findUnit(unitId) {
  return data.units.find((unit) => String(unit.id) === String(unitId));
}

function unitLabel(unit) {
  return `Bloco ${unit.block} · Unidade ${unit.number}`;
}

function renderHeader() {
  const manager = currentUser.profile === 'SINDICO';
  const navigation = [
    { id: 'inicio', label: 'Visão geral', icon: '⌂' },
    ...(manager ? [{ id: 'cadastros', label: 'Unidades e moradores', icon: '▤' }] : []),
    { id: 'areas', label: 'Áreas comuns', icon: '⌂' },
  ];

  return `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Navegação principal">
        <a class="brand" href="#inicio" data-view="inicio"><span class="brand-mark" aria-hidden="true">v</span><span>vivacondo</span></a>
        <div class="property-switcher">
          <span class="property-symbol" aria-hidden="true">H</span>
          <span class="property-copy"><strong>${escapeHTML(data.condominium.name)}</strong><small>Área do condomínio</small></span>
        </div>
        <p class="nav-caption">SPRINT 1</p>
        <nav class="main-nav">
          ${navigation.map((item) => `
            <a class="nav-link ${currentView === item.id ? 'is-active' : ''}" href="#${item.id}" data-view="${item.id}">
              <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
            </a>`).join('')}
        </nav>
        <div class="sidebar-bottom">
          <div class="profile-button">
            <span class="avatar">${escapeHTML(currentUser.name.slice(0, 1).toLocaleUpperCase('pt-BR'))}</span>
            <span class="profile-copy"><strong>${escapeHTML(currentUser.name)}</strong><small>${manager ? 'Síndico(a)' : 'Morador(a)'}</small></span>
          </div>
          <button class="button button-quiet button-wide" type="button" data-action="logout">Sair</button>
        </div>
      </aside>
      <main class="main-content">
        <header class="topbar">
          <div class="breadcrumb"><span>${escapeHTML(data.condominium.name)}</span><span aria-hidden="true">/</span><strong>${navigation.find((item) => item.id === currentView)?.label ?? 'Visão geral'}</strong></div>
          <span class="role-chip">${manager ? 'Síndico(a)' : 'Morador(a)'}</span>
        </header>
        <section class="page-content" id="page-content">${renderView()}</section>
      </main>
    </div>`;
}

function renderDashboard() {
  const manager = currentUser.profile === 'SINDICO';
  const ownUnit = manager ? null : findUnit(currentUser.unitId);
  return `
    <div class="page-heading">
      <div><p class="eyebrow">SPRINT 1 · CADASTROS E ACESSO</p><h1>Olá, ${escapeHTML(currentUser.name.split(' ')[0])}</h1>
      <p class="page-subtitle">${manager ? 'Gerencie os cadastros básicos do condomínio.' : `Seu acesso ao ${escapeHTML(data.condominium.name)}.`}</p></div>
      ${manager ? '<a class="button button-primary" href="#cadastros" data-view="cadastros">Cadastrar unidade ou morador</a>' : ''}
    </div>
    ${manager ? `
      <div class="metrics-grid sprint-metrics">
        <article class="metric-card"><div class="metric-top"><span>Unidades cadastradas</span><span class="metric-icon" aria-hidden="true">⌂</span></div><div class="metric-value">${data.units.length}</div></article>
        <article class="metric-card"><div class="metric-top"><span>Moradores cadastrados</span><span class="metric-icon" aria-hidden="true">♙</span></div><div class="metric-value">${data.users.length}</div></article>
        <article class="metric-card"><div class="metric-top"><span>Áreas comuns</span><span class="metric-icon" aria-hidden="true">▦</span></div><div class="metric-value">${data.commonAreas.length}</div></article>
      </div>
      <section class="panel sprint-intro"><div class="panel-heading"><h2>Escopo desta entrega</h2><p>Somente histórias planejadas para a Sprint 1.</p></div><div class="sprint-link-grid">
        <a class="sprint-link" href="#cadastros" data-view="cadastros"><strong>Unidades e moradores</strong><span>Cadastro com validação de vínculo e CPF.</span></a>
        <a class="sprint-link" href="#areas" data-view="areas"><strong>Áreas comuns</strong><span>Cadastro com capacidade e horário limite.</span></a>
      </div></section>
    ` : `
      <div class="resident-summary">
        <span class="metric-icon" aria-hidden="true">⌂</span>
        <div><strong>Unidade vinculada</strong><p>${ownUnit ? escapeHTML(unitLabel(ownUnit)) : 'Entre em contato com a administração para verificar seu vínculo.'}</p></div>
      </div>
      <section class="panel sprint-intro"><div class="panel-heading"><h2>Áreas comuns disponíveis</h2><p>Consulta de áreas cadastradas no condomínio.</p></div>${renderCommonAreaList(false)}</section>
    `}
    <p class="sprint-scope-note">Reservas, chamados e assistente virtual não fazem parte das histórias desta sprint.</p>`;
}

function renderUnitRows() {
  if (!data.units.length) return '<div class="empty-state">Nenhuma unidade cadastrada.</div>';
  return `<div class="data-list">${data.units.map((unit) => {
    const residentCount = unit.residentCount;
    return `<article class="data-row"><div><strong>${escapeHTML(unitLabel(unit))}</strong><small>${residentCount} morador(es) vinculado(s)</small></div></article>`;
  }).join('')}</div>`;
}

function renderResidentRows() {
  const residents = data.users;
  if (!residents.length) return '<div class="empty-state">Nenhum morador cadastrado.</div>';
  return `<div class="data-list">${residents.map((resident) => {
    const unit = findUnit(resident.unitId);
    const maskedCpf = `•••.•••.•••-${resident.cpf.slice(-2)}`;
    return `<article class="data-row"><div><strong>${escapeHTML(resident.name)}</strong><small>${escapeHTML(resident.email)} · CPF ${maskedCpf}</small></div><span class="data-tag">${unit ? escapeHTML(unitLabel(unit)) : 'Unidade não localizada'}</span></article>`;
  }).join('')}</div>`;
}

function renderManagement() {
  const residentForm = data.units.length ? `
    <form class="form-card" id="resident-form">
      <h3>Cadastrar morador</h3>
      <label for="resident-name">Nome completo</label><input id="resident-name" name="name" maxlength="100" autocomplete="name" required />
      <label for="resident-email">E-mail de acesso</label><input id="resident-email" name="email" type="email" maxlength="150" autocomplete="email" required />
      <label for="resident-cpf">CPF</label><input id="resident-cpf" name="cpf" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required />
      <label for="resident-unit">Unidade</label><select id="resident-unit" name="unitId" required><option value="">Selecione uma unidade</option>${data.units.map((unit) => `<option value="${escapeHTML(unit.id)}">${escapeHTML(unitLabel(unit))}</option>`).join('')}</select>
      <label for="resident-password">Senha inicial <span class="optional-label">mínimo de 8 caracteres</span></label><input id="resident-password" name="password" type="password" minlength="8" autocomplete="new-password" required />
      <p class="form-error" id="resident-error" role="alert"></p>
      <button class="button button-primary" type="submit">Cadastrar morador</button>
    </form>` : `
      <div class="form-card form-hint"><h3>Cadastre uma unidade primeiro</h3><p>O morador precisa estar associado a uma unidade existente.</p></div>`;

  return `
    <div class="page-heading"><div><p class="eyebrow">GESTÃO DO CONDOMÍNIO</p><h1>Unidades e moradores</h1><p class="page-subtitle">Cadastre unidades e vincule cada morador a uma unidade existente.</p></div></div>
    <div class="management-grid">
      <section class="panel"><div class="panel-header"><div class="panel-heading"><h2>Nova unidade</h2><p>Bloco e número devem ser únicos no condomínio.</p></div></div>
        <form class="form-card" id="unit-form">
          <label for="unit-block">Bloco</label><input id="unit-block" name="block" maxlength="20" required />
          <label for="unit-number">Número da unidade</label><input id="unit-number" name="number" maxlength="20" required />
          <p class="form-error" id="unit-error" role="alert"></p>
          <button class="button button-primary" type="submit">Cadastrar unidade</button>
        </form>
      </section>
      <section class="panel"><div class="panel-header"><div class="panel-heading"><h2>Morador</h2><p>CPF válido e vínculo obrigatório com unidade.</p></div></div>${residentForm}</section>
    </div>
    <section class="panel list-panel"><div class="panel-header"><div class="panel-heading"><h2>Unidades cadastradas</h2><p>${data.units.length} unidade(s)</p></div></div>${renderUnitRows()}</section>
    <section class="panel list-panel"><div class="panel-header"><div class="panel-heading"><h2>Moradores cadastrados</h2><p>${data.users.filter((user) => user.profile === 'MORADOR').length} morador(es)</p></div></div>${renderResidentRows()}</section>`;
}

function renderCommonAreaList(canManage) {
  if (!data.commonAreas.length) return '<div class="empty-state">Nenhuma área comum cadastrada.</div>';
  return `<div class="data-list">${data.commonAreas.map((area) => `
    <article class="data-row"><div><strong>${escapeHTML(area.name)}</strong><small>Capacidade máxima: ${area.capacity} pessoas · Horário limite: ${escapeHTML(area.usageLimit)}</small></div>${canManage ? '<span class="data-tag">Cadastrada</span>' : ''}</article>`).join('')}</div>`;
}

function renderAreas() {
  const manager = currentUser.profile === 'SINDICO';
  return `
    <div class="page-heading"><div><p class="eyebrow">ESTRUTURA DO CONDOMÍNIO</p><h1>Áreas comuns</h1><p class="page-subtitle">${manager ? 'Cadastre espaços disponíveis no condomínio.' : 'Consulte os espaços cadastrados pela administração.'}</p></div></div>
    ${manager ? `
      <section class="panel"><div class="panel-header"><div class="panel-heading"><h2>Nova área comum</h2><p>O nome não pode se repetir neste condomínio.</p></div></div>
        <form class="form-card form-grid" id="area-form">
          <div><label for="area-name">Nome da área</label><input id="area-name" name="name" maxlength="100" placeholder="Ex.: Salão de festas" required /></div>
          <div><label for="area-capacity">Capacidade máxima</label><input id="area-capacity" name="capacity" type="number" min="1" step="1" required /></div>
          <div><label for="area-limit">Horário limite de uso</label><input id="area-limit" name="usageLimit" type="time" required /></div>
          <p class="form-error form-grid-wide" id="area-error" role="alert"></p>
          <button class="button button-primary form-grid-wide" type="submit">Cadastrar área comum</button>
        </form>
      </section>` : ''}
    <section class="panel list-panel"><div class="panel-header"><div class="panel-heading"><h2>Áreas cadastradas</h2><p>${data.commonAreas.length} área(s) comum(ns)</p></div></div>${renderCommonAreaList(manager)}</section>`;
}

function renderView() {
  if (currentView === 'cadastros' && currentUser.profile === 'SINDICO') return renderManagement();
  if (currentView === 'areas') return renderAreas();
  return renderDashboard();
}

function renderApp() {
  if (!currentUser) {
    renderLogin();
    return;
  }
  app.innerHTML = renderHeader();
}

async function navigate(view) {
  if (view === 'cadastros' && currentUser.profile !== 'SINDICO') {
    showToast('Apenas o perfil de síndico pode gerenciar unidades e moradores.');
    view = 'inicio';
  }
  await loadAccountData();
  currentView = view;
  window.history.replaceState(null, '', `#${view}`);
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayFormError(id, message) {
  const target = document.querySelector(`#${id}`);
  if (target) target.textContent = message;
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleBootstrap(form) {
  const values = readForm(form);
  await apiRequest('/setup', {
    method: 'POST',
    body: JSON.stringify({
      condominiumName: values.condominium.trim(),
      address: values.address.trim(),
      name: values.name.trim(),
      email: normalize(values.email),
      password: values.password,
    }),
  });
  data.condominium = { name: values.condominium.trim() };
  showToast('Condomínio configurado. Entre com o e-mail e a senha cadastrados.');
  renderLogin();
}

async function handleLogin(form) {
  const values = readForm(form);
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: normalize(values.email),
      password: values.password,
      profile: values.profile,
    }),
  });
  accessToken = result.token;
  sessionStorage.setItem(SESSION_KEY, accessToken);
  currentUser = result.user;
  await navigate('inicio');
}

async function handleUnit(form) {
  const values = readForm(form);
  await apiRequest('/units', {
    method: 'POST',
    body: JSON.stringify({ block: values.block.trim(), number: values.number.trim() }),
  });
  showToast('Unidade cadastrada.');
  await navigate('cadastros');
}

async function handleResident(form) {
  const values = readForm(form);
  if (!findUnit(values.unitId)) {
    displayFormError('resident-error', 'Selecione uma unidade cadastrada.');
    return;
  }
  await apiRequest('/residents', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name.trim(),
      email: normalize(values.email),
      cpf: values.cpf,
      unitId: Number(values.unitId),
      password: values.password,
    }),
  });
  showToast('Morador cadastrado e vinculado à unidade.');
  await navigate('cadastros');
}

async function handleArea(form) {
  const values = readForm(form);
  await apiRequest('/areas', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name.trim(),
      capacity: Number(values.capacity),
      usageLimit: values.usageLimit,
    }),
  });
  showToast('Área comum cadastrada.');
  await navigate('areas');
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink && currentUser) {
    event.preventDefault();
    navigate(viewLink.dataset.view).catch((error) => showToast(error.message));
    return;
  }

  if (event.target.closest('[data-action="logout"]')) {
    sessionStorage.removeItem(SESSION_KEY);
    accessToken = null;
    currentUser = null;
    currentView = 'inicio';
    renderLogin();
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();

  try {
    if (form.id === 'bootstrap-form') await handleBootstrap(form);
    else if (form.id === 'login-form') await handleLogin(form);
    else if (form.id === 'unit-form') await handleUnit(form);
    else if (form.id === 'resident-form') await handleResident(form);
    else if (form.id === 'area-form') await handleArea(form);
  } catch (error) {
    const errorId = {
      'bootstrap-form': 'bootstrap-error',
      'login-form': 'login-error',
      'unit-form': 'unit-error',
      'resident-form': 'resident-error',
      'area-form': 'area-error',
    }[form.id];
    if (errorId) displayFormError(errorId, error.message || 'Não foi possível concluir a operação.');
    if (form.id === 'login-form' && errorId) displayFormError(errorId, error.message);
  }
});

async function initialize() {
  const setup = await apiRequest('/setup');
  data.condominium = setup.condominiumName ? { name: setup.condominiumName } : null;
  if (!setup.initialized) {
    renderBootstrap();
    return;
  }

  if (accessToken) {
    try {
      currentUser = await apiRequest('/me');
      await navigate('inicio');
      return;
    } catch (error) {
      if (error.status !== 401) throw error;
      sessionStorage.removeItem(SESSION_KEY);
      accessToken = null;
    }
  }
  renderLogin();
}

initialize().catch(showStartupError);
