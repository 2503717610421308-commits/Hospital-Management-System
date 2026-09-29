import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPatients } from '../../services/patientService';
import { getDoctors } from '../../services/doctorService';
import { getDepartments } from '../../services/billingService';
import { checkAvailability, createAppointment } from '../../services/appointmentService';

export default function ScheduleAppointment() {
  const [patients, setPatients] = useState([]); const [doctors, setDoctors] = useState([]); const [departments, setDepartments] = useState([]);
  const [slots, setSlots] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [form, setForm] = useState({ patientId:'', departmentId:'', doctorId:'', date:'', time:'', reason:'' });
  const [filteredDocs, setFilteredDocs] = useState([]);

  useEffect(() => { (async () => {
    try { const [p,d,dept] = await Promise.all([getPatients(),getDoctors(),getDepartments()]); setPatients(p.data.data||[]); setDoctors(d.data.data||[]); setDepartments(dept.data.data||[]); } catch(e){}
    setLoading(false);
  })(); }, []);

  useEffect(() => { setFilteredDocs(form.departmentId ? doctors.filter(d=>d.departmentId?._id===form.departmentId) : doctors); }, [form.departmentId, doctors]);
  useEffect(() => { if(form.doctorId&&form.date) { (async () => { try { const r = await checkAvailability({doctorId:form.doctorId,date:form.date}); setSlots(r.data.data?.slots||[]); } catch(e){} })(); } }, [form.doctorId, form.date]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg({});
    if(!form.patientId||!form.doctorId||!form.date||!form.time) { setMsg({text:'Fill all required fields',type:'danger'}); return; }
    try {
      const r = await createAppointment({ patientId:form.patientId, doctorId:form.doctorId, departmentId:form.departmentId, appointmentDate:form.date, appointmentTime:form.time, reason:form.reason });
      setMsg({text:r.data.message,type:'success'}); setForm({patientId:'',departmentId:'',doctorId:'',date:'',time:'',reason:''});
    } catch(err) { setMsg({text:err.response?.data?.message||'Failed',type:'danger'}); }
  };

  if (loading) return <LoadingSpinner />;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h4 className="fw-bold mb-4">Schedule Appointment</h4>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      <div className="content-card p-4">
        <form onSubmit={handleSubmit}><div className="row g-3">
          <div className="col-md-6"><label className="form-label">Patient *</label><select className="form-select" value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} required><option value="">Select Patient</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Department</label><select className="form-select" value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value,doctorId:''})}><option value="">All</option>{departments.map(d=><option key={d._id} value={d._id}>{d.departmentName}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Doctor *</label><select className="form-select" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value,time:''})} required><option value="">Select Doctor</option>{filteredDocs.map(d=><option key={d._id} value={d._id}>{d.name} - {d.specialization}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Date *</label><input type="date" className="form-control" min={today} value={form.date} onChange={e=>setForm({...form,date:e.target.value,time:''})} required /></div>
          {form.doctorId && form.date && (<div className="col-12"><label className="form-label">Available Slots</label>
            {slots.length===0?<p className="text-muted">No slots available</p>:<div className="d-flex flex-wrap gap-2">{slots.map(s=><button type="button" key={s} className={`btn btn-sm ${form.time===s?'btn-primary':'btn-outline-primary'}`} onClick={()=>setForm({...form,time:s})}>{s}</button>)}</div>}
          </div>)}
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}></textarea></div>
          <div className="col-12"><button type="submit" className="btn btn-primary" disabled={!form.time}><i className="bi bi-calendar-plus me-2"></i>Schedule Appointment</button></div>
        </div></form>
      </div>
    </div>
  );
}
