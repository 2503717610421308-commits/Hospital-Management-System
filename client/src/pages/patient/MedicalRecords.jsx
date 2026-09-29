import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMedicalRecords } from '../../services/billingService';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await getMedicalRecords(); setRecords(r.data.data||[]); } catch(e){} setLoading(false); })(); }, []);
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Medical Records</h4>
      {records.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-file-earmark-medical fs-1 d-block mb-2"></i>No medical records found</div> :
        records.map(r => (
          <div key={r._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div><span className="badge bg-light text-dark me-2">{r.recordId}</span><strong>{r.diagnosis}</strong></div>
              <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
            <p className="text-muted mb-1"><i className="bi bi-person-badge me-1"></i>Dr. {r.doctorId?.name} ({r.doctorId?.specialization})</p>
            {r.symptoms?.length > 0 && <div className="mb-1"><strong>Symptoms:</strong> {r.symptoms.join(', ')}</div>}
            {r.treatment && <div className="mb-1"><strong>Treatment:</strong> {r.treatment}</div>}
            {r.notes && <div className="mb-1"><strong>Notes:</strong> {r.notes}</div>}
            {r.vitals && Object.values(r.vitals).some(v=>v) && (
              <div className="mt-2 p-2 bg-light rounded">
                <strong>Vitals:</strong> <span className="ms-2">BP: {r.vitals.bloodPressure||'—'} | HR: {r.vitals.heartRate||'—'} | Temp: {r.vitals.temperature||'—'} | SpO2: {r.vitals.oxygenSaturation||'—'}</span>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
