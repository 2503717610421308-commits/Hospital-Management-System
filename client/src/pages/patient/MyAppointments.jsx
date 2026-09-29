import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments, deleteAppointment } from '../../services/appointmentService';

export default function MyAppointments() {
  const [apts, setApts] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getAppointments(); setApts(r.data.data||[]); } catch(e){} setLoading(false); };
  const handleCancel = async (id) => { if(!window.confirm('Cancel this appointment?')) return; try { await deleteAppointment(id); setMsg({text:'Appointment cancelled',type:'success'}); load(); } catch(e) { setMsg({text:'Failed',type:'danger'}); } };

  const statusColors = { Pending:'warning', Confirmed:'primary', Completed:'success', Cancelled:'danger', Rejected:'secondary', 'In-Progress':'info' };
  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.appointmentId}</span> },
    { header: 'Doctor', render: r => r.doctorId?.name || 'N/A' },
    { header: 'Department', render: r => r.departmentId?.departmentName || '—' },
    { header: 'Date', render: r => new Date(r.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Token', render: r => <span className="badge bg-info">{r.tokenNumber}</span> },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span> },
    { header: '', render: r => r.status !== 'Completed' && r.status !== 'Cancelled' ? <button className="btn btn-sm btn-outline-danger" onClick={e=>{e.stopPropagation();handleCancel(r._id)}}>Cancel</button> : null }
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">My Appointments</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={apts} emptyMessage="No appointments found" />}
    </div>
  );
}
