import { useState } from 'react';
import { createPatient } from '../../services/patientService';

export default function RegisterPatient() {
  const [form, setForm] = useState({ name:'',email:'',password:'',phone:'',dateOfBirth:'',gender:'Male',address:'',bloodGroup:'' });
  const [msg, setMsg] = useState({});
  const update = (k) => (e) => setForm({...form,[k]:e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg({});
    try { await createPatient(form); setMsg({text:'Patient registered successfully',type:'success'}); setForm({name:'',email:'',password:'',phone:'',dateOfBirth:'',gender:'Male',address:'',bloodGroup:''}); }
    catch(err) { setMsg({text:err.response?.data?.message||'Failed',type:'danger'}); }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Register New Patient</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="content-card p-4">
        <form onSubmit={handleSubmit}><div className="row g-3">
          <div className="col-md-6"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={update('name')} required /></div>
          <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={update('email')} required /></div>
          <div className="col-md-6"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={update('password')} required minLength={6} /></div>
          <div className="col-md-6"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={update('phone')} required /></div>
          <div className="col-md-6"><label className="form-label">Date of Birth *</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={update('dateOfBirth')} required /></div>
          <div className="col-md-6"><label className="form-label">Gender *</label><select className="form-select" value={form.gender} onChange={update('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div className="col-md-6"><label className="form-label">Blood Group</label><select className="form-select" value={form.bloodGroup} onChange={update('bloodGroup')}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={update('address')} /></div>
          <div className="col-12"><button type="submit" className="btn btn-primary"><i className="bi bi-person-plus me-2"></i>Register Patient</button></div>
        </div></form>
      </div>
    </div>
  );
}
