export default function StatCard({ icon, label, value, color = 'primary', trend }) {
  const bgClass = {
    primary: 'bg-primary bg-opacity-10 text-primary',
    success: 'bg-success bg-opacity-10 text-success',
    warning: 'bg-warning bg-opacity-10 text-warning',
    danger: 'bg-danger bg-opacity-10 text-danger',
    info: 'bg-info bg-opacity-10 text-info',
    secondary: 'bg-secondary bg-opacity-10 text-secondary'
  };

  return (
    <div className="stat-card">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <p className="stat-label mb-1">{label}</p>
          <h3 className="stat-value mb-0">{value}</h3>
          {trend && <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</small>}
        </div>
        <div className={`stat-icon ${bgClass[color] || bgClass.primary}`}>
          <i className={`bi bi-${icon}`}></i>
        </div>
      </div>
    </div>
  );
}
