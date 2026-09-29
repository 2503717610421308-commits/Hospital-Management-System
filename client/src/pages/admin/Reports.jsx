import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getRevenueReport, getPatientReport, getAppointmentReport } from '../../services/billingService';

export default function Reports() {
  const [revenueData, setRevenueData] = useState(null); const [patientData, setPatientData] = useState(null);
  const [aptData, setAptData] = useState(null); const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const [r, p, a] = await Promise.all([getRevenueReport(), getPatientReport(), getAppointmentReport()]); setRevenueData(r.data.data); setPatientData(p.data.data); setAptData(a.data.data); } catch(e){} setLoading(false); };

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Reports & Analytics</h4>
      <div className="row g-4">
        {/* Revenue */}
        <div className="col-lg-6"><div className="content-card p-3">
          <h6 className="fw-semibold mb-3"><i className="bi bi-currency-rupee me-2"></i>Monthly Revenue</h6>
          <div className="table-responsive"><table className="table table-sm"><thead><tr><th>Month</th><th>Bills</th><th>Revenue</th></tr></thead><tbody>
            {revenueData?.monthlyRevenue?.map((r, i) => <tr key={i}><td>{r._id}</td><td>{r.count}</td><td className="fw-semibold">₹{r.total?.toLocaleString()}</td></tr>)}
            {(!revenueData?.monthlyRevenue?.length) && <tr><td colSpan={3} className="text-center text-muted">No data</td></tr>}
          </tbody></table></div>
        </div></div>
        {/* Revenue by category */}
        <div className="col-lg-6"><div className="content-card p-3">
          <h6 className="fw-semibold mb-3"><i className="bi bi-pie-chart me-2"></i>Revenue by Category</h6>
          <div className="table-responsive"><table className="table table-sm"><thead><tr><th>Category</th><th>Total</th></tr></thead><tbody>
            {revenueData?.categoryRevenue?.map((r, i) => <tr key={i}><td>{r._id || 'Other'}</td><td className="fw-semibold">₹{r.total?.toLocaleString()}</td></tr>)}
            {(!revenueData?.categoryRevenue?.length) && <tr><td colSpan={2} className="text-center text-muted">No data</td></tr>}
          </tbody></table></div>
        </div></div>
        {/* Appointment by status */}
        <div className="col-lg-6"><div className="content-card p-3">
          <h6 className="fw-semibold mb-3"><i className="bi bi-calendar-check me-2"></i>Appointments by Status</h6>
          <div className="d-flex flex-wrap gap-2">
            {aptData?.statusCounts?.map((s, i) => {
              const colors = { Pending:'warning', Confirmed:'primary', Completed:'success', Cancelled:'danger', Rejected:'secondary' };
              return <div key={i} className={`badge bg-${colors[s._id]||'secondary'} fs-6 px-3 py-2`}>{s._id}: {s.count}</div>;
            })}
            {(!aptData?.statusCounts?.length) && <span className="text-muted">No data</span>}
          </div>
        </div></div>
        {/* Patient demographics */}
        <div className="col-lg-6"><div className="content-card p-3">
          <h6 className="fw-semibold mb-3"><i className="bi bi-people me-2"></i>Patient Demographics</h6>
          <div className="row g-2">
            <div className="col-6"><h6 className="text-muted small">By Gender</h6>
              {patientData?.genderDist?.map((g, i) => <div key={i} className="d-flex justify-content-between"><span>{g._id}</span><span className="fw-semibold">{g.count}</span></div>)}
            </div>
            <div className="col-6"><h6 className="text-muted small">By Blood Group</h6>
              {patientData?.bloodGroupDist?.map((b, i) => <div key={i} className="d-flex justify-content-between"><span>{b._id}</span><span className="fw-semibold">{b.count}</span></div>)}
            </div>
          </div>
        </div></div>
      </div>
    </div>
  );
}
