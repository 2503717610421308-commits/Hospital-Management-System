import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBills, processPayment } from '../../services/billingService';

export default function RecBilling() {
  const [bills, setBills] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [showPay, setShowPay] = useState(null); const [payMethod, setPayMethod] = useState('Cash');
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getBills(); setBills(r.data.data||[]); } catch(e){} setLoading(false); };

  const handlePay = async () => {
    try { await processPayment({ billId:showPay._id, patientId:showPay.patientId?._id, amount:showPay.totalAmount, paymentMethod:payMethod }); setMsg({text:'Payment processed',type:'success'}); setShowPay(null); load(); }
    catch(e) { setMsg({text:'Failed',type:'danger'}); }
  };

  const statusColors = { Pending:'warning', Paid:'success', Failed:'danger', Refunded:'info' };
  const columns = [
    { header: 'Bill ID', render: r => <span className="badge bg-light text-dark">{r.billId}</span> },
    { header: 'Patient', render: r => r.patientId?.name||'N/A' },
    { header: 'Date', render: r => new Date(r.billDate).toLocaleDateString() },
    { header: 'Total', render: r => <strong>₹{r.totalAmount?.toLocaleString()}</strong> },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.paymentStatus]}`}>{r.paymentStatus}</span> },
    { header: 'Actions', render: r => r.paymentStatus==='Pending' ? <button className="btn btn-sm btn-success" onClick={e=>{e.stopPropagation();setShowPay(r)}}><i className="bi bi-credit-card me-1"></i>Collect</button> : null }
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Billing</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={bills} />}
      {showPay && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5>Collect Payment</h5><button className="btn-close" onClick={()=>setShowPay(null)}></button></div>
        <div className="modal-body"><p><strong>Patient:</strong> {showPay.patientId?.name}</p><p><strong>Amount:</strong> ₹{showPay.totalAmount}</p>
          <label className="form-label">Method</label><select className="form-select" value={payMethod} onChange={e=>setPayMethod(e.target.value)}><option>Cash</option><option>Card</option><option>UPI</option></select>
        </div><div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowPay(null)}>Cancel</button><button className="btn btn-success" onClick={handlePay}>Collect ₹{showPay.totalAmount}</button></div>
      </div></div></div>)}
    </div>
  );
}
