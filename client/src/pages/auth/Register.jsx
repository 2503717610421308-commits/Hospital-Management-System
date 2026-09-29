import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', dateOfBirth: '', gender: 'Male', address: '', bloodGroup: '' });
  const [error, setError] = useState('');
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.password || !form.phone || !form.dateOfBirth || !form.gender) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    const result = await registerUser({ ...form, role: 'patient' });
    if (result.success) navigate('/patient/dashboard');
    else setError(result.message);
  };

  return (
    <div className="auth-container" style={{ padding: '2rem 0' }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="text-center mb-4">
          <i className="bi bi-hospital auth-icon"></i>
          <h2 className="mt-2">Patient Registration</h2>
          <p className="text-muted">Create your account</p>
        </div>
        {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={form.name} onChange={update('name')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email <span className="text-danger">*</span></label>
              <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone <span className="text-danger">*</span></label>
              <input type="tel" className="form-control" value={form.phone} onChange={update('phone')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={form.dateOfBirth} onChange={update('dateOfBirth')} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender <span className="text-danger">*</span></label>
              <select className="form-select" value={form.gender} onChange={update('gender')}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={form.bloodGroup} onChange={update('bloodGroup')}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" value={form.address} onChange={update('address')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password <span className="text-danger">*</span></label>
              <input type="password" className="form-control" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
              <input type="password" className="form-control" value={form.confirmPassword} onChange={update('confirmPassword')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 mt-4" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</> : <><i className="bi bi-person-plus me-2"></i>Register</>}
          </button>
        </form>
        <p className="text-center text-muted mt-3 mb-0">Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
      </div>
    </div>
  );
}
