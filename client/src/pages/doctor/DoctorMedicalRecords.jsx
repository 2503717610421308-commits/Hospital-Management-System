import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMedicalRecords } from '../../services/billingService';

export default function DoctorMedicalRecords() {
  const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await getMedicalRecords(); setRecords(r.data.data||[]); } catch(e){} setLoading(false); })(); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Medical Records</h4>
      {records.length === 0 ? <div className="text-center py-5 text-muted">No records</div> :
        records.map(r => (
          <div key={r._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between mb-2"><div><span className="badge bg-light text-dark me-2">{r.recordId}</span><strong>{r.diagnosis}</strong></div><small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small></div>
            <p className="mb-1"><i className="bi bi-person me-1"></i>{r.patientId?.name} ({r.patientId?.patientId})</p>
            {r.symptoms?.length > 0 && <p className="mb-1"><strong>Symptoms:</strong> {r.symptoms.join(', ')}</p>}
            {r.treatment && <p className="mb-1"><strong>Treatment:</strong> {r.treatment}</p>}
            {r.notes && <p className="mb-0 text-muted"><strong>Notes:</strong> {r.notes}</p>}
          </div>
        ))}
    </div>
  );
}
