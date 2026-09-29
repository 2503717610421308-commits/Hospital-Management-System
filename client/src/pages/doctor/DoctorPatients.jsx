import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try {
      const r = await getAppointments({ limit: 100 });
      const apts = r.data.data || [];
      const patientMap = new Map();
      apts.forEach(a => { if (a.patientId && !patientMap.has(a.patientId._id)) patientMap.set(a.patientId._id, { ...a.patientId, lastVisit: a.appointmentDate, appointments: 1 });
        else if (a.patientId) { const p = patientMap.get(a.patientId._id); p.appointments++; }
      });
      setPatients(Array.from(patientMap.values()));
    } catch(e){} setLoading(false);
  })(); }, []);

  const columns = [
    { header: 'Patient ID', render: r => <span className="badge bg-light text-dark">{r.patientId}</span> },
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Visits', render: r => r.appointments },
    { header: 'Last Visit', render: r => new Date(r.lastVisit).toLocaleDateString() },
  ];

  return (
    <div><h4 className="fw-bold mb-4">My Patients</h4>{loading ? <LoadingSpinner /> : <DataTable columns={columns} data={patients} emptyMessage="No patients found" />}</div>
  );
}
