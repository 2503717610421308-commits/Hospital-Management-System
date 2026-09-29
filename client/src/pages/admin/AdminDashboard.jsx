import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import { getDashboardStats } from '../../services/billingService';
import { getAppointments } from '../../services/appointmentService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, aptsRes] = await Promise.all([getDashboardStats(), getAppointments({ limit: 5 })]);
      setStats(statsRes.data.data);
      setRecentApts(aptsRes.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const s = stats || {};
  const columns = [
    { header: 'ID', render: (r) => <span className="badge bg-light text-dark">{r.appointmentId}</span> },
    { header: 'Patient', render: (r) => r.patientId?.name || 'N/A' },
    { header: 'Doctor', render: (r) => r.doctorId?.name || 'N/A' },
    { header: 'Date', render: (r) => new Date(r.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Status', render: (r) => {
      const colors = { Pending: 'warning', Confirmed: 'primary', Completed: 'success', Cancelled: 'danger', Rejected: 'secondary', 'In-Progress': 'info' };
      return <span className={`badge bg-${colors[r.status] || 'secondary'}`}>{r.status}</span>;
    }}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h4 className="fw-bold mb-1">Admin Dashboard</h4><p className="text-muted mb-0">Welcome to Hospital Management System</p></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6"><StatCard icon="people-fill" label="Total Patients" value={s.totalPatients || 0} color="primary" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="person-badge-fill" label="Total Doctors" value={s.totalDoctors || 0} color="success" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="calendar-check" label="Today's Appointments" value={s.todayAppointments || 0} color="info" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="currency-rupee" label="Total Revenue" value={`₹${(s.totalRevenue || 0).toLocaleString()}`} color="warning" /></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6"><StatCard icon="heart-pulse-fill" label="Total Nurses" value={s.totalNurses || 0} color="danger" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="building" label="Departments" value={s.totalDepartments || 0} color="secondary" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="hourglass-split" label="Pending Appointments" value={s.pendingAppointments || 0} color="warning" /></div>
        <div className="col-xl-3 col-md-6"><StatCard icon="check-circle" label="Completed" value={s.completedAppointments || 0} color="success" /></div>
      </div>
      <div className="content-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span><i className="bi bi-calendar-check me-2"></i>Recent Appointments</span>
        </div>
        <DataTable columns={columns} data={recentApts} emptyMessage="No appointments found" />
      </div>
    </div>
  );
}
