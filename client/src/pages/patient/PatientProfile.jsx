import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPatientByUserId, updatePatient } from '../../services/patientService';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); const [form, setForm] = useState({}); const [msg, setMsg] = useState({});

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getPatientByUserId(user._id); setProfile(r.data.data); setForm(r.data.data); } catch(e){} setLoading(false); };

  const handleSave = async () => {
    try { await updatePatient(profile._id, { name: form.name, phone: form.phone, address: form.address, bloodGroup: form.bloodGroup }); setMsg({ text: 'Profile updated', type: 'success' }); setEditing(false); load(); }
    catch(e) { setMsg({ text: 'Failed to update', type: 'danger' }); }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center py-5 text-muted">Profile not found</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">My Profile</h4>
        <button className="btn btn-primary" onClick={() => editing ? handleSave() : setEditing(true)}><i className={`bi bi-${editing?'check':'pencil'} me-2`}></i>{editing ? 'Save' : 'Edit'}</button>
      </div>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="content-card p-4">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label text-muted">Patient ID</label><p className="fw-semibold">{profile.patientId}</p></div>
          <div className="col-md-6"><label className="form-label text-muted">Name</label>{editing ? <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /> : <p className="fw-semibold">{profile.name}</p>}</div>
          <div className="col-md-6"><label className="form-label text-muted">Email</label><p>{profile.email}</p></div>
          <div className="col-md-6"><label className="form-label text-muted">Phone</label>{editing ? <input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /> : <p>{profile.phone}</p>}</div>
          <div className="col-md-6"><label className="form-label text-muted">Date of Birth</label><p>{new Date(profile.dateOfBirth).toLocaleDateString()}</p></div>
          <div className="col-md-6"><label className="form-label text-muted">Gender</label><p>{profile.gender}</p></div>
          <div className="col-md-6"><label className="form-label text-muted">Blood Group</label>{editing ? <select className="form-select" value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select> : <p>{profile.bloodGroup || '—'}</p>}</div>
          <div className="col-md-6"><label className="form-label text-muted">Address</label>{editing ? <input className="form-control" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} /> : <p>{profile.address || '—'}</p>}</div>
        </div>
      </div>
    </div>
  );
}
