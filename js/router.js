/**
 * MediCore HMS - Router
 * Hash-based SPA routing
 */

const Router = (() => {
  const routes = {};
  let currentPage = null;

  function register(name, handler) {
    routes[name] = handler;
  }

  function navigate(page, params = {}) {
    const hash = params && Object.keys(params).length
      ? `#${page}?${new URLSearchParams(params).toString()}`
      : `#${page}`;
    window.location.hash = hash;
  }

  function getCurrentPage() { return currentPage; }

  function parseHash() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [page, query] = hash.split('?');
    const params = query ? Object.fromEntries(new URLSearchParams(query)) : {};
    return { page: page || 'dashboard', params };
  }

  function handle() {
    const { page, params } = parseHash();
    currentPage = page;

    if (!Auth.isLoggedIn()) {
      App.showAuth();
      return;
    }

    // Check page access
    if (!Auth.can('view', page) && page !== 'dashboard') {
      UI.toast('Access denied. You do not have permission to view this page.', 'danger');
      navigate('dashboard');
      return;
    }

    App.showApp();
    UI.setActiveNav(page);
    UI.setPageTitle(page);

    const handler = routes[page];
    if (handler) {
      handler(params);
    } else {
      document.getElementById('page-content').innerHTML = `
        <div class="empty-state" style="margin-top: 80px">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>Page Not Found</h3>
          <p>The page "${page}" doesn't exist.</p>
          <button class="btn btn-primary" onclick="Router.navigate('dashboard')">Go to Dashboard</button>
        </div>`;
    }
  }

  function init() {
    window.addEventListener('hashchange', handle);
    handle();
  }

  return { register, navigate, getCurrentPage, init, parseHash };
})();
