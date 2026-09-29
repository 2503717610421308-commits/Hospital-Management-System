import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../services/doctorService';
import { getDepartments } from '../../services/billingService';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '', departmentId: '', experience: 0, consultationFee: 500 });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([getDoctors({ search }), getDepartments()]);
      setDoctors(docRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) { setMsg({ text: 'Failed to load', type: 'danger' }); }
    setLoading(false);
  };

  const openModal = (doc = null) => {
    if (doc) { setEditing(doc); setForm({ name: doc.name, email: doc.email, password: '', phone: doc.phone, specialization: doc.specialization, departmentId: doc.departmentId?._id || '', experience: doc.experience, consultationFee: doc.consultationFee }); }
    else { setEditing(null); setForm({ name: '', email: '', password: '', phone: '', specialization: '', departmentId: '', experience: 0, consultationFee: 500 }); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateDoctor(editing._id, form); setMsg({ text: 'Doctor updated', type: 'success' }); }
      else { await createDoctor(form); setMsg({ text: 'Doctor created', type: 'success' }); }
      setShowModal(false); loadData();
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'danger' }); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Remove this doctor?')) return; try { await deleteDoctor(id); loadData(); setMsg({ text: 'Doctor removed', type: 'success' }); } catch (err) { setMsg({ text: 'Failed', type: 'danger' }); } };

  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.doctorId}</span> },
    { header: 'Name', accessor: 'name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Department', render: r => r.departmentId?.departmentName || '—' },
    { header: 'Fee', render: r => `₹${r.consultationFee}` },
    { header: 'Experience', render: r => `${r.experience} yrs` },
    { header: 'Actions', render: r => (
      <div className="d-flex gap-1">
        <button className="btn btn-sm btn-outline-primary" onClick={e => { e.stopPropagation(); openModal(r); }}><i className="bi bi-pencil"></i></button>
        <button className="btn btn-sm btn-outline-danger" onClick={e => { e.stopPropagation(); handleDelete(r._id); }}><i className="bi bi-trash"></i></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Manage Doctors</h4>
        <button className="btn btn-primary" onClick={() => openModal()}><i className="bi bi-person-plus me-2"></i>Add Doctor</button>
      </div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={() => setMsg({})}></button></div>}
      <form onSubmit={e => { e.preventDefault(); loadData(); }} className="mb-3">
        <div className="input-group" style={{ maxWidth: 400 }}>
          <input className="form-control" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-outline-primary"><i className="bi bi-search"></i></button>
        </div>
      </form>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={doctors} />}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}><div className="modal-dialog modal-lg"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit Doctor' : 'Add Doctor'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
          <form onSubmit={handleSubmit}><div className="modal-body"><div className="row g-3">
            <div className="col-md-6"><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editing} /></div>
            {!editing && <div className="col-md-6"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>}
            <div className="col-md-6"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Specialization *</label><input className="form-control" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Department</label><select className="form-select" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}><option value="">Select</option>{departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Experience (years)</label><input type="number" className="form-control" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} min={0} /></div>
            <div className="col-md-6"><label className="form-label">Consultation Fee (₹)</label><input type="number" className="form-control" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} min={0} /></div>
          </div></div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button></div>
          </form>
        </div></div></div>
      )}
    </div>
  );
}
