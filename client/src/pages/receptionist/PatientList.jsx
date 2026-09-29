import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPatients } from '../../services/patientService';

export default function RecPatientList() {
  const [patients, setPatients] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('');
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getPatients({ search }); setPatients(r.data.data||[]); } catch(e){} setLoading(false); };
  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.patientId}</span> },
    { header: 'Name', accessor: 'name' }, { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' }, { header: 'Email', accessor: 'email' },
    { header: 'Blood Group', render: r => r.bloodGroup||'—' },
  ];
  return (
    <div>
      <h4 className="fw-bold mb-4">Patient List</h4>
      <form onSubmit={e=>{e.preventDefault();load()}} className="mb-3"><div className="input-group" style={{maxWidth:400}}><input className="form-control" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} /><button className="btn btn-outline-primary"><i className="bi bi-search"></i></button></div></form>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={patients} />}
    </div>
  );
}
