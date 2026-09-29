import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { createMedicalRecord, createPrescription, createTreatment, createBill, getMedicines } from '../../services/billingService';
import { getDoctorByUserId } from '../../services/doctorService';
import { useAuth } from '../../hooks/useAuth';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [apts, setApts] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [showConsult, setShowConsult] = useState(null); const [doctor, setDoctor] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [consultForm, setConsultForm] = useState({ diagnosis: '', symptoms: '', treatment: '', notes: '', bp: '', hr: '', temp: '', weight: '',
    medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1 }], instructions: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [a, d, m] = await Promise.all([getAppointments({ limit: 50 }), getDoctorByUserId(user._id), getMedicines()]);
      setApts(a.data.data || []); setDoctor(d.data.data); setMedicines(m.data.data || []);
    } catch(e){} setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try { await updateAppointmentStatus(id, { status }); setMsg({ text: `Appointment ${status}`, type: 'success' }); load(); }
    catch(e) { setMsg({ text: 'Failed', type: 'danger' }); }
  };

  const openConsult = (apt) => {
    setShowConsult(apt);
    setConsultForm({ diagnosis: '', symptoms: '', treatment: '', notes: '', bp: '', hr: '', temp: '', weight: '',
      medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1 }], instructions: '' });
  };

  const addMedRow = () => setConsultForm({ ...consultForm, medicines: [...consultForm.medicines, { medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1 }] });
  const updateMed = (idx, key, val) => { const m = [...consultForm.medicines]; m[idx][key] = val; setConsultForm({ ...consultForm, medicines: m }); };
  const removeMed = (idx) => setConsultForm({ ...consultForm, medicines: consultForm.medicines.filter((_, i) => i !== idx) });

  const handleConsultSubmit = async () => {
    if (!consultForm.diagnosis) { setMsg({ text: 'Diagnosis is required', type: 'danger' }); return; }
    try {
      // Create medical record
      await createMedicalRecord({
        patientId: showConsult.patientId._id, doctorId: doctor._id, appointmentId: showConsult._id,
        diagnosis: consultForm.diagnosis, symptoms: consultForm.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        treatment: consultForm.treatment, notes: consultForm.notes,
        vitals: { bloodPressure: consultForm.bp, heartRate: consultForm.hr, temperature: consultForm.temp, weight: consultForm.weight }
      });
      // Create prescription if medicines provided
      const validMeds = consultForm.medicines.filter(m => m.medicineName);
      if (validMeds.length > 0) {
        await createPrescription({ patientId: showConsult.patientId._id, doctorId: doctor._id, appointmentId: showConsult._id, medicines: validMeds, instructions: consultForm.instructions });
      }
      // Create treatment
      await createTreatment({ patientId: showConsult.patientId._id, doctorId: doctor._id, appointmentId: showConsult._id, diagnosis: consultForm.diagnosis, description: consultForm.treatment, cost: doctor.consultationFee });
      // Create bill
      const billItems = [{ description: `Consultation - ${doctor.name}`, category: 'Consultation', amount: doctor.consultationFee }];
      validMeds.forEach(m => billItems.push({ description: m.medicineName, category: 'Medicine', amount: (m.quantity || 1) * 10 }));
      await createBill({ patientId: showConsult.patientId._id, appointmentId: showConsult._id, items: billItems });
      // Mark completed
      await updateAppointmentStatus(showConsult._id, { status: 'Completed' });

      setMsg({ text: 'Consultation completed, records created', type: 'success' });
      setShowConsult(null); load();
    } catch(e) { setMsg({ text: e.response?.data?.message || 'Error completing consultation', type: 'danger' }); }
  };

  const statusColors = { Pending:'warning', Confirmed:'primary', Completed:'success', Cancelled:'danger', 'In-Progress':'info' };
  const columns = [
    { header: 'Token', render: r => <span className="badge bg-info">{r.tokenNumber}</span> },
    { header: 'Patient', render: r => r.patientId?.name || 'N/A' },
    { header: 'Date', render: r => new Date(r.appointmentDate).toLocaleDateString() },
    { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Reason', render: r => r.reason || '—' },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span> },
    { header: 'Actions', render: r => (
      <div className="d-flex gap-1 flex-wrap">
        {(r.status === 'Confirmed' || r.status === 'Pending') && <button className="btn btn-sm btn-success" onClick={e=>{e.stopPropagation();openConsult(r)}}><i className="bi bi-clipboard2-pulse me-1"></i>Consult</button>}
        {r.status === 'Confirmed' && <button className="btn btn-sm btn-outline-danger" onClick={e=>{e.stopPropagation();handleStatusChange(r._id,'Cancelled')}}>Cancel</button>}
      </div>
    )}
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Appointments</h4>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={apts} />}

      {/* Consultation Modal */}
      {showConsult && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)',overflow:'auto'}}><div className="modal-dialog modal-xl"><div className="modal-content">
        <div className="modal-header bg-success bg-opacity-10">
          <h5 className="modal-title"><i className="bi bi-clipboard2-pulse me-2"></i>Patient Consultation</h5>
          <button className="btn-close" onClick={()=>setShowConsult(null)}></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-info py-2 mb-3"><strong>Patient:</strong> {showConsult.patientId?.name} | <strong>Reason:</strong> {showConsult.reason || 'N/A'}</div>
          <div className="row g-3">
            <div className="col-12"><h6 className="fw-semibold">Vitals</h6></div>
            <div className="col-md-3"><label className="form-label">Blood Pressure</label><input className="form-control" placeholder="120/80" value={consultForm.bp} onChange={e=>setConsultForm({...consultForm,bp:e.target.value})} /></div>
            <div className="col-md-3"><label className="form-label">Heart Rate</label><input className="form-control" placeholder="72 bpm" value={consultForm.hr} onChange={e=>setConsultForm({...consultForm,hr:e.target.value})} /></div>
            <div className="col-md-3"><label className="form-label">Temperature</label><input className="form-control" placeholder="98.6°F" value={consultForm.temp} onChange={e=>setConsultForm({...consultForm,temp:e.target.value})} /></div>
            <div className="col-md-3"><label className="form-label">Weight</label><input className="form-control" placeholder="70 kg" value={consultForm.weight} onChange={e=>setConsultForm({...consultForm,weight:e.target.value})} /></div>

            <div className="col-12"><hr/><h6 className="fw-semibold">Diagnosis & Treatment</h6></div>
            <div className="col-md-6"><label className="form-label">Symptoms (comma separated)</label><input className="form-control" value={consultForm.symptoms} onChange={e=>setConsultForm({...consultForm,symptoms:e.target.value})} /></div>
            <div className="col-md-6"><label className="form-label">Diagnosis *</label><input className="form-control" value={consultForm.diagnosis} onChange={e=>setConsultForm({...consultForm,diagnosis:e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Treatment Plan</label><textarea className="form-control" rows={2} value={consultForm.treatment} onChange={e=>setConsultForm({...consultForm,treatment:e.target.value})}></textarea></div>
            <div className="col-md-6"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={consultForm.notes} onChange={e=>setConsultForm({...consultForm,notes:e.target.value})}></textarea></div>

            <div className="col-12"><hr/><div className="d-flex justify-content-between align-items-center"><h6 className="fw-semibold mb-0">Prescription</h6><button type="button" className="btn btn-sm btn-outline-primary" onClick={addMedRow}><i className="bi bi-plus"></i> Add Medicine</button></div></div>
            {consultForm.medicines.map((m, idx) => (
              <div key={idx} className="col-12"><div className="row g-2 align-items-end">
                <div className="col-md-3"><label className="form-label small">Medicine</label><input className="form-control form-control-sm" list={`meds-${idx}`} value={m.medicineName} onChange={e=>updateMed(idx,'medicineName',e.target.value)} />
                  <datalist id={`meds-${idx}`}>{medicines.map(med=><option key={med._id} value={med.medicineName} />)}</datalist></div>
                <div className="col-md-2"><label className="form-label small">Dosage</label><input className="form-control form-control-sm" placeholder="500mg" value={m.dosage} onChange={e=>updateMed(idx,'dosage',e.target.value)} /></div>
                <div className="col-md-2"><label className="form-label small">Frequency</label><input className="form-control form-control-sm" placeholder="Twice daily" value={m.frequency} onChange={e=>updateMed(idx,'frequency',e.target.value)} /></div>
                <div className="col-md-2"><label className="form-label small">Duration</label><input className="form-control form-control-sm" placeholder="7 days" value={m.duration} onChange={e=>updateMed(idx,'duration',e.target.value)} /></div>
                <div className="col-md-1"><label className="form-label small">Qty</label><input type="number" className="form-control form-control-sm" value={m.quantity} onChange={e=>updateMed(idx,'quantity',e.target.value)} min={1} /></div>
                <div className="col-md-1"><button className="btn btn-sm btn-outline-danger" onClick={()=>removeMed(idx)}><i className="bi bi-x"></i></button></div>
              </div></div>
            ))}
            <div className="col-12"><label className="form-label">Prescription Instructions</label><textarea className="form-control" rows={2} value={consultForm.instructions} onChange={e=>setConsultForm({...consultForm,instructions:e.target.value})}></textarea></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setShowConsult(null)}>Cancel</button>
          <button className="btn btn-success" onClick={handleConsultSubmit}><i className="bi bi-check-circle me-2"></i>Complete Consultation</button>
        </div>
      </div></div></div>)}
    </div>
  );
}
