import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPrescriptions, requestRefill } from '../../services/billingService';

export default function Prescriptions() {
  const [rxs, setRxs] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getPrescriptions(); setRxs(r.data.data||[]); } catch(e){} setLoading(false); };
  const handleRefill = async (id) => { try { await requestRefill(id); setMsg({text:'Refill requested',type:'success'}); load(); } catch(e) { setMsg({text:'Failed',type:'danger'}); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h4 className="fw-bold mb-4">Prescriptions</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {rxs.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-prescription2 fs-1 d-block mb-2"></i>No prescriptions</div> :
        rxs.map(rx => (
          <div key={rx._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <div><span className="badge bg-light text-dark me-2">{rx.prescriptionId}</span><small className="text-muted">Dr. {rx.doctorId?.name}</small></div>
              <div><small className="text-muted">{new Date(rx.createdAt).toLocaleDateString()}</small>
                {rx.refillStatus !== 'None' && <span className={`badge ms-2 bg-${rx.refillStatus==='Approved'?'success':rx.refillStatus==='Denied'?'danger':'warning'}`}>{rx.refillStatus}</span>}
              </div>
            </div>
            <div className="table-responsive"><table className="table table-sm mb-2"><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>
              {rx.medicines?.map((m,i) => <tr key={i}><td>{m.medicineName}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.duration}</td></tr>)}
            </tbody></table></div>
            {rx.instructions && <div className="text-muted small mb-2"><i className="bi bi-info-circle me-1"></i>{rx.instructions}</div>}
            {(rx.refillStatus === 'None' || rx.refillStatus === 'Denied') && <button className="btn btn-sm btn-outline-primary" onClick={() => handleRefill(rx._id)}><i className="bi bi-arrow-repeat me-1"></i>Request Refill</button>}
          </div>
        ))}
    </div>
  );
}
