import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDoctors } from '../../services/doctorService';
import { getDepartments } from '../../services/billingService';

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]); const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true); const [search, setSearch] = useState(''); const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { try { const [d, dept] = await Promise.all([getDoctors({ search, departmentId: deptFilter }), getDepartments()]); setDoctors(d.data.data || []); setDepartments(dept.data.data || []); } catch(e){} setLoading(false); };
  useEffect(() => { load(); }, [search, deptFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Find a Doctor</h4>
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div className="input-group" style={{maxWidth:400}}><input className="form-control" placeholder="Search by name or specialization..." value={search} onChange={e=>setSearch(e.target.value)} /><span className="input-group-text"><i className="bi bi-search"></i></span></div>
        <select className="form-select" style={{maxWidth:200}} value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}><option value="">All Departments</option>{departments.map(d=><option key={d._id} value={d._id}>{d.departmentName}</option>)}</select>
      </div>
      {doctors.length === 0 ? <div className="text-center py-5 text-muted">No doctors found</div> :
      <div className="row g-3">
        {doctors.map(doc => (
          <div key={doc._id} className="col-lg-4 col-md-6">
            <div className="content-card p-3 h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{width:50,height:50,fontSize:'1.25rem'}}><i className="bi bi-person-badge-fill"></i></div>
                <div><h6 className="mb-0 fw-semibold">{doc.name}</h6><small className="text-primary">{doc.specialization}</small></div>
              </div>
              <div className="mb-2"><i className="bi bi-building me-2 text-muted"></i><small>{doc.departmentId?.departmentName || 'General'}</small></div>
              <div className="mb-2"><i className="bi bi-briefcase me-2 text-muted"></i><small>{doc.experience} years experience</small></div>
              <div className="mb-3"><i className="bi bi-currency-rupee me-2 text-muted"></i><small>Consultation Fee: ₹{doc.consultationFee}</small></div>
              <div className="d-flex gap-2"><small className="text-muted">{doc.availability?.days?.join(', ') || 'Mon-Fri'}</small></div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
