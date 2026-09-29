import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBills, createBill } from '../../services/billingService';
import { getPatients } from '../../services/patientService';

export default function ManageBilling() {
  const [bills, setBills] = useState([]); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState({});
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);
  const load = async () => { setLoading(true); try { const r = await getBills({ paymentStatus: filter }); setBills(r.data.data || []); } catch(e){} setLoading(false); };

  const statusColors = { Pending: 'warning', Paid: 'success', Failed: 'danger', Refunded: 'info' };
  const columns = [
    { header: 'Bill ID', render: r => <span className="badge bg-light text-dark">{r.billId}</span> },
    { header: 'Patient', render: r => r.patientId?.name || 'N/A' },
    { header: 'Date', render: r => new Date(r.billDate).toLocaleDateString() },
    { header: 'Items', render: r => r.items?.length || 0 },
    { header: 'Total', render: r => <strong>₹{r.totalAmount?.toLocaleString()}</strong> },
    { header: 'Status', render: r => <span className={`badge bg-${statusColors[r.paymentStatus]}`}>{r.paymentStatus}</span> },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Manage Billing</h4>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="mb-3"><select className="form-select" style={{maxWidth:200}} value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All</option>{Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}</select></div>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={bills} />}
    </div>
  );
}
