import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';

export default function RecAppointments() {
  const [apts, setApts] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [filter, setFilter] = useState('');
  useEffect(() => { load(); }, [filter]);
  const load = async () => { setLoading(true); try { const r = await getAppointments({status:filter,limit:50}); setApts(r.data.data||[]); } catch(e){} setLoading(false); };
  const handleStatus = async (id, s) => { try { await updateAppointmentStatus(id,{status:s}); setMsg({text:`${s}`,type:'success'}); load(); } catch(e) { setMsg({text:'Failed',type:'danger'}); } };

  const statusColors = { Pending:'warning', Confirmed:'primary', Completed:'success', Cancelled:'danger', Rejected:'secondary', 'In-Progress':'info' };
  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.appointmentId}</span> },
    { header: 'Patient', render: r => r.patientId?.name||'N/A' }, { header: 'Doctor', render: r => r.doctorId?.name||'N/A' },
    { header: 'Date', render: r => new Date(r.appointmentDate).toLocaleDateString() }, { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Token', render: r => <span className="badge bg-info">{r.tokenNumber}</span> },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span> },
    { header: 'Actions', render: r => r.status==='Pending' ? (
      <div className="d-flex gap-1"><button className="btn btn-sm btn-success" onClick={e=>{e.stopPropagation();handleStatus(r._id,'Confirmed')}}><i className="bi bi-check"></i></button>
        <button className="btn btn-sm btn-danger" onClick={e=>{e.stopPropagation();handleStatus(r._id,'Rejected')}}><i className="bi bi-x"></i></button></div>
    ) : null }
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Appointments</h4>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      <select className="form-select mb-3" style={{maxWidth:200}} value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All</option>{Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}</select>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={apts} />}
    </div>
  );
}
