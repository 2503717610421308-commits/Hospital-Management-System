import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';

export default function NurseAppointments() {
  const [apts, setApts] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await getAppointments({limit:50}); setApts(r.data.data||[]); } catch(e){} setLoading(false); })(); }, []);
  const statusColors = { Pending:'warning', Confirmed:'primary', Completed:'success', Cancelled:'danger', 'In-Progress':'info' };
  const columns = [
    { header: 'Token', render: r => <span className="badge bg-info">{r.tokenNumber}</span> },
    { header: 'Patient', render: r => r.patientId?.name||'N/A' }, { header: 'Doctor', render: r => r.doctorId?.name||'N/A' },
    { header: 'Date', render: r => new Date(r.appointmentDate).toLocaleDateString() }, { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span> },
  ];
  return (<div><h4 className="fw-bold mb-4">Appointments</h4>{loading?<LoadingSpinner />:<DataTable columns={columns} data={apts} />}</div>);
}
