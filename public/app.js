// public/app.js – Frontend Logic for GymPro

const API = '';  // Same origin
let authToken = localStorage.getItem('token') || '';
let allMembers = [];
let deleteTargetId = null;

/* ────── AUTH ────── */
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Signing in…';

  try {
    const res  = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    authToken = data.token;
    localStorage.setItem('token', authToken);
    document.getElementById('user-email-display').textContent = email;
    showDashboard();
    fetchMembers();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('register-error');
  const sucEl    = document.getElementById('register-success');
  const btn      = document.getElementById('register-btn');

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Creating…';

  try {
    const res  = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors && data.errors[0].msg) || 'Registration failed');

    authToken = data.token;
    localStorage.setItem('token', authToken);
    sucEl.textContent = '✓ Account created! Redirecting…';
    sucEl.classList.remove('hidden');
    document.getElementById('user-email-display').textContent = email;
    setTimeout(() => { showDashboard(); fetchMembers(); }, 1000);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Create Account';
  }
}

function handleLogout() {
  authToken = '';
  localStorage.removeItem('token');
  allMembers = [];
  showAuth();
}

/* ────── NAV ────── */
function showDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.remove('hidden');
}
function showAuth() {
  document.getElementById('dashboard-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

/* ────── MEMBERS API ────── */
async function apiFetch(path, opts = {}) {
  opts.headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...(opts.headers || {}),
  };
  opts.credentials = 'include';
  const res = await fetch(`${API}${path}`, opts);
  if (res.status === 401 || res.status === 403) { handleLogout(); throw new Error('Session expired'); }
  return res;
}

async function fetchMembers() {
  try {
    const res     = await apiFetch('/api/members');
    const members = await res.json();
    allMembers    = members;
    renderMembers(members);
    updateStats(members);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateStats(members) {
  document.getElementById('stat-total').textContent    = members.length;
  document.getElementById('stat-premium').textContent  = members.filter(m => m.membership_type === 'premium').length;
  document.getElementById('stat-standard').textContent = members.filter(m => m.membership_type === 'standard').length;
  document.getElementById('stat-basic').textContent    = members.filter(m => m.membership_type === 'basic').length;
}

function renderMembers(members) {
  const tbody = document.getElementById('members-tbody');
  if (!members.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No members found. Add your first member!</td></tr>';
    return;
  }
  tbody.innerHTML = members.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escHtml(m.name)}</strong></td>
      <td>${m.age}</td>
      <td><span class="badge badge-${m.membership_type}">${capitalize(m.membership_type)}</span></td>
      <td>${formatDate(m.start_date)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openEditModal(${m.id})">✏️ Edit</button>
          <button class="btn-delete" onclick="openDeleteModal(${m.id}, '${escHtml(m.name)}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterMembers() {
  const q = document.getElementById('search-input').value.toLowerCase();
  renderMembers(allMembers.filter(m => m.name.toLowerCase().includes(q)));
}

/* ────── ADD / EDIT MODAL ────── */
function openModal() {
  document.getElementById('modal-title').textContent = 'Add New Member';
  document.getElementById('edit-id').value = '';
  document.getElementById('member-form').reset();
  document.getElementById('modal-error').classList.add('hidden');
  document.getElementById('save-btn').textContent = 'Save Member';
  document.getElementById('member-modal').classList.remove('hidden');
}

async function openEditModal(id) {
  const member = allMembers.find(m => m.id === id);
  if (!member) return;
  document.getElementById('modal-title').textContent = 'Edit Member';
  document.getElementById('edit-id').value = id;
  document.getElementById('m-name').value  = member.name;
  document.getElementById('m-age').value   = member.age;
  document.getElementById('m-type').value  = member.membership_type;
  // Format date for input[type=date]
  document.getElementById('m-date').value  = member.start_date ? member.start_date.substring(0, 10) : '';
  document.getElementById('modal-error').classList.add('hidden');
  document.getElementById('save-btn').textContent = 'Update Member';
  document.getElementById('member-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('member-modal').classList.add('hidden');
}
function closeModalOnBackdrop(e) {
  if (e.target.id === 'member-modal') closeModal();
}

async function handleSaveMember(e) {
  e.preventDefault();
  const id   = document.getElementById('edit-id').value;
  const body = {
    name:            document.getElementById('m-name').value.trim(),
    age:             parseInt(document.getElementById('m-age').value),
    membership_type: document.getElementById('m-type').value,
    start_date:      document.getElementById('m-date').value,
  };
  const errEl  = document.getElementById('modal-error');
  const saveBtn = document.getElementById('save-btn');
  errEl.classList.add('hidden');
  saveBtn.disabled = true;

  try {
    const method = id ? 'PUT' : 'POST';
    const path   = id ? `/api/members/${id}` : '/api/members';
    const res    = await apiFetch(path, { method, body: JSON.stringify(body) });
    const data   = await res.json();
    if (!res.ok) {
      const msg = data.message || (data.errors && data.errors[0].msg) || 'Failed to save';
      throw new Error(msg);
    }
    closeModal();
    await fetchMembers();
    showToast(id ? '✓ Member updated!' : '✓ Member added!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    saveBtn.disabled = false;
  }
}

/* ────── DELETE MODAL ────── */
function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('delete-member-name').textContent = name;
  document.getElementById('delete-modal').classList.remove('hidden');
}
function closeDeleteModal(e) {
  if (!e || e.target.id === 'delete-modal') {
    document.getElementById('delete-modal').classList.add('hidden');
    deleteTargetId = null;
  }
}
async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    const res = await apiFetch(`/api/members/${deleteTargetId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    document.getElementById('delete-modal').classList.add('hidden');
    deleteTargetId = null;
    await fetchMembers();
    showToast('✓ Member deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ────── TOAST ────── */
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast toast-${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

/* ────── HELPERS ────── */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function capitalize(str) { return str ? str[0].toUpperCase() + str.slice(1) : ''; }
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

/* ────── INIT ────── */
(function init() {
  if (authToken) {
    showDashboard();
    fetchMembers();
  }
})();
