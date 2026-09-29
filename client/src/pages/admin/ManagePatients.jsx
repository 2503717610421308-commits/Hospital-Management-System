import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patientService';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'Male', address: '', bloodGroup: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoading(true);
    try { const res = await getPatients({ search }); setPatients(res.data.data || []); } catch (err) { setMsg({ text: 'Failed to load patients', type: 'danger' }); }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); loadPatients(); };

  const openModal = (patient = null) => {
    if (patient) {
      setEditing(patient);
      setForm({ name: patient.name, email: patient.email, password: '', phone: patient.phone, dateOfBirth: patient.dateOfBirth?.split('T')[0] || '', gender: patient.gender, address: patient.address || '', bloodGroup: patient.bloodGroup || '' });
    } else {
      setEditing(null);
      setForm({ name: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'Male', address: '', bloodGroup: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updatePatient(editing._id, form); setMsg({ text: 'Patient updated', type: 'success' }); }
      else { await createPatient(form); setMsg({ text: 'Patient registered', type: 'success' }); }
      setShowModal(false); loadPatients();
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'danger' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await deletePatient(id); setMsg({ text: 'Patient removed', type: 'success' }); loadPatients(); }
    catch (err) { setMsg({ text: 'Failed to delete', type: 'danger' }); }
  };

  const columns = [
    { header: 'Patient ID', render: (r) => <span className="badge bg-light text-dark">{r.patientId}</span> },
    { header: 'Name', accessor: 'name' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Group', render: (r) => r.bloodGroup || '—' },
    { header: 'Actions', render: (r) => (
      <div className="d-flex gap-1">
        <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); openModal(r); }}><i className="bi bi-pencil"></i></button>
        <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}><i className="bi bi-trash"></i></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Manage Patients</h4>
        <button className="btn btn-primary" onClick={() => openModal()}><i className="bi bi-person-plus me-2"></i>Add Patient</button>
      </div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={() => setMsg({ text: '', type: '' })}></button></div>}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group" style={{ maxWidth: 400 }}>
          <input className="form-control" placeholder="Search by name, ID, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-outline-primary"><i className="bi bi-search"></i></button>
        </div>
      </form>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={patients} />}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit Patient' : 'Register Patient'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editing} /></div>
                  {!editing && <div className="col-md-6"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>}
                  <div className="col-md-6"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
                  <div className="col-md-6"><label className="form-label">Date of Birth *</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} required /></div>
                  <div className="col-md-6"><label className="form-label">Gender *</label><select className="form-select" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div className="col-md-6"><label className="form-label">Blood Group</label><select className="form-select" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select></div>
                  <div className="col-12"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Register'}</button></div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  );
}
