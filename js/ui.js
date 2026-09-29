/**
 * MediCore HMS - UI Utilities
 * Toast notifications, modals, confirm dialogs, nav, forms
 */

const UI = (() => {
  // ---- TOAST ----
  const toastIcons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    danger: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  function toast(message, type = 'info', title = null, duration = 4000) {
    const container = document.getElementById('toast-container');
    const defaultTitles = { success: 'Success', danger: 'Error', warning: 'Warning', info: 'Info' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${toastIcons[type] || toastIcons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    container.appendChild(el);
    const close = () => {
      el.classList.add('toast-exit');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    el.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration);
  }

  // ---- MODAL ----
  let modalResolve = null;
  const modalContainer = () => document.getElementById('modal-container');
  const modalInner = () => document.getElementById('modal-inner');

  function openModal(title, bodyHTML, options = {}) {
    const container = modalContainer();
    const inner = modalInner();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    inner.className = `modal ${options.size === 'lg' ? 'modal-lg' : options.size === 'xl' ? 'modal-xl' : ''}`;
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const firstInput = inner.querySelector('input, select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
    return new Promise(resolve => { modalResolve = resolve; });
  }

  function closeModal(result = null) {
    const container = modalContainer();
    container.classList.add('hidden');
    document.body.style.overflow = '';
    if (modalResolve) { modalResolve(result); modalResolve = null; }
  }

  // ---- CONFIRM ----
  function confirm(message, title = 'Confirm Action', okText = 'Confirm', okClass = 'btn-danger') {
    return new Promise(resolve => {
      const dialog = document.getElementById('confirm-dialog');
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-message').textContent = message;
      const okBtn = document.getElementById('confirm-ok-btn');
      okBtn.textContent = okText;
      okBtn.className = `btn ${okClass}`;
      dialog.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const cleanup = (result) => {
        dialog.classList.add('hidden');
        document.body.style.overflow = '';
        resolve(result);
      };
      okBtn.onclick = () => cleanup(true);
      document.getElementById('confirm-cancel-btn').onclick = () => cleanup(false);
    });
  }

  // ---- NAVIGATION ----
  const NAV_ITEMS = {
    admin: [
      { section: 'Main', items: [
        { page: 'dashboard', label: 'Dashboard', icon: navIcon('grid') },
      ]},
      { section: 'Management', items: [
        { page: 'patients', label: 'Patients', icon: navIcon('users') },
        { page: 'doctors', label: 'Doctors', icon: navIcon('user-check') },
        { page: 'departments', label: 'Departments', icon: navIcon('briefcase') },
        { page: 'appointments', label: 'Appointments', icon: navIcon('calendar') },
      ]},
      { section: 'Clinical', items: [
        { page: 'medical_records', label: 'Medical Records', icon: navIcon('file-text') },
        { page: 'prescriptions', label: 'Prescriptions', icon: navIcon('clipboard') },
        { page: 'billing', label: 'Billing', icon: navIcon('dollar-sign') },
      ]},
      { section: 'System', items: [
        { page: 'users', label: 'Users & Staff', icon: navIcon('shield') },
      ]},
    ],
    doctor: [
      { section: 'Main', items: [
        { page: 'dashboard', label: 'Dashboard', icon: navIcon('grid') },
        { page: 'appointments', label: 'My Appointments', icon: navIcon('calendar') },
      ]},
      { section: 'Clinical', items: [
        { page: 'patients', label: 'Patients', icon: navIcon('users') },
        { page: 'medical_records', label: 'Medical Records', icon: navIcon('file-text') },
        { page: 'prescriptions', label: 'Prescriptions', icon: navIcon('clipboard') },
      ]},
    ],
    receptionist: [
      { section: 'Main', items: [
        { page: 'dashboard', label: 'Dashboard', icon: navIcon('grid') },
      ]},
      { section: 'Operations', items: [
        { page: 'patients', label: 'Patients', icon: navIcon('users') },
        { page: 'appointments', label: 'Appointments', icon: navIcon('calendar') },
        { page: 'doctors', label: 'Doctors', icon: navIcon('user-check') },
        { page: 'departments', label: 'Departments', icon: navIcon('briefcase') },
        { page: 'billing', label: 'Billing', icon: navIcon('dollar-sign') },
      ]},
    ],
    patient: [
      { section: 'My Portal', items: [
        { page: 'dashboard', label: 'Dashboard', icon: navIcon('grid') },
        { page: 'appointments', label: 'My Appointments', icon: navIcon('calendar') },
        { page: 'medical_records', label: 'My Records', icon: navIcon('file-text') },
        { page: 'prescriptions', label: 'My Prescriptions', icon: navIcon('clipboard') },
        { page: 'billing', label: 'My Bills', icon: navIcon('dollar-sign') },
      ]},
    ],
  };

  function navIcon(name) {
    const icons = {
      grid: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      users: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
      'user-check': `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
      briefcase: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
      calendar: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      'file-text': `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      clipboard: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
      'dollar-sign': `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
      shield: `<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    };
    return icons[name] || icons.grid;
  }

  function buildNav(role) {
    const sections = NAV_ITEMS[role] || NAV_ITEMS.patient;
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = sections.map(section => `
      <div class="nav-section-label">${section.section}</div>
      ${section.items.map(item => `
        <div class="nav-item" data-page="${item.page}" data-label="${item.label}" onclick="Router.navigate('${item.page}')">
          ${item.icon}
          <span class="nav-label">${item.label}</span>
        </div>
      `).join('')}
    `).join('');
  }

  function setActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  }

  const PAGE_TITLES = {
    dashboard: 'Dashboard', patients: 'Patients', doctors: 'Doctors',
    departments: 'Departments', appointments: 'Appointments',
    medical_records: 'Medical Records', prescriptions: 'Prescriptions',
    billing: 'Billing', users: 'Users & Staff',
  };

  function setPageTitle(page) {
    const t = PAGE_TITLES[page] || page;
    document.getElementById('page-title').textContent = t;
    document.title = `${t} — MediCore HMS`;
  }

  // ---- FORM VALIDATION ----
  function validateForm(formData, rules) {
    const errors = {};
    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field];
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rule.requiredMsg || `${rule.label || field} is required.`;
        continue;
      }
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters.`;
      }
      if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = 'Please enter a valid email address.';
      }
      if (value && rule.phone && !/^[+\d\s\-()]{7,15}$/.test(value)) {
        errors[field] = 'Please enter a valid phone number.';
      }
    }
    return errors;
  }

  function showFieldErrors(errors, prefix = '') {
    // Clear all errors first
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));
    for (const [field, msg] of Object.entries(errors)) {
      const errorEl = document.getElementById(`${prefix}${field}-error`);
      if (errorEl) errorEl.textContent = msg;
      const inputEl = document.getElementById(`${prefix}${field}`) || document.querySelector(`[name="${field}"]`);
      if (inputEl) inputEl.classList.add('error');
    }
  }

  // ---- PAGINATION ----
  function paginate(items, page, perPage = 10) {
    const total = items.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
      items: items.slice(start, end),
      total, totalPages, currentPage: page, perPage,
      start: start + 1, end: Math.min(end, total)
    };
  }

  function renderPagination(pager, onPageChange) {
    if (pager.totalPages <= 1) return '';
    const pages = [];
    for (let i = 1; i <= pager.totalPages; i++) {
      pages.push(`<button class="pagination-btn ${i === pager.currentPage ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`);
    }
    return `
      <div class="pagination">
        <span class="pagination-info">Showing ${pager.start}–${pager.end} of ${pager.total}</span>
        <div class="pagination-controls">
          <button class="pagination-btn" onclick="(${onPageChange})(${pager.currentPage - 1})" ${pager.currentPage === 1 ? 'disabled' : ''}>‹</button>
          ${pages.join('')}
          <button class="pagination-btn" onclick="(${onPageChange})(${pager.currentPage + 1})" ${pager.currentPage === pager.totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>`;
  }

  // ---- HELPERS ----
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return dateStr; }
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateStr; }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  }

  function statusBadge(status) {
    return `<span class="badge badge-${status.toLowerCase()}">${status}</span>`;
  }

  function roleBadge(role) {
    return `<span class="badge badge-${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>`;
  }

  function calcAge(dob) {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  function emptyState(message, subtext = '', actionBtn = '') {
    return `<div class="table-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
      <p>${message}</p>
      ${subtext ? `<span>${subtext}</span>` : ''}
      ${actionBtn}
    </div>`;
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    if (text) text.classList.toggle('hidden', loading);
    if (spinner) spinner.classList.toggle('hidden', !loading);
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  return {
    toast, openModal, closeModal, confirm,
    buildNav, setActiveNav, setPageTitle,
    validateForm, showFieldErrors,
    paginate, renderPagination,
    formatDate, formatDateTime, formatCurrency,
    statusBadge, roleBadge, calcAge,
    emptyState, setLoading, getInitials, navIcon
  };
})();
