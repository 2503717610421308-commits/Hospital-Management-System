/**
 * MediCore HMS - Authentication Module
 * Handles login, logout, session, and role-based access control
 */

const Auth = (() => {
  const SESSION_KEY = 'medicore_session';

  function hashPassword(password) {
    // Simple base64 encoding (matches seeder); in production use bcrypt via backend
    return btoa(password);
  }

  async function login(usernameOrEmail, password) {
    const users = await DB.getAll('users');
    const user = users.find(u =>
      (u.username === usernameOrEmail || u.email === usernameOrEmail)
    );
    if (!user) throw new Error('User not found. Please check your username or email.');
    if (user.password !== hashPassword(password)) throw new Error('Invalid password. Please try again.');
    if (user.status === 'inactive') throw new Error('Your account has been deactivated. Contact the administrator.');

    const session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function isLoggedIn() { return !!getSession(); }

  function getRole() { return getSession()?.role || null; }

  function getUserId() { return getSession()?.userId || null; }

  function can(action, resource) {
    const role = getRole();
    const permissions = {
      admin: {
        view: ['dashboard', 'patients', 'doctors', 'departments', 'appointments', 'medical_records', 'prescriptions', 'billing', 'users'],
        create: ['patients', 'doctors', 'departments', 'appointments', 'medical_records', 'prescriptions', 'billing', 'users'],
        edit: ['patients', 'doctors', 'departments', 'appointments', 'medical_records', 'prescriptions', 'billing', 'users'],
        delete: ['patients', 'doctors', 'departments', 'appointments', 'medical_records', 'prescriptions', 'billing', 'users'],
      },
      doctor: {
        view: ['dashboard', 'patients', 'doctors', 'appointments', 'medical_records', 'prescriptions', 'billing'],
        create: ['medical_records', 'prescriptions'],
        edit: ['medical_records', 'prescriptions', 'appointments'],
        delete: [],
      },
      receptionist: {
        view: ['dashboard', 'patients', 'doctors', 'departments', 'appointments', 'billing'],
        create: ['patients', 'appointments', 'billing'],
        edit: ['patients', 'appointments', 'billing'],
        delete: ['appointments'],
      },
      patient: {
        view: ['dashboard', 'appointments', 'medical_records', 'prescriptions', 'billing'],
        create: ['appointments'],
        edit: [],
        delete: [],
      }
    };
    return permissions[role]?.[action]?.includes(resource) ?? false;
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      Router.navigate('login');
      return false;
    }
    return true;
  }

  return { login, logout, getSession, isLoggedIn, getRole, getUserId, can, requireAuth, hashPassword };
})();
