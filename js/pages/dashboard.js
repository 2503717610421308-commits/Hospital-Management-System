/**
 * MediCore HMS - Dashboard Page
 */

const DashboardPage = (() => {
  async function render(params) {
    const role = Auth.getRole();
    const session = Auth.getSession();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="empty-state"><p>Loading dashboard...</p></div>';

    try {
      const [patients, doctors, departments, appointments, bills, users] = await Promise.all([
        DB.getAll('patients'), DB.getAll('doctors'), DB.getAll('departments'),
        DB.getAll('appointments'), DB.getAll('bills'), DB.getAll('users')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointments.filter(a => a.date === today);
      const pendingAppts = appointments.filter(a => a.status === 'pending');
      const confirmedAppts = appointments.filter(a => a.status === 'confirmed');
      const completedAppts = appointments.filter(a => a.status === 'completed');
      const paidBills = bills.filter(b => b.status === 'paid');
      const unpaidBills = bills.filter(b => b.status === 'unpaid');

      let totalRevenue = 0;
      for (const b of paidBills) {
        const items = await DB.getByIndex('bill_items', 'bill_id', b.id);
        const subtotal = items.reduce((s, i) => s + i.amount, 0);
        const disc = b.discount || 0;
        const tax = ((subtotal - disc) * (b.tax_rate || 0)) / 100;
        totalRevenue += subtotal - disc + tax;
      }

      const greetingHour = new Date().getHours();
      const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

      // Role-specific stats and content
      let statsHTML = '';
      let widgetsHTML = '';

      if (role === 'admin') {
        statsHTML = `
          <div class="stats-grid">
            <div class="stat-card stat-blue"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="stat-card-value">${patients.length}</div><div class="stat-card-label">Total Patients</div></div>
            <div class="stat-card stat-teal"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg></div><div class="stat-card-value">${doctors.length}</div><div class="stat-card-label">Total Doctors</div></div>
            <div class="stat-card stat-orange"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-card-value">${todayAppts.length}</div><div class="stat-card-label">Today's Appointments</div></div>
            <div class="stat-card stat-green"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div class="stat-card-value">${UI.formatCurrency(totalRevenue)}</div><div class="stat-card-label">Total Revenue</div></div>
            <div class="stat-card stat-purple"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div><div class="stat-card-value">${pendingAppts.length}</div><div class="stat-card-label">Pending Appointments</div></div>
            <div class="stat-card stat-red"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="stat-card-value">${unpaidBills.length}</div><div class="stat-card-label">Unpaid Bills</div></div>
          </div>`;

        // Appointment status donut chart data
        const total = appointments.length || 1;
        const pendPct = Math.round((pendingAppts.length / total) * 100);
        const confPct = Math.round((confirmedAppts.length / total) * 100);
        const compPct = Math.round((completedAppts.length / total) * 100);
        const cancPct = 100 - pendPct - confPct - compPct;
        const cancelledAppts = appointments.filter(a => a.status === 'cancelled');

        // Dept doctor counts
        const deptBarItems = departments.map(d => {
          const dc = doctors.filter(doc => doc.department_id === d.id).length;
          return `<div class="chart-bar-item">
            <span class="chart-bar-label truncate" style="max-width:120px">${d.name}</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${doctors.length ? (dc/Math.max(...departments.map(dep=>doctors.filter(doc=>doc.department_id===dep.id).length),1))*100 : 0}%; background:${d.color || 'var(--primary)'}"></div></div>
            <span class="chart-bar-value">${dc}</span>
          </div>`;
        }).join('');

        // Recent activity from appointments
        const recentAppts = [...appointments].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
        const patientMap = {};
        patients.forEach(p => patientMap[p.id] = p);
        const doctorMap = {};
        doctors.forEach(d => doctorMap[d.id] = d);

        const activityItems = recentAppts.map(a => {
          const pat = patientMap[a.patient_id];
          const doc = doctorMap[a.doctor_id];
          const colors = { pending: 'var(--warning)', confirmed: 'var(--info)', completed: 'var(--success)', cancelled: 'var(--danger)' };
          return `<div class="activity-item">
            <div class="activity-dot" style="background:${colors[a.status]||'var(--gray-400)'}"></div>
            <div class="activity-content">
              <div class="activity-text">Appointment for <strong>${pat?.name||'—'}</strong> with ${doc?.name||'—'}</div>
              <div class="activity-time">${UI.formatDate(a.date)} at ${a.time} • ${UI.statusBadge(a.status)}</div>
            </div>
          </div>`;
        }).join('');

        widgetsHTML = `
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Today's Appointments</span><button class="btn btn-sm btn-outline" onclick="Router.navigate('appointments')">View All</button></div>
              ${todayAppts.length === 0 ? `<div class="card-body">${UI.emptyState('No appointments today')}</div>` : `
              <div class="appt-list">
                ${todayAppts.slice(0,5).map(a => `
                  <div class="appt-item">
                    <span class="appt-time">${a.time}</span>
                    <div class="appt-info">
                      <div class="appt-patient">${patientMap[a.patient_id]?.name||'—'}</div>
                      <div class="appt-doctor">${doctorMap[a.doctor_id]?.name||'—'}</div>
                    </div>
                    <div class="appt-status">${UI.statusBadge(a.status)}</div>
                  </div>`).join('')}
              </div>`}
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Appointment Overview</span></div>
              <div class="card-body">
                <div class="donut-wrapper">
                  <div class="donut-chart">
                    ${renderDonut([
                      { value: pendingAppts.length, color: '#f59e0b' },
                      { value: confirmedAppts.length, color: '#3b82f6' },
                      { value: completedAppts.length, color: '#22c55e' },
                      { value: cancelledAppts.length, color: '#ef4444' },
                    ], appointments.length)}
                    <div class="donut-center">
                      <span class="donut-center-value">${appointments.length}</span>
                      <span class="donut-center-label">Total</span>
                    </div>
                  </div>
                  <div class="donut-legend">
                    <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#f59e0b"></div><span class="donut-legend-label">Pending</span><span class="donut-legend-value">${pendingAppts.length}</span></div>
                    <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#3b82f6"></div><span class="donut-legend-label">Confirmed</span><span class="donut-legend-value">${confirmedAppts.length}</span></div>
                    <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#22c55e"></div><span class="donut-legend-label">Completed</span><span class="donut-legend-value">${completedAppts.length}</span></div>
                    <div class="donut-legend-item"><div class="donut-legend-dot" style="background:#ef4444"></div><span class="donut-legend-label">Cancelled</span><span class="donut-legend-value">${cancelledAppts.length}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Doctors by Department</span></div>
              <div class="card-body"><div class="chart-bar-container">${deptBarItems}</div></div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Recent Activity</span></div>
              <div class="card-body" style="padding:0"><div class="activity-list" style="padding:0 16px">${activityItems || UI.emptyState('No recent activity')}</div></div>
            </div>
          </div>`;

      } else if (role === 'doctor') {
        const userId = Auth.getUserId();
        const myDoctor = doctors.find(d => d.user_id === userId);
        const myAppts = myDoctor ? appointments.filter(a => a.doctor_id === myDoctor.id) : [];
        const myTodayAppts = myAppts.filter(a => a.date === today);
        const myPending = myAppts.filter(a => a.status === 'pending');
        const myCompleted = myAppts.filter(a => a.status === 'completed');

        statsHTML = `
          <div class="stats-grid">
            <div class="stat-card stat-blue"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-card-value">${myTodayAppts.length}</div><div class="stat-card-label">Today's Appointments</div></div>
            <div class="stat-card stat-orange"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-card-value">${myPending.length}</div><div class="stat-card-label">Pending</div></div>
            <div class="stat-card stat-green"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div class="stat-card-value">${myCompleted.length}</div><div class="stat-card-label">Completed</div></div>
            <div class="stat-card stat-teal"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-card-value">${[...new Set(myAppts.map(a=>a.patient_id))].length}</div><div class="stat-card-label">Total Patients</div></div>
          </div>`;

        const patientMap = {};
        patients.forEach(p => patientMap[p.id] = p);
        widgetsHTML = `
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Today's Schedule</span><button class="btn btn-sm btn-outline" onclick="Router.navigate('appointments')">View All</button></div>
              ${myTodayAppts.length === 0 ? `<div class="card-body">${UI.emptyState('No appointments scheduled today')}</div>` : `
              <div class="appt-list">
                ${myTodayAppts.map(a => `
                  <div class="appt-item">
                    <span class="appt-time">${a.time}</span>
                    <div class="appt-info">
                      <div class="appt-patient">${patientMap[a.patient_id]?.name||'—'}</div>
                      <div class="appt-doctor">${a.reason||'General consultation'}</div>
                    </div>
                    <div class="appt-status">${UI.statusBadge(a.status)}</div>
                  </div>`).join('')}
              </div>`}
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Upcoming Appointments</span></div>
              <div class="appt-list">
                ${myAppts.filter(a => a.date > today && a.status !== 'cancelled').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5).map(a => `
                  <div class="appt-item">
                    <span class="appt-time" style="min-width:80px;font-size:0.75rem">${UI.formatDate(a.date)}</span>
                    <div class="appt-info">
                      <div class="appt-patient">${patientMap[a.patient_id]?.name||'—'}</div>
                      <div class="appt-doctor">${a.time} • ${a.reason||'—'}</div>
                    </div>
                    ${UI.statusBadge(a.status)}
                  </div>`).join('') || `<div class="card-body">${UI.emptyState('No upcoming appointments')}</div>`}
              </div>
            </div>
          </div>`;
      } else if (role === 'receptionist') {
        statsHTML = `
          <div class="stats-grid">
            <div class="stat-card stat-blue"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-card-value">${patients.length}</div><div class="stat-card-label">Total Patients</div></div>
            <div class="stat-card stat-orange"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-card-value">${todayAppts.length}</div><div class="stat-card-label">Today's Appointments</div></div>
            <div class="stat-card stat-green"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div class="stat-card-value">${unpaidBills.length}</div><div class="stat-card-label">Unpaid Bills</div></div>
            <div class="stat-card stat-teal"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg></div><div class="stat-card-value">${doctors.filter(d=>d.status==='active').length}</div><div class="stat-card-label">Active Doctors</div></div>
          </div>`;
        const patientMap = {};
        patients.forEach(p => patientMap[p.id] = p);
        const doctorMap = {};
        doctors.forEach(d => doctorMap[d.id] = d);
        widgetsHTML = `
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Today's Appointments</span>
                <button class="btn btn-sm btn-primary" onclick="Router.navigate('appointments')">+ Book</button>
              </div>
              ${todayAppts.length === 0 ? `<div class="card-body">${UI.emptyState("No appointments today")}</div>` : `
              <div class="appt-list">
                ${todayAppts.map(a=>`<div class="appt-item"><span class="appt-time">${a.time}</span><div class="appt-info"><div class="appt-patient">${patientMap[a.patient_id]?.name||'—'}</div><div class="appt-doctor">${doctorMap[a.doctor_id]?.name||'—'}</div></div>${UI.statusBadge(a.status)}</div>`).join('')}
              </div>`}
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Quick Actions</span></div>
              <div class="card-body" style="display:grid;gap:12px">
                <button class="btn btn-primary btn-full" onclick="Router.navigate('patients')">+ Register New Patient</button>
                <button class="btn btn-outline btn-full" onclick="Router.navigate('appointments')">+ Book Appointment</button>
                <button class="btn btn-outline btn-full" onclick="Router.navigate('billing')">+ Create Bill</button>
              </div>
            </div>
          </div>`;
      } else if (role === 'patient') {
        const userId = Auth.getUserId();
        const myPatient = patients.find(p => p.user_id === userId);
        const myAppts = myPatient ? appointments.filter(a => a.patient_id === myPatient.id) : [];
        const myUpcoming = myAppts.filter(a => a.date >= today && a.status !== 'cancelled').sort((a,b)=>a.date.localeCompare(b.date));
        const myBills = myPatient ? bills.filter(b => b.patient_id === myPatient.id) : [];
        const myUnpaid = myBills.filter(b => b.status === 'unpaid');

        statsHTML = `
          <div class="stats-grid">
            <div class="stat-card stat-blue"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-card-value">${myUpcoming.length}</div><div class="stat-card-label">Upcoming Appointments</div></div>
            <div class="stat-card stat-orange"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div class="stat-card-value">${myUnpaid.length}</div><div class="stat-card-label">Pending Bills</div></div>
            <div class="stat-card stat-green"><div class="stat-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div><div class="stat-card-value">${myAppts.filter(a=>a.status==='completed').length}</div><div class="stat-card-label">Completed Visits</div></div>
          </div>`;

        const doctorMap = {};
        doctors.forEach(d => doctorMap[d.id] = d);
        widgetsHTML = `
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">My Upcoming Appointments</span><button class="btn btn-sm btn-primary" onclick="Router.navigate('appointments')">Book New</button></div>
              ${myUpcoming.length === 0 ? `<div class="card-body">${UI.emptyState('No upcoming appointments','Book one now!')}</div>` : `
              <div class="appt-list">
                ${myUpcoming.slice(0,5).map(a=>`<div class="appt-item"><span class="appt-time" style="min-width:80px;font-size:0.75rem">${UI.formatDate(a.date)}</span><div class="appt-info"><div class="appt-patient">${doctorMap[a.doctor_id]?.name||'—'}</div><div class="appt-doctor">${a.time} • ${a.reason||'—'}</div></div>${UI.statusBadge(a.status)}</div>`).join('')}
              </div>`}
            </div>
            ${myPatient ? `<div class="card"><div class="card-header"><span class="card-title">My Profile</span></div><div class="card-body">
              <div class="detail-item mb-md"><label>Patient ID</label><span><span class="patient-id-badge">${myPatient.patient_id}</span></span></div>
              <div class="detail-item mb-md"><label>Date of Birth</label><span>${UI.formatDate(myPatient.dob)} (Age ${UI.calcAge(myPatient.dob)})</span></div>
              <div class="detail-item mb-md"><label>Blood Group</label><span>${myPatient.blood_group||'—'}</span></div>
              <div class="detail-item mb-md"><label>Allergies</label><span>${myPatient.allergies||'None known'}</span></div>
              <div class="detail-item"><label>Insurance</label><span>${myPatient.insurance||'—'}</span></div>
            </div></div>` : ''}
          </div>`;
      }

      const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      content.innerHTML = `
        <div class="dashboard-welcome">
          <h2>${greeting}, ${session.name.split(' ')[0]}! 👋</h2>
          <p>Here's what's happening at MediCore today.</p>
          <div class="dashboard-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${dateStr}
          </div>
          <div class="dashboard-welcome-bg">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
        </div>
        ${statsHTML}
        ${widgetsHTML}`;
    } catch (err) {
      console.error(err);
      content.innerHTML = `<div class="empty-state"><h3>Error loading dashboard</h3><p>${err.message}</p></div>`;
    }
  }

  function renderDonut(segments, total) {
    if (!total) return `<svg viewBox="0 0 36 36" width="120" height="120"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" stroke-width="3"/></svg>`;
    const radius = 15.9;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const paths = segments.map(seg => {
      const dash = (seg.value / total) * circumference;
      const gap = circumference - dash;
      const path = `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="3" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="-${offset}" stroke-linecap="butt"/>`;
      offset += dash;
      return path;
    });
    return `<svg viewBox="0 0 36 36" width="120" height="120">
      <circle cx="18" cy="18" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      ${paths.join('')}
    </svg>`;
  }

  return { render };
})();
