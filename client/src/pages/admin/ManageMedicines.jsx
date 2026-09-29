import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../services/billingService';

export default function ManageMedicines() {
  const [meds, setMeds] = useState([]); const [loading, setLoading] = useState(true); const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); const [msg, setMsg] = useState({}); const [search, setSearch] = useState('');
  const [form, setForm] = useState({ medicineName: '', description: '', category: '', stock: 0, price: 0, manufacturer: '', expiryDate: '' });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getMedicines({ search }); setMeds(r.data.data || []); } catch(e){} setLoading(false); };

  const openModal = (m = null) => { setEditing(m); setForm(m ? { medicineName: m.medicineName, description: m.description||'', category: m.category||'', stock: m.stock, price: m.price, manufacturer: m.manufacturer||'', expiryDate: m.expiryDate?.split('T')[0]||'' } : { medicineName:'',description:'',category:'',stock:0,price:0,manufacturer:'',expiryDate:'' }); setShowModal(true); };

  const handleSubmit = async (e) => { e.preventDefault(); try { if(editing) await updateMedicine(editing._id, form); else await createMedicine(form); setMsg({text:editing?'Updated':'Added',type:'success'}); setShowModal(false); load(); } catch(err) { setMsg({text:err.response?.data?.message||'Error',type:'danger'}); } };
  const handleDelete = async (id) => { if(!window.confirm('Delete?')) return; try { await deleteMedicine(id); load(); } catch(e){} };

  const columns = [
    { header: 'ID', render: r => <span className="badge bg-light text-dark">{r.medicineId}</span> },
    { header: 'Name', accessor: 'medicineName' }, { header: 'Category', render: r => r.category || '—' },
    { header: 'Stock', render: r => <span className={`badge bg-${r.stock < 50 ? 'danger' : r.stock < 100 ? 'warning' : 'success'}`}>{r.stock}</span> },
    { header: 'Price', render: r => `₹${r.price}` },
    { header: 'Actions', render: r => (<div className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={e=>{e.stopPropagation();openModal(r)}}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-outline-danger" onClick={e=>{e.stopPropagation();handleDelete(r._id)}}><i className="bi bi-trash"></i></button></div>) }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Manage Medicines</h4><button className="btn btn-primary" onClick={()=>openModal()}><i className="bi bi-plus-lg me-2"></i>Add Medicine</button></div>
      {msg.text && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}<button className="btn-close" onClick={()=>setMsg({})}></button></div>}
      <form onSubmit={e=>{e.preventDefault();load()}} className="mb-3"><div className="input-group" style={{maxWidth:400}}><input className="form-control" placeholder="Search medicines..." value={search} onChange={e=>setSearch(e.target.value)} /><button className="btn btn-outline-primary"><i className="bi bi-search"></i></button></div></form>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={meds} />}
      {showModal && (<div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5>{editing?'Edit':'Add'} Medicine</h5><button className="btn-close" onClick={()=>setShowModal(false)}></button></div>
        <form onSubmit={handleSubmit}><div className="modal-body"><div className="row g-3">
          <div className="col-12"><label className="form-label">Name *</label><input className="form-control" value={form.medicineName} onChange={e=>setForm({...form,medicineName:e.target.value})} required /></div>
          <div className="col-md-6"><label className="form-label">Category</label><input className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
          <div className="col-md-6"><label className="form-label">Manufacturer</label><input className="form-control" value={form.manufacturer} onChange={e=>setForm({...form,manufacturer:e.target.value})} /></div>
          <div className="col-md-4"><label className="form-label">Price *</label><input type="number" className="form-control" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required min={0} /></div>
          <div className="col-md-4"><label className="form-label">Stock</label><input type="number" className="form-control" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} min={0} /></div>
          <div className="col-md-4"><label className="form-label">Expiry Date</label><input type="date" className="form-control" value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})} /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea></div>
        </div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing?'Update':'Add'}</button></div></form>
      </div></div></div>)}
    </div>
  );
}
