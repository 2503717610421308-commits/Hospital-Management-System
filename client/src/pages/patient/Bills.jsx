import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBills, processPayment } from '../../services/billingService';
import { getPatientByUserId } from '../../services/patientService';

export default function Bills() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [showPay, setShowPay] = useState(null); const [payMethod, setPayMethod] = useState('Card');
  const [patient, setPatient] = useState(null); const [printBill, setPrintBill] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const [b, p] = await Promise.all([getBills(), getPatientByUserId(user._id)]); setBills(b.data.data||[]); setPatient(p.data.data); } catch(e){} setLoading(false); };

  const handlePay = async () => {
    try {
      const r = await processPayment({ billId: showPay._id, patientId: patient._id, amount: showPay.totalAmount, paymentMethod: payMethod });
      setMsg({ text: r.data.message, type: r.data.data.status === 'Completed' ? 'success' : 'warning' });
      setShowPay(null); load();
    } catch(e) { setMsg({ text: e.response?.data?.message||'Payment failed', type: 'danger' }); }
  };

  if (loading) return <LoadingSpinner />;
  const statusColors = { Pending:'warning', Paid:'success', Failed:'danger', Refunded:'info' };

  return (
    <div>
      <h4 className="fw-bold mb-4">Bills & Payments</h4>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      {bills.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-receipt fs-1 d-block mb-2"></i>No bills</div> :
        bills.map(b => (
          <div key={b._id} className="content-card p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
              <div><span className="badge bg-light text-dark me-2">{b.billId}</span><span className={`badge bg-${statusColors[b.paymentStatus]}`}>{b.paymentStatus}</span></div>
              <div className="d-flex gap-2">
                {b.paymentStatus === 'Pending' && <button className="btn btn-sm btn-success" onClick={()=>setShowPay(b)}><i className="bi bi-credit-card me-1"></i>Pay Now</button>}
                <button className="btn btn-sm btn-outline-secondary" onClick={()=>setPrintBill(b)}><i className="bi bi-printer me-1"></i>Print</button>
              </div>
            </div>
            <div className="table-responsive"><table className="table table-sm mb-2"><thead><tr><th>Description</th><th>Category</th><th className="text-end">Amount</th></tr></thead><tbody>
              {b.items?.map((item,i) => <tr key={i}><td>{item.description}</td><td><span className="badge bg-light text-dark">{item.category}</span></td><td className="text-end">₹{item.amount}</td></tr>)}
            </tbody><tfoot>
              <tr><td colSpan={2} className="text-end">Subtotal</td><td className="text-end">₹{b.subtotal}</td></tr>
              {b.tax > 0 && <tr><td colSpan={2} className="text-end">Tax</td><td className="text-end">₹{b.tax}</td></tr>}
              {b.discount > 0 && <tr><td colSpan={2} className="text-end text-success">Discount</td><td className="text-end text-success">-₹{b.discount}</td></tr>}
              <tr className="fw-bold"><td colSpan={2} className="text-end">Total</td><td className="text-end">₹{b.totalAmount}</td></tr>
            </tfoot></table></div>
          </div>
        ))}

      {/* Payment Modal */}
      {showPay && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5>Make Payment</h5><button className="btn-close" onClick={()=>setShowPay(null)}></button></div>
        <div className="modal-body">
          <p><strong>Bill:</strong> {showPay.billId}</p><p><strong>Amount:</strong> ₹{showPay.totalAmount}</p>
          <label className="form-label">Payment Method</label>
          <select className="form-select" value={payMethod} onChange={e=>setPayMethod(e.target.value)}>
            <option>Cash</option><option>Card</option><option>UPI</option><option>Online</option>
          </select>
          <div className="alert alert-info mt-3 py-2"><i className="bi bi-info-circle me-2"></i>This is a simulated payment gateway for academic purposes.</div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowPay(null)}>Cancel</button><button className="btn btn-success" onClick={handlePay}><i className="bi bi-check-circle me-2"></i>Pay ₹{showPay.totalAmount}</button></div>
      </div></div></div>)}

      {/* Print Bill */}
      {printBill && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header no-print"><h5>Bill</h5><div className="d-flex gap-2"><button className="btn btn-sm btn-primary" onClick={()=>window.print()}><i className="bi bi-printer me-1"></i>Print</button><button className="btn-close" onClick={()=>setPrintBill(null)}></button></div></div>
        <div className="modal-body bill-print">
          <div className="bill-header"><h4>City General Hospital</h4><p>100 Medical Center Drive, Mumbai</p><p>Phone: +91 22 1234 5678</p></div>
          <div className="row mb-3"><div className="col-6"><strong>Bill ID:</strong> {printBill.billId}<br/><strong>Date:</strong> {new Date(printBill.billDate).toLocaleDateString()}</div><div className="col-6 text-end"><strong>Patient:</strong> {printBill.patientId?.name}<br/><strong>Status:</strong> {printBill.paymentStatus}</div></div>
          <table><thead><tr><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>{printBill.items?.map((item,i) => <tr key={i}><td>{item.description}</td><td>{item.category}</td><td>₹{item.amount}</td></tr>)}</tbody>
            <tfoot><tr><td colSpan={2}><strong>Subtotal</strong></td><td>₹{printBill.subtotal}</td></tr><tr><td colSpan={2}><strong>Tax</strong></td><td>₹{printBill.tax}</td></tr><tr><td colSpan={2}><strong>Discount</strong></td><td>-₹{printBill.discount}</td></tr><tr><td colSpan={2}><strong>Total</strong></td><td><strong>₹{printBill.totalAmount}</strong></td></tr></tfoot>
          </table>
        </div>
      </div></div></div>)}
    </div>
  );
}
