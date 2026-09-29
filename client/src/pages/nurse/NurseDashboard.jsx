import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';

export default function NurseDashboard() {
  const [stats, setStats] = useState({}); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try {
      const r = await getAppointments({ limit: 100 });
      const apts = r.data.data || [];
      const today = new Date(); today.setHours(0,0,0,0);
      const todayApts = apts.filter(a => new Date(a.appointmentDate) >= today && new Date(a.appointmentDate) < new Date(today.getTime()+86400000));
      setStats({ assignedPatients: new Set(apts.map(a=>a.patientId?._id)).size, todayTasks: todayApts.length, pendingCare: todayApts.filter(a=>a.status!=='Completed').length });
    } catch(e){} setLoading(false);
  })(); }, []);

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Nurse Dashboard</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard icon="people-fill" label="Assigned Patients" value={stats.assignedPatients||0} color="primary" /></div>
        <div className="col-md-4"><StatCard icon="list-check" label="Today's Tasks" value={stats.todayTasks||0} color="info" /></div>
        <div className="col-md-4"><StatCard icon="hourglass-split" label="Pending Care" value={stats.pendingCare||0} color="warning" /></div>
      </div>
    </div>
  );
}
