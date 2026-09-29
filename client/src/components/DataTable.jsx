export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found.' }) {
  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>{columns.map((col, i) => <th key={i} style={col.width ? { width: col.width } : {}}>{col.header}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row._id || idx} onClick={() => onRowClick && onRowClick(row)} style={onRowClick ? { cursor: 'pointer' } : {}}>
                {columns.map((col, i) => (
                  <td key={i}>{col.render ? col.render(row, idx) : row[col.accessor]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
