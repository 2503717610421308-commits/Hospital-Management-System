import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';
import { getBills, getPrescriptions, getMedicalRecords } from '../../services/billingService';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcoming: 0, past: 0, records: 0, prescriptions: 0, pendingBills: 0 });
  const [upcomingApts, setUpcomingApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [aptsRes, billsRes, rxRes, mrRes] = await Promise.all([getAppointments(), getBills(), getPrescriptions(), getMedicalRecords()]);
      const apts = aptsRes.data.data || [];
      const now = new Date();
      const upcoming = apts.filter(a => new Date(a.appointmentDate) >= now && a.status !== 'Cancelled');
      setUpcomingApts(upcoming.slice(0, 5));
      const bills = billsRes.data.data || [];
      setStats({ upcoming: upcoming.length, past: apts.filter(a => a.status === 'Completed').length, records: (mrRes.data.data||[]).length, prescriptions: (rxRes.data.data||[]).length, pendingBills: bills.filter(b => b.paymentStatus === 'Pending').length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-4"><h4 className="fw-bold mb-1">Welcome, {user?.name}!</h4><p className="text-muted">Your health dashboard</p></div>
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl"><StatCard icon="calendar-check" label="Upcoming Appointments" value={stats.upcoming} color="primary" /></div>
        <div className="col-md-6 col-xl"><StatCard icon="clock-history" label="Past Appointments" value={stats.past} color="success" /></div>
        <div className="col-md-6 col-xl"><StatCard icon="file-earmark-medical" label="Medical Records" value={stats.records} color="info" /></div>
        <div className="col-md-6 col-xl"><StatCard icon="prescription2" label="Prescriptions" value={stats.prescriptions} color="warning" /></div>
        <div className="col-md-6 col-xl"><StatCard icon="receipt" label="Pending Bills" value={stats.pendingBills} color="danger" /></div>
      </div>
      <div className="content-card">
        <div className="card-header"><i className="bi bi-calendar-check me-2"></i>Upcoming Appointments</div>
        {upcomingApts.length === 0 ? <div className="text-center py-4 text-muted">No upcoming appointments</div> :
          <div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Status</th></tr></thead><tbody>
            {upcomingApts.map(a => <tr key={a._id}><td>{new Date(a.appointmentDate).toLocaleDateString()}</td><td>{a.appointmentTime}</td><td>{a.doctorId?.name}</td>
              <td><span className={`badge bg-${a.status==='Confirmed'?'primary':a.status==='Pending'?'warning':'secondary'}`}>{a.status}</span></td></tr>)}
          </tbody></table></div>}
      </div>
    </div>
  );
}
