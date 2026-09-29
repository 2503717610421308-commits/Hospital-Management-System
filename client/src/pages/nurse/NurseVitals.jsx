import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMedicalRecords, updateMedicalRecord } from '../../services/billingService';

export default function NurseVitals() {
  const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); const [vitals, setVitals] = useState({}); const [msg, setMsg] = useState({});

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getMedicalRecords(); setRecords(r.data.data||[]); } catch(e){} setLoading(false); };

  const openEdit = (r) => { setEditing(r); setVitals(r.vitals || {}); };
  const handleSave = async () => {
    try { await updateMedicalRecord(editing._id, { vitals }); setMsg({text:'Vitals updated',type:'success'}); setEditing(null); load(); }
    catch(e) { setMsg({text:'Failed',type:'danger'}); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Patient Vitals</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {records.length === 0 ? <div className="text-center py-5 text-muted">No records</div> :
        records.map(r => (
          <div key={r._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <div><strong>{r.patientId?.name}</strong> <small className="text-muted ms-2">{r.recordId}</small></div>
              <button className="btn btn-sm btn-outline-primary" onClick={()=>openEdit(r)}><i className="bi bi-pencil me-1"></i>Update Vitals</button>
            </div>
            <div className="row g-2">{[['BP',r.vitals?.bloodPressure],['HR',r.vitals?.heartRate],['Temp',r.vitals?.temperature],['Weight',r.vitals?.weight],['SpO2',r.vitals?.oxygenSaturation]].map(([l,v],i)=>
              <div key={i} className="col-auto"><span className="badge bg-light text-dark">{l}: {v||'—'}</span></div>
            )}</div>
          </div>
        ))}
      {editing && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5>Update Vitals - {editing.patientId?.name}</h5><button className="btn-close" onClick={()=>setEditing(null)}></button></div>
        <div className="modal-body"><div className="row g-3">
          <div className="col-md-6"><label className="form-label">Blood Pressure</label><input className="form-control" value={vitals.bloodPressure||''} onChange={e=>setVitals({...vitals,bloodPressure:e.target.value})} /></div>
          <div className="col-md-6"><label className="form-label">Heart Rate</label><input className="form-control" value={vitals.heartRate||''} onChange={e=>setVitals({...vitals,heartRate:e.target.value})} /></div>
          <div className="col-md-6"><label className="form-label">Temperature</label><input className="form-control" value={vitals.temperature||''} onChange={e=>setVitals({...vitals,temperature:e.target.value})} /></div>
          <div className="col-md-6"><label className="form-label">Weight</label><input className="form-control" value={vitals.weight||''} onChange={e=>setVitals({...vitals,weight:e.target.value})} /></div>
          <div className="col-md-6"><label className="form-label">SpO2</label><input className="form-control" value={vitals.oxygenSaturation||''} onChange={e=>setVitals({...vitals,oxygenSaturation:e.target.value})} /></div>
        </div></div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Vitals</button></div>
      </div></div></div>)}
    </div>
  );
}
