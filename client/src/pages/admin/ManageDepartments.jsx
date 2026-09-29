import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/billingService';

export default function ManageDepartments() {
  const [depts, setDepts] = useState([]); const [loading, setLoading] = useState(true); const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); const [form, setForm] = useState({ departmentName: '', description: '', location: '' }); const [msg, setMsg] = useState({});

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getDepartments(); setDepts(r.data.data || []); } catch(e){} setLoading(false); };

  const openModal = (d = null) => { setEditing(d); setForm(d ? { departmentName: d.departmentName, description: d.description || '', location: d.location || '' } : { departmentName: '', description: '', location: '' }); setShowModal(true); };

  const handleSubmit = async (e) => { e.preventDefault(); try { if (editing) await updateDepartment(editing._id, form); else await createDepartment(form); setMsg({ text: editing ? 'Updated' : 'Created', type: 'success' }); setShowModal(false); load(); } catch(err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'danger' }); } };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await deleteDepartment(id); load(); } catch(e){} };

  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.departmentId}</span> },
    { header: 'Name', accessor: 'departmentName' }, { header: 'Description', render: r => r.description || '—' },
    { header: 'Location', render: r => r.location || '—' },
    { header: 'Actions', render: r => (<div className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={e=>{e.stopPropagation();openModal(r)}}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-outline-danger" onClick={e=>{e.stopPropagation();handleDelete(r._id)}}><i className="bi bi-trash"></i></button></div>) }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Manage Departments</h4><button className="btn btn-primary" onClick={() => openModal()}><i className="bi bi-plus-lg me-2"></i>Add Department</button></div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={depts} />}
      {showModal && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5>{editing ? 'Edit' : 'Add'} Department</h5><button className="btn-close" onClick={()=>setShowModal(false)}></button></div>
        <form onSubmit={handleSubmit}><div className="modal-body"><div className="row g-3">
          <div className="col-12"><label className="form-label">Name *</label><input className="form-control" value={form.departmentName} onChange={e=>setForm({...form,departmentName:e.target.value})} required /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea></div>
          <div className="col-12"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
        </div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing?'Update':'Create'}</button></div></form>
      </div></div></div>)}
    </div>
  );
}
