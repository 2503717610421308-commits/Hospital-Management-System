import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';
import { getPatients } from '../../services/patientService';
import { getDoctors } from '../../services/doctorService';

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({}); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try {
      const [a, p, d] = await Promise.all([getAppointments({ limit: 100 }), getPatients(), getDoctors()]);
      const apts = a.data.data||[]; const today = new Date(); today.setHours(0,0,0,0);
      const todayApts = apts.filter(a => { const ad = new Date(a.appointmentDate); return ad >= today && ad < new Date(today.getTime()+86400000); });
      setStats({ todayAppointments: todayApts.length, registeredPatients: (p.data.data||[]).length, pendingAppointments: apts.filter(a=>a.status==='Pending').length, availableDoctors: (d.data.data||[]).length });
    } catch(e){} setLoading(false);
  })(); }, []);

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Receptionist Dashboard</h4>
      <div className="row g-3">
        <div className="col-md-6 col-xl-3"><StatCard icon="calendar-check" label="Today's Appointments" value={stats.todayAppointments||0} color="primary" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="people-fill" label="Registered Patients" value={stats.registeredPatients||0} color="success" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="hourglass-split" label="Pending Appointments" value={stats.pendingAppointments||0} color="warning" /></div>
        <div className="col-md-6 col-xl-3"><StatCard icon="person-badge-fill" label="Available Doctors" value={stats.availableDoctors||0} color="info" /></div>
      </div>
    </div>
  );
}
