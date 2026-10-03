const STORAGE_KEY = 'vivacondo.sprint1.data.v1';
const SESSION_KEY = 'vivacondo.sprint1.user';
const PASSWORD_ITERATIONS = 120000;
const EMPTY_DATA = { condominium: null, users: [], units: [], commonAreas: [] };
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
let data;
let currentUser = null;
let currentView = 'inicio';
let toastTimer;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(EMPTY_DATA);

  const parsed = JSON.parse(saved);
  if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.units) || !Array.isArray(parsed.commonAreas)) {
    throw new Error('Os dados locais estão inválidos. Limpe os dados deste site para reiniciar o protótipo.');
  }
  return parsed;
}

function persistData(nextData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
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

function newId() {
  return crypto.randomUUID();
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('pt-BR');
}

function base64FromBytes(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function bytesFromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function derivePassword(password, salt) {
  if (!crypto.subtle) throw new Error('Este navegador não permite autenticação segura neste contexto. Abra a aplicação em localhost.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  );
}

async function createCredential(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt);
  return { passwordSalt: base64FromBytes(salt), passwordHash: base64FromBytes(hash) };
}

async function verifyPassword(password, user) {
  const actual = new Uint8Array(await derivePassword(password, bytesFromBase64(user.passwordSalt)));
  const expected = bytesFromBase64(user.passwordHash);
  if (actual.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

function isValidCpf(value) {
  const cpf = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length) => {
    const sum = cpf.slice(0, length).split('').reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function showStorageError(error) {
  app.innerHTML = `
    <section class="auth-screen">
      <div class="auth-card">
        <span class="brand-mark" aria-hidden="true">v</span>
        <h1>Não foi possível abrir o protótipo</h1>
        <p class="page-subtitle">${escapeHTML(error.message)}</p>
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
        <div class="prototype-notice">Protótipo de interface: os dados ficam somente neste navegador. Não use senhas reais.</div>
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
        <p class="page-subtitle">${escapeHTML(data.condominium.name)}</p>
        <div class="prototype-notice">Protótipo local de Sprint 1. A autenticação não substitui uma API/backend.</div>
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
  return data.units.find((unit) => unit.id === unitId);
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
          <div class="prototype-notice">Modo de demonstração local. Não use dados ou senhas reais.</div>
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
        <article class="metric-card"><div class="metric-top"><span>Moradores cadastrados</span><span class="metric-icon" aria-hidden="true">♙</span></div><div class="metric-value">${data.users.filter((user) => user.profile === 'MORADOR').length}</div></article>
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
    const residentCount = data.users.filter((user) => user.profile === 'MORADOR' && user.unitId === unit.id).length;
    return `<article class="data-row"><div><strong>${escapeHTML(unitLabel(unit))}</strong><small>${residentCount} morador(es) vinculado(s)</small></div></article>`;
  }).join('')}</div>`;
}

function renderResidentRows() {
  const residents = data.users.filter((user) => user.profile === 'MORADOR');
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

function navigate(view) {
  if (view === 'cadastros' && currentUser.profile !== 'SINDICO') {
    showToast('Apenas o perfil de síndico pode gerenciar unidades e moradores.');
    view = 'inicio';
  }
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
  const email = normalize(values.email);
  if (values.password.length < 8) {
    displayFormError('bootstrap-error', 'A senha precisa ter no mínimo 8 caracteres.');
    return;
  }

  const credential = await createCredential(values.password);
  const administrator = {
    id: newId(),
    name: values.name.trim(),
    email,
    profile: 'SINDICO',
    ...credential,
  };
  const nextData = {
    condominium: { id: newId(), name: values.condominium.trim(), address: values.address.trim() },
    users: [administrator],
    units: [],
    commonAreas: [],
  };
  persistData(nextData);
  data = nextData;
  showToast('Condomínio configurado. Entre com o e-mail e a senha cadastrados.');
  renderLogin();
}

async function handleLogin(form) {
  const values = readForm(form);
  const email = normalize(values.email);
  const user = data.users.find((candidate) => candidate.email === email && candidate.profile === values.profile);
  if (!user || !await verifyPassword(values.password, user)) {
    renderLogin('E-mail, senha ou perfil inválido. Confira os dados e tente novamente.');
    return;
  }

  sessionStorage.setItem(SESSION_KEY, user.id);
  currentUser = user;
  navigate('inicio');
}

function handleUnit(form) {
  const values = readForm(form);
  const block = values.block.trim();
  const number = values.number.trim();
  const duplicate = data.units.some((unit) => normalize(unit.block) === normalize(block) && normalize(unit.number) === normalize(number));
  if (duplicate) {
    displayFormError('unit-error', 'Já existe uma unidade com esse bloco e número.');
    return;
  }

  const nextData = {
    ...data,
    units: [...data.units, { id: newId(), block, number }],
  };
  persistData(nextData);
  data = nextData;
  showToast('Unidade cadastrada.');
  navigate('cadastros');
}

async function handleResident(form) {
  const values = readForm(form);
  const cpf = values.cpf.replace(/\D/g, '');
  if (!isValidCpf(cpf)) {
    displayFormError('resident-error', 'Informe um CPF válido.');
    return;
  }
  if (!findUnit(values.unitId)) {
    displayFormError('resident-error', 'Selecione uma unidade cadastrada.');
    return;
  }
  const email = normalize(values.email);
  if (data.users.some((user) => user.email === email)) {
    displayFormError('resident-error', 'Já existe um usuário cadastrado com esse e-mail.');
    return;
  }
  if (data.users.some((user) => user.cpf === cpf)) {
    displayFormError('resident-error', 'Já existe um morador cadastrado com esse CPF.');
    return;
  }
  if (values.password.length < 8) {
    displayFormError('resident-error', 'A senha precisa ter no mínimo 8 caracteres.');
    return;
  }

  const credential = await createCredential(values.password);
  const resident = {
    id: newId(),
    name: values.name.trim(),
    email,
    profile: 'MORADOR',
    cpf,
    unitId: values.unitId,
    ...credential,
  };
  const nextData = { ...data, users: [...data.users, resident] };
  persistData(nextData);
  data = nextData;
  showToast('Morador cadastrado e vinculado à unidade.');
  navigate('cadastros');
}

function handleArea(form) {
  const values = readForm(form);
  const name = values.name.trim();
  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    displayFormError('area-error', 'A capacidade deve ser um número inteiro maior que zero.');
    return;
  }
  if (data.commonAreas.some((area) => normalize(area.name) === normalize(name))) {
    displayFormError('area-error', 'Já existe uma área com esse nome neste condomínio.');
    return;
  }

  const nextData = {
    ...data,
    commonAreas: [...data.commonAreas, { id: newId(), name, capacity, usageLimit: values.usageLimit }],
  };
  persistData(nextData);
  data = nextData;
  showToast('Área comum cadastrada.');
  navigate('areas');
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink && currentUser) {
    event.preventDefault();
    navigate(viewLink.dataset.view);
    return;
  }

  if (event.target.closest('[data-action="logout"]')) {
    sessionStorage.removeItem(SESSION_KEY);
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
    else if (form.id === 'unit-form') handleUnit(form);
    else if (form.id === 'resident-form') await handleResident(form);
    else if (form.id === 'area-form') handleArea(form);
  } catch (error) {
    const errorId = {
      'bootstrap-form': 'bootstrap-error',
      'login-form': 'login-error',
      'unit-form': 'unit-error',
      'resident-form': 'resident-error',
      'area-form': 'area-error',
    }[form.id];
    if (errorId) displayFormError(errorId, error.message || 'Não foi possível concluir a operação.');
  }
});

try {
  data = loadData();
  const sessionUserId = sessionStorage.getItem(SESSION_KEY);
  currentUser = data.users.find((user) => user.id === sessionUserId) ?? null;
  if (!data.condominium) renderBootstrap();
  else renderApp();
} catch (error) {
  showStorageError(error);
}
