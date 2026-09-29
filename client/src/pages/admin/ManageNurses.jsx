import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getNurses, createNurse, deleteNurse } from '../../services/billingService';
import { getDepartments } from '../../services/billingService';

export default function ManageNurses() {
  const [nurses, setNurses] = useState([]); const [departments, setDepartments] = useState([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [msg, setMsg] = useState({ text: '', type: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shift: 'Morning', departmentId: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [n, d] = await Promise.all([getNurses(), getDepartments()]); setNurses(n.data.data || []); setDepartments(d.data.data || []); } catch(e){} setLoading(false); };

  const handleSubmit = async (e) => { e.preventDefault(); try { await createNurse(form); setMsg({ text: 'Nurse created', type: 'success' }); setShowModal(false); loadData(); } catch(err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'danger' }); } };
  const handleDelete = async (id) => { if (!window.confirm('Remove?')) return; try { await deleteNurse(id); loadData(); setMsg({ text: 'Removed', type: 'success' }); } catch(e) { setMsg({ text: 'Failed', type: 'danger' }); } };

  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.nurseId}</span> },
    { header: 'Name', accessor: 'name' }, { header: 'Shift', accessor: 'shift' },
    { header: 'Department', render: r => r.departmentId?.departmentName || '—' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Actions', render: r => <button className="btn btn-sm btn-outline-danger" onClick={e => { e.stopPropagation(); handleDelete(r._id); }}><i className="bi bi-trash"></i></button> }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Manage Nurses</h4><button className="btn btn-primary" onClick={() => setShowModal(true)}><i className="bi bi-person-plus me-2"></i>Add Nurse</button></div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={() => setMsg({})}></button></div>}
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={nurses} />}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5>Add Nurse</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
          <form onSubmit={handleSubmit}><div className="modal-body"><div className="row g-3">
            <div className="col-12"><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Shift</label><select className="form-select" value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
            <div className="col-12"><label className="form-label">Department</label><select className="form-select" value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}><option value="">Select</option>{departments.map(d=><option key={d._id} value={d._id}>{d.departmentName}</option>)}</select></div>
          </div></div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form></div></div></div>
      )}
    </div>
  );
}
