import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { loginUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    const result = await loginUser(form.email, form.password);
    if (result.success) {
      const routes = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', nurse: '/nurse/dashboard', receptionist: '/receptionist/dashboard', patient: '/patient/dashboard' };
      navigate(routes[result.role] || '/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <i className="bi bi-hospital auth-icon"></i>
          <h2 className="mt-2">Welcome Back</h2>
          <p className="text-muted">Sign in to Hospital Management System</p>
        </div>
        {error && <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className="form-control" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type="password" className="form-control" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>}
          </button>
        </form>
        <p className="text-center text-muted mb-0">Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
        <hr />
        <div className="text-center"><small className="text-muted">Demo: admin@hospital.com / Admin@123</small></div>
      </div>
    </div>
  );
}
