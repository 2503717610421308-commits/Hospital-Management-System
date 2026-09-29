import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';

export default function ManageAppointments() {
  const [apts, setApts] = useState([]); const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); const [dateFilter, setDateFilter] = useState('');
  const [msg, setMsg] = useState({});

  useEffect(() => { load(); }, [statusFilter, dateFilter]);
  const load = async () => { setLoading(true); try { const r = await getAppointments({ status: statusFilter, date: dateFilter, limit: 50 }); setApts(r.data.data || []); } catch(e){} setLoading(false); };

  const handleStatusChange = async (id, status) => {
    try { await updateAppointmentStatus(id, { status }); setMsg({ text: `Appointment ${status}`, type: 'success' }); load(); }
    catch(e) { setMsg({ text: 'Failed to update', type: 'danger' }); }
  };

  const statusColors = { Pending: 'warning', Confirmed: 'primary', Completed: 'success', Cancelled: 'danger', Rejected: 'secondary', 'In-Progress': 'info' };

  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.appointmentId}</span> },
    { header: 'Patient', render: r => r.patientId?.name || 'N/A' },
    { header: 'Doctor', render: r => r.doctorId?.name || 'N/A' },
    { header: 'Date', render: r => new Date(r.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Token', render: r => <span className="badge bg-info">{r.tokenNumber}</span> },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span> },
    { header: 'Actions', render: r => (
      <div className="dropdown"><button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Update</button>
        <ul className="dropdown-menu">
          {['Confirmed','In-Progress','Completed','Cancelled','Rejected'].filter(s=>s!==r.status).map(s=>
            <li key={s}><button className="dropdown-item" onClick={()=>handleStatusChange(r._id,s)}>{s}</button></li>
          )}
        </ul>
      </div>
    )}
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Manage Appointments</h4>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <select className="form-select" style={{maxWidth:200}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>{Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}
        </select>
        <input type="date" className="form-control" style={{maxWidth:200}} value={dateFilter} onChange={e=>setDateFilter(e.target.value)} />
        <button className="btn btn-outline-secondary" onClick={()=>{setStatusFilter('');setDateFilter('')}}>Clear</button>
      </div>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={apts} />}
    </div>
  );
}
