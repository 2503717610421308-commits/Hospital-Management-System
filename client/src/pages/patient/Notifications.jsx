import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/billingService';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await getNotifications(); setNotifs(r.data.data||[]); } catch(e){} setLoading(false); };
  const markRead = async (id) => { try { await markNotificationRead(id); load(); } catch(e){} };
  const markAll = async () => { try { await markAllNotificationsRead(); load(); } catch(e){} };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Notifications</h4>
        {notifs.some(n=>!n.isRead) && <button className="btn btn-sm btn-outline-primary" onClick={markAll}>Mark All Read</button>}
      </div>
      {notifs.length === 0 ? <div className="text-center py-5 text-muted"><i className="bi bi-bell fs-1 d-block mb-2"></i>No notifications</div> :
        notifs.map(n => (
          <div key={n._id} className={`content-card p-3 mb-2 ${!n.isRead ? 'border-start border-primary border-3' : ''}`} onClick={()=>!n.isRead&&markRead(n._id)} style={{cursor: !n.isRead?'pointer':'default'}}>
            <div className="d-flex justify-content-between"><strong style={{fontSize:'0.9rem'}}>{n.title}</strong><small className="text-muted">{new Date(n.createdAt).toLocaleDateString()}</small></div>
            <p className="text-muted mb-0" style={{fontSize:'0.85rem'}}>{n.message}</p>
          </div>
        ))}
    </div>
  );
}
