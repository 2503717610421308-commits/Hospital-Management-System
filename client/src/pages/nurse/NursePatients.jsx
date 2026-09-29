import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAppointments } from '../../services/appointmentService';
import { getPatients } from '../../services/patientService';

export default function NursePatients() {
  const [patients, setPatients] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await getPatients(); setPatients(r.data.data||[]); } catch(e){} setLoading(false); })(); }, []);
  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.patientId}</span> },
    { header: 'Name', accessor: 'name' }, { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' }, { header: 'Blood Group', render: r => r.bloodGroup||'—' },
  ];
  return (<div><h4 className="fw-bold mb-4">Assigned Patients</h4>{loading?<LoadingSpinner />:<DataTable columns={columns} data={patients} />}</div>);
}
