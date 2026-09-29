import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';
import { getDoctorByUserId } from '../../services/doctorService';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({}); const [todayApts, setTodayApts] = useState([]); const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const docRes = await getDoctorByUserId(user._id);
      const doctor = docRes.data.data;
      const aptsRes = await getAppointments({ limit: 50 });
      const apts = aptsRes.data.data || [];
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today.getTime() + 86400000);
      const todayList = apts.filter(a => { const d = new Date(a.appointmentDate); return d >= today && d < tomorrow; });
      setTodayApts(todayList);
      setStats({
        todayAppointments: todayList.length,
        pendingAppointments: apts.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length,
        completedConsultations: apts.filter(a => a.status === 'Completed').length,
        totalPatients: new Set(apts.map(a => a.patientId?._id)).size
      });
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-4"><h4 className="fw-bold mb-1">Doctor Dashboard</h4><p className="text-muted">Welcome, {user?.name}</p></div>
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3"><StatCard icon="calendar-check" label="Today's Appointments" value={stats.todayAppointments} color="primary" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="hourglass-split" label="Pending" value={stats.pendingAppointments} color="warning" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="check-circle" label="Completed" value={stats.completedConsultations} color="success" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="people-fill" label="Total Patients" value={stats.totalPatients} color="info" /></div>
      </div>
      <div className="content-card">
        <div className="card-header"><i className="bi bi-calendar-check me-2"></i>Today's Appointments</div>
        {todayApts.length === 0 ? <div className="text-center py-4 text-muted">No appointments today</div> :
          <div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Token</th><th>Patient</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead><tbody>
            {todayApts.map(a => <tr key={a._id}>
              <td><span className="badge bg-info">{a.tokenNumber}</span></td><td>{a.patientId?.name}</td><td>{a.appointmentTime}</td><td>{a.reason || '—'}</td>
              <td><span className={`badge bg-${a.status==='Completed'?'success':a.status==='Confirmed'?'primary':'warning'}`}>{a.status}</span></td>
            </tr>)}
          </tbody></table></div>}
      </div>
    </div>
  );
}
