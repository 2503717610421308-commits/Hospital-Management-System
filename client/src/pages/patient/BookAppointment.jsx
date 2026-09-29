import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDoctors } from '../../services/doctorService';
import { getPatientByUserId } from '../../services/patientService';
import { getDepartments } from '../../services/billingService';
import { checkAvailability, createAppointment } from '../../services/appointmentService';

export default function BookAppointment() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]); const [doctors, setDoctors] = useState([]); const [slots, setSlots] = useState([]);
  const [patient, setPatient] = useState(null); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [form, setForm] = useState({ departmentId: '', doctorId: '', date: '', time: '', reason: '' });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const [d, p] = await Promise.all([getDepartments(), getPatientByUserId(user._id)]); setDepartments(d.data.data||[]); setPatient(p.data.data); } catch(e){} setLoading(false); };

  const loadDoctors = async (deptId) => { try { const r = await getDoctors({ departmentId: deptId }); setDoctors(r.data.data||[]); } catch(e){} };
  const loadSlots = async () => { if(!form.doctorId||!form.date) return; try { const r = await checkAvailability({ doctorId: form.doctorId, date: form.date }); setSlots(r.data.data?.slots||[]); } catch(e){} };
  useEffect(() => { if(form.departmentId) loadDoctors(form.departmentId); }, [form.departmentId]);
  useEffect(() => { if(form.doctorId && form.date) loadSlots(); }, [form.doctorId, form.date]);

  const handleBook = async () => {
    if(!patient) { setMsg({text:'Patient profile not found',type:'danger'}); return; }
    try {
      const r = await createAppointment({ patientId: patient._id, doctorId: form.doctorId, departmentId: form.departmentId, appointmentDate: form.date, appointmentTime: form.time, reason: form.reason });
      setMsg({ text: r.data.message, type: 'success' }); setStep(5);
    } catch(err) { setMsg({ text: err.response?.data?.message||'Failed to book', type: 'danger' }); }
  };

  const today = new Date().toISOString().split('T')[0];
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Book Appointment</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Steps indicator */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['Department','Doctor','Date & Time','Confirm','Done'].map((s,i) => (
          <div key={i} className={`badge ${step > i ? 'bg-success' : step === i+1 ? 'bg-primary' : 'bg-secondary'} py-2 px-3`}>{i+1}. {s}</div>
        ))}
      </div>

      <div className="content-card p-4">
        {step === 1 && (<div>
          <h6 className="fw-semibold mb-3">Select Department</h6>
          <div className="row g-3">{departments.map(d => (
            <div key={d._id} className="col-md-4 col-sm-6">
              <button className={`btn w-100 text-start p-3 ${form.departmentId===d._id?'btn-primary':'btn-outline-primary'}`}
                onClick={() => { setForm({...form, departmentId: d._id, doctorId:'', date:'', time:''}); setStep(2); }}>
                <i className="bi bi-building me-2"></i>{d.departmentName}
              </button>
            </div>
          ))}</div>
        </div>)}

        {step === 2 && (<div>
          <h6 className="fw-semibold mb-3">Select Doctor</h6>
          {doctors.length === 0 ? <p className="text-muted">No doctors in this department</p> :
            <div className="row g-3">{doctors.map(d => (
              <div key={d._id} className="col-md-6">
                <button className={`btn w-100 text-start p-3 ${form.doctorId===d._id?'btn-primary':'btn-outline-primary'}`}
                  onClick={() => { setForm({...form, doctorId: d._id}); setStep(3); }}>
                  <div className="fw-semibold">{d.name}</div>
                  <small>{d.specialization} • ₹{d.consultationFee}</small>
                </button>
              </div>
            ))}</div>}
          <button className="btn btn-secondary mt-3" onClick={()=>setStep(1)}>Back</button>
        </div>)}

        {step === 3 && (<div>
          <h6 className="fw-semibold mb-3">Select Date & Time</h6>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Date</label><input type="date" className="form-control" min={today} value={form.date} onChange={e=>setForm({...form,date:e.target.value,time:''})} /></div>
            {form.date && (<div className="col-12">
              <label className="form-label">Available Slots</label>
              {slots.length === 0 ? <p className="text-muted">No slots available for this date</p> :
                <div className="d-flex flex-wrap gap-2">{slots.map(s => (
                  <button key={s} className={`btn ${form.time===s?'btn-primary':'btn-outline-primary'}`} onClick={()=>setForm({...form,time:s})}>{s}</button>
                ))}</div>}
            </div>)}
            <div className="col-12"><label className="form-label">Reason for Visit</label><textarea className="form-control" rows={2} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Describe your symptoms..."></textarea></div>
          </div>
          <div className="mt-3 d-flex gap-2"><button className="btn btn-secondary" onClick={()=>setStep(2)}>Back</button>{form.time && <button className="btn btn-primary" onClick={()=>setStep(4)}>Continue</button>}</div>
        </div>)}

        {step === 4 && (<div>
          <h6 className="fw-semibold mb-3">Confirm Appointment</h6>
          <div className="row g-2 mb-3">
            <div className="col-md-6"><strong>Department:</strong> {departments.find(d=>d._id===form.departmentId)?.departmentName}</div>
            <div className="col-md-6"><strong>Doctor:</strong> {doctors.find(d=>d._id===form.doctorId)?.name}</div>
            <div className="col-md-6"><strong>Date:</strong> {new Date(form.date).toLocaleDateString()}</div>
            <div className="col-md-6"><strong>Time:</strong> {form.time}</div>
            {form.reason && <div className="col-12"><strong>Reason:</strong> {form.reason}</div>}
          </div>
          <div className="d-flex gap-2"><button className="btn btn-secondary" onClick={()=>setStep(3)}>Back</button><button className="btn btn-success" onClick={handleBook}><i className="bi bi-check-circle me-2"></i>Confirm Booking</button></div>
        </div>)}

        {step === 5 && (<div className="text-center py-4">
          <i className="bi bi-check-circle-fill text-success" style={{fontSize:'3rem'}}></i>
          <h5 className="mt-3 fw-semibold">Appointment Booked Successfully!</h5>
          <p className="text-muted">You will receive a confirmation notification.</p>
          <button className="btn btn-primary" onClick={()=>{setStep(1);setForm({departmentId:'',doctorId:'',date:'',time:'',reason:''});setMsg({})}}>Book Another</button>
        </div>)}
      </div>
    </div>
  );
}
