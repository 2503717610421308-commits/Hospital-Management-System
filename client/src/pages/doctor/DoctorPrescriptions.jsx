import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPrescriptions } from '../../services/billingService';

export default function DoctorPrescriptions() {
  const [rxs, setRxs] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await getPrescriptions(); setRxs(r.data.data||[]); } catch(e){} setLoading(false); })(); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Prescriptions</h4>
      {rxs.length === 0 ? <div className="text-center py-5 text-muted">No prescriptions</div> :
        rxs.map(rx => (
          <div key={rx._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between mb-2"><div><span className="badge bg-light text-dark me-2">{rx.prescriptionId}</span><span>{rx.patientId?.name}</span></div>
              <div><small className="text-muted">{new Date(rx.createdAt).toLocaleDateString()}</small>
                {rx.refillStatus !== 'None' && <span className={`badge ms-2 bg-${rx.refillStatus==='Requested'?'warning':'success'}`}>{rx.refillStatus}</span>}</div></div>
            <div className="table-responsive"><table className="table table-sm mb-0"><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>
              {rx.medicines?.map((m,i)=><tr key={i}><td>{m.medicineName}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.duration}</td></tr>)}
            </tbody></table></div>
          </div>
        ))}
    </div>
  );
}
