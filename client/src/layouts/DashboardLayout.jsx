import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAllNotificationsRead } from '../services/billingService';

const menuConfig = {
  admin: [
    { section: 'Main' },
    { path: '/admin/dashboard', icon: 'grid-1x2-fill', label: 'Dashboard' },
    { section: 'Management' },
    { path: '/admin/patients', icon: 'people-fill', label: 'Patients' },
    { path: '/admin/doctors', icon: 'person-badge-fill', label: 'Doctors' },
    { path: '/admin/nurses', icon: 'heart-pulse-fill', label: 'Nurses' },
    { path: '/admin/departments', icon: 'building', label: 'Departments' },
    { path: '/admin/appointments', icon: 'calendar-check', label: 'Appointments' },
    { path: '/admin/medicines', icon: 'capsule', label: 'Medicines' },
    { path: '/admin/billing', icon: 'receipt', label: 'Billing' },
    { section: 'Analytics' },
    { path: '/admin/reports', icon: 'bar-chart-line-fill', label: 'Reports' },
  ],
  doctor: [
    { section: 'Main' },
    { path: '/doctor/dashboard', icon: 'grid-1x2-fill', label: 'Dashboard' },
    { section: 'Clinical' },
    { path: '/doctor/appointments', icon: 'calendar-check', label: 'Appointments' },
    { path: '/doctor/patients', icon: 'people-fill', label: 'My Patients' },
    { path: '/doctor/medical-records', icon: 'file-earmark-medical', label: 'Medical Records' },
    { path: '/doctor/prescriptions', icon: 'prescription2', label: 'Prescriptions' },
  ],
  nurse: [
    { section: 'Main' },
    { path: '/nurse/dashboard', icon: 'grid-1x2-fill', label: 'Dashboard' },
    { section: 'Patient Care' },
    { path: '/nurse/patients', icon: 'people-fill', label: 'Assigned Patients' },
    { path: '/nurse/appointments', icon: 'calendar-check', label: 'Appointments' },
    { path: '/nurse/vitals', icon: 'heart-pulse-fill', label: 'Vitals' },
    { path: '/nurse/notes', icon: 'journal-text', label: 'Nursing Notes' },
  ],
  receptionist: [
    { section: 'Main' },
    { path: '/receptionist/dashboard', icon: 'grid-1x2-fill', label: 'Dashboard' },
    { section: 'Operations' },
    { path: '/receptionist/register-patient', icon: 'person-plus-fill', label: 'Register Patient' },
    { path: '/receptionist/patients', icon: 'people-fill', label: 'Patients' },
    { path: '/receptionist/schedule', icon: 'calendar-plus', label: 'Schedule Appointment' },
    { path: '/receptionist/appointments', icon: 'calendar-check', label: 'Appointments' },
    { path: '/receptionist/billing', icon: 'receipt', label: 'Billing' },
  ],
  patient: [
    { section: 'Main' },
    { path: '/patient/dashboard', icon: 'grid-1x2-fill', label: 'Dashboard' },
    { section: 'Services' },
    { path: '/patient/profile', icon: 'person-circle', label: 'My Profile' },
    { path: '/patient/find-doctor', icon: 'search', label: 'Find Doctor' },
    { path: '/patient/book-appointment', icon: 'calendar-plus', label: 'Book Appointment' },
    { path: '/patient/appointments', icon: 'calendar-check', label: 'My Appointments' },
    { path: '/patient/medical-records', icon: 'file-earmark-medical', label: 'Medical Records' },
    { path: '/patient/prescriptions', icon: 'prescription2', label: 'Prescriptions' },
    { path: '/patient/bills', icon: 'receipt', label: 'Bills & Payments' },
    { path: '/patient/notifications', icon: 'bell', label: 'Notifications' },
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menu = menuConfig[user?.role] || [];

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data?.slice(0, 5) || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) { /* silent */ }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeSidebar = () => setSidebarOpen(false);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { /* silent */ }
  };

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <i className="bi bi-hospital hospital-icon"></i>
          <div>
            <h5>HMS</h5>
            <small style={{ color: '#718096', fontSize: '0.7rem' }}>{user?.role?.toUpperCase()} PORTAL</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menu.map((item, idx) =>
            item.section ? (
              <div key={idx} className="sidebar-section">{item.section}</div>
            ) : (
              <Link key={idx} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`} onClick={closeSidebar}>
                <i className={`bi bi-${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            )
          )}
          <div className="sidebar-section">Account</div>
          <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="d-flex align-items-center gap-3">
            <button className="sidebar-toggle d-lg-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="bi bi-list"></i>
            </button>
            <nav className="breadcrumb-nav d-none d-md-block">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to={`/${user?.role}/dashboard`}>Home</Link></li>
                <li className="breadcrumb-item active">{location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* Notifications dropdown */}
            <div className="dropdown">
              <button className="notification-bell btn btn-link text-secondary p-0" data-bs-toggle="dropdown">
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && <span className="badge rounded-pill bg-danger">{unreadCount}</span>}
              </button>
              <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: '320px', maxHeight: '400px', overflow: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h6 className="mb-0">Notifications</h6>
                  {unreadCount > 0 && <button className="btn btn-sm btn-link" onClick={handleMarkAllRead}>Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-3 border-bottom ${!n.isRead ? 'bg-light' : ''}`}>
                      <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{n.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{n.message}</div>
                      <small className="text-muted">{new Date(n.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* User info */}
            <div className="dropdown">
              <button className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="d-none d-md-inline" style={{ fontSize: '0.9rem' }}>{user?.name}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item-text small text-muted">{user?.email}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-left me-2"></i>Logout</button></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
