/**
 * MediCore HMS - Appointments Page
 */

const AppointmentsPage = (() => {
  let allAppointments = [];
  let allPatients = [];
  let allDoctors = [];
  let allDepts = [];
  let currentPage = 1;
  let searchQuery = '';
  let filterStatus = '';
  let filterDate = '';

  async function render(params) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div style="padding:32px;text-align:center">Loading appointments...</div>`;
    try {
      [allAppointments, allPatients, allDoctors, allDepts] = await Promise.all([
        DB.getAll('appointments'), DB.getAll('patients'), DB.getAll('doctors'), DB.getAll('departments')
      ]);
      // For patient role, filter to own appointments
      if (Auth.getRole() === 'patient') {
        const userId = Auth.getUserId();
        const myPatient = allPatients.find(p => p.user_id === userId);
        if (myPatient) allAppointments = allAppointments.filter(a => a.patient_id === myPatient.id);
        else allAppointments = [];
      }
      // For doctor role, filter to own appointments
      if (Auth.getRole() === 'doctor') {
        const userId = Auth.getUserId();
        const myDoc = allDoctors.find(d => d.user_id === userId);
        if (myDoc) allAppointments = allAppointments.filter(a => a.doctor_id === myDoc.id);
        else allAppointments = [];
      }
      renderList();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  }

  function patientName(id) { return allPatients.find(p => p.id === id)?.name || '—'; }
  function doctorName(id) { return allDoctors.find(d => d.id === id)?.name || '—'; }
  function deptName(id) { return allDepts.find(d => d.id === id)?.name || '—'; }

  function renderList() {
    const content = document.getElementById('page-content');
    const role = Auth.getRole();
    let filtered = [...allAppointments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        patientName(a.patient_id).toLowerCase().includes(q) ||
        doctorName(a.doctor_id).toLowerCase().includes(q) ||
        deptName(a.department_id).toLowerCase().includes(q) ||
        (a.reason||'').toLowerCase().includes(q)
      );
    }
    if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
    if (filterDate) filtered = filtered.filter(a => a.date === filterDate);
    filtered.sort((a,b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
    const paged = UI.paginate(filtered, currentPage, 10);
    const canCreate = Auth.can('create', 'appointments');
    const canEdit = Auth.can('edit', 'appointments');
    const canDelete = Auth.can('delete', 'appointments');

    const today = new Date().toISOString().split('T')[0];
    const todayCount = allAppointments.filter(a => a.date === today).length;
    const pendingCount = allAppointments.filter(a => a.status === 'pending').length;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>${role === 'patient' ? 'My Appointments' : role === 'doctor' ? 'My Schedule' : 'Appointments'}</h1>
          <p>${allAppointments.length} total appointments • ${todayCount} today • ${pendingCount} pending</p>
        </div>
        <div class="page-header-actions">
          ${canCreate ? `<button class="btn btn-primary" onclick="AppointmentsPage.openAddModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Book Appointment
          </button>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" placeholder="Search patient, doctor, reason..." value="${searchQuery}" oninput="AppointmentsPage.handleSearch(this.value)" />
          </div>
          <div class="toolbar-filters">
            <select onchange="AppointmentsPage.handleStatusFilter(this.value)">
              <option value="">All Status</option>
              ${['pending','confirmed','completed','cancelled'].map(s=>`<option value="${s}" ${filterStatus===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
            </select>
            <input type="date" value="${filterDate}" onchange="AppointmentsPage.handleDateFilter(this.value)" style="padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius-sm)" />
            ${filterDate ? `<button class="btn btn-ghost btn-sm" onclick="AppointmentsPage.handleDateFilter('')">Clear Date</button>` : ''}
          </div>
          <span style="color:var(--text-muted);font-size:0.8125rem;margin-left:auto">${filtered.length} results</span>
        </div>
        <div class="table-wrapper" style="border:none;border-radius:0">
          <table>
            <thead>
              <tr>
                ${role !== 'patient' ? '<th>Patient</th>' : ''}
                ${role !== 'doctor' ? '<th>Doctor</th>' : ''}
                <th>Department</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paged.items.length === 0 ? `<tr><td colspan="7">${UI.emptyState('No appointments found', '', canCreate ? `<button class="btn btn-primary" onclick="AppointmentsPage.openAddModal()">Book Appointment</button>` : '')}</td></tr>` :
              paged.items.map(a => `
                <tr>
                  ${role !== 'patient' ? `<td><div style="font-weight:600">${patientName(a.patient_id)}</div></td>` : ''}
                  ${role !== 'doctor' ? `<td style="font-size:0.875rem">${doctorName(a.doctor_id)}</td>` : ''}
                  <td style="font-size:0.875rem">${deptName(a.department_id)}</td>
                  <td>
                    <div style="font-weight:600">${UI.formatDate(a.date)}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">${a.time}</div>
                  </td>
                  <td style="max-width:180px" class="truncate">${a.reason||'—'}</td>
                  <td>${UI.statusBadge(a.status)}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-icon-sm btn-ghost" title="View" onclick="AppointmentsPage.viewAppointment(${a.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      ${canEdit && a.status !== 'completed' && a.status !== 'cancelled' ? `
                        <button class="btn btn-icon-sm btn-ghost" title="Edit" onclick="AppointmentsPage.openEditModal(${a.id})">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        ${a.status === 'pending' ? `<button class="btn btn-icon-sm btn-ghost" title="Confirm" style="color:var(--success)" onclick="AppointmentsPage.updateStatus(${a.id},'confirmed')">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>` : ''}
                        ${a.status === 'confirmed' ? `<button class="btn btn-icon-sm btn-ghost" title="Mark Completed" style="color:var(--success)" onclick="AppointmentsPage.updateStatus(${a.id},'completed')">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </button>` : ''}
                      ` : ''}
                      ${canDelete && a.status !== 'completed' ? `
                        <button class="btn btn-icon-sm btn-ghost" title="Cancel" style="color:var(--danger)" onclick="AppointmentsPage.cancelAppointment(${a.id})">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${UI.renderPagination(paged, 'function(p){AppointmentsPage.goPage(p)}')}
      </div>`;
  }

  function appointmentForm(appt = null) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();
    let patientOptions = allPatients.map(p => `<option value="${p.id}" ${appt?.patient_id==p.id?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
    // For patient, auto-select own patient record
    let patientSelectDisabled = '';
    let patientDefaultId = appt?.patient_id || '';
    if (role === 'patient') {
      const myPatient = allPatients.find(p => p.user_id === userId);
      if (myPatient) { patientDefaultId = myPatient.id; patientSelectDisabled = 'disabled'; }
    }

    const today = new Date().toISOString().split('T')[0];
    return `
      <form id="appt-form" novalidate>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="af-patient_id">Patient *</label>
            <select id="af-patient_id" name="patient_id" ${patientSelectDisabled}>
              <option value="">Select patient</option>
              ${allPatients.map(p=>`<option value="${p.id}" ${(appt?.patient_id||patientDefaultId)==p.id?'selected':''}>${p.name} (${p.patient_id})</option>`).join('')}
            </select>
            <span class="field-error" id="af-patient_id-error"></span>
          </div>
          <div class="form-group">
            <label for="af-department_id">Department *</label>
            <select id="af-department_id" name="department_id" onchange="AppointmentsPage.filterDocsByDept(this.value, ${appt?.doctor_id||'null'})">
              <option value="">Select department</option>
              ${allDepts.map(d=>`<option value="${d.id}" ${appt?.department_id==d.id?'selected':''}>${d.name}</option>`).join('')}
            </select>
            <span class="field-error" id="af-department_id-error"></span>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="af-doctor_id">Doctor *</label>
            <select id="af-doctor_id" name="doctor_id">
              <option value="">Select department first</option>
              ${appt ? allDoctors.filter(d=>d.department_id==appt.department_id).map(d=>`<option value="${d.id}" ${appt.doctor_id==d.id?'selected':''}>${d.name}</option>`).join('') : ''}
            </select>
            <span class="field-error" id="af-doctor_id-error"></span>
          </div>
          <div class="form-group">
            <label for="af-status">Status</label>
            <select id="af-status" name="status">
              ${['pending','confirmed','completed','cancelled'].map(s=>`<option value="${s}" ${(appt?.status||'pending')===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="af-date">Date *</label>
            <input type="date" id="af-date" name="date" value="${appt?.date||today}" min="${today}" />
            <span class="field-error" id="af-date-error"></span>
          </div>
          <div class="form-group">
            <label for="af-time">Time *</label>
            <input type="time" id="af-time" name="time" value="${appt?.time||'09:00'}" />
            <span class="field-error" id="af-time-error"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="af-reason">Reason for Visit *</label>
          <input type="text" id="af-reason" name="reason" value="${appt?.reason||''}" placeholder="e.g. Follow-up, chest pain, fever..." />
          <span class="field-error" id="af-reason-error"></span>
        </div>
        <div class="form-group">
          <label for="af-notes">Notes</label>
          <textarea id="af-notes" name="notes" rows="2" placeholder="Additional notes...">${appt?.notes||''}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><span class="btn-text">${appt ? 'Update' : 'Book Appointment'}</span><span class="btn-spinner hidden"></span></button>
        </div>
      </form>`;
  }

  function filterDocsByDept(deptId, selectedDocId = null) {
    const select = document.getElementById('af-doctor_id');
    if (!select) return;
    const docs = allDoctors.filter(d => d.department_id == deptId && d.status === 'active');
    select.innerHTML = docs.length === 0
      ? `<option value="">No doctors in this department</option>`
      : `<option value="">Select doctor</option>` + docs.map(d=>`<option value="${d.id}" ${selectedDocId==d.id?'selected':''}>${d.name} — ${d.specialization||''}</option>`).join('');
  }

  async function openAddModal() {
    await UI.openModal('Book New Appointment', appointmentForm(), { size: 'lg' });
    document.getElementById('appt-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      fd.patient_id = parseInt(fd.patient_id);
      fd.doctor_id = parseInt(fd.doctor_id);
      fd.department_id = parseInt(fd.department_id);
      const errors = UI.validateForm(fd, {
        patient_id: { required: true, label: 'Patient', requiredMsg: 'Please select a patient.' },
        department_id: { required: true, label: 'Department', requiredMsg: 'Please select a department.' },
        doctor_id: { required: true, label: 'Doctor', requiredMsg: 'Please select a doctor.' },
        date: { required: true, label: 'Date' },
        time: { required: true, label: 'Time' },
        reason: { required: true, label: 'Reason' },
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'af-'); return; }
      // Conflict check
      const conflict = allAppointments.find(a =>
        a.doctor_id === fd.doctor_id && a.date === fd.date && a.time === fd.time && a.status !== 'cancelled'
      );
      if (conflict) { UI.showFieldErrors({ time: 'This time slot is already booked for this doctor.' }, 'af-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.add('appointments', { ...fd, created_by: Auth.getRole() });
        await reload();
        UI.closeModal(); renderList();
        UI.toast('Appointment booked!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function openEditModal(id) {
    const appt = await DB.getById('appointments', id);
    if (!appt) return;
    await UI.openModal('Edit Appointment', appointmentForm(appt), { size: 'lg' });
    document.getElementById('appt-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      fd.patient_id = parseInt(fd.patient_id);
      fd.doctor_id = parseInt(fd.doctor_id);
      fd.department_id = parseInt(fd.department_id);
      const errors = UI.validateForm(fd, {
        patient_id: { required: true, label: 'Patient', requiredMsg: 'Please select a patient.' },
        department_id: { required: true, label: 'Department', requiredMsg: 'Please select a department.' },
        doctor_id: { required: true, label: 'Doctor', requiredMsg: 'Please select a doctor.' },
        date: { required: true, label: 'Date' },
        time: { required: true, label: 'Time' },
        reason: { required: true, label: 'Reason' },
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'af-'); return; }
      const conflict = allAppointments.find(a =>
        a.id !== id && a.doctor_id === fd.doctor_id && a.date === fd.date && a.time === fd.time && a.status !== 'cancelled'
      );
      if (conflict) { UI.showFieldErrors({ time: 'This time slot is already booked for this doctor.' }, 'af-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.update('appointments', { ...appt, ...fd });
        await reload();
        UI.closeModal(); renderList();
        UI.toast('Appointment updated!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function viewAppointment(id) {
    const appt = await DB.getById('appointments', id);
    if (!appt) return;
    const patient = allPatients.find(p => p.id === appt.patient_id);
    const doctor = allDoctors.find(d => d.id === appt.doctor_id);
    const dept = allDepts.find(d => d.id === appt.department_id);
    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
        <div class="detail-item"><label>Patient</label><span>${patient?.name||'—'} <span class="patient-id-badge">${patient?.patient_id||''}</span></span></div>
        <div class="detail-item"><label>Doctor</label><span>${doctor?.name||'—'}</span></div>
        <div class="detail-item"><label>Department</label><span>${dept?.name||'—'}</span></div>
        <div class="detail-item"><label>Status</label><span>${UI.statusBadge(appt.status)}</span></div>
        <div class="detail-item"><label>Date</label><span>${UI.formatDate(appt.date)}</span></div>
        <div class="detail-item"><label>Time</label><span>${appt.time}</span></div>
        <div class="detail-item" style="grid-column:span 2"><label>Reason</label><span>${appt.reason||'—'}</span></div>
        <div class="detail-item" style="grid-column:span 2"><label>Notes</label><span>${appt.notes||'—'}</span></div>
        <div class="detail-item"><label>Created</label><span>${UI.formatDateTime(appt.created_at)}</span></div>
        <div class="detail-item"><label>Last Updated</label><span>${UI.formatDateTime(appt.updated_at)}</span></div>
      </div>`;
    await UI.openModal('Appointment Details', body);
  }

  async function updateStatus(id, status) {
    const appt = await DB.getById('appointments', id);
    if (!appt) return;
    await DB.update('appointments', { ...appt, status });
    await reload();
    renderList();
    UI.toast(`Appointment marked as ${status}.`, 'success');
  }

  async function cancelAppointment(id) {
    const ok = await UI.confirm('Cancel this appointment?', 'Cancel Appointment', 'Cancel Appointment', 'btn-danger');
    if (!ok) return;
    const appt = await DB.getById('appointments', id);
    await DB.update('appointments', { ...appt, status: 'cancelled' });
    await reload();
    renderList();
    UI.toast('Appointment cancelled.', 'info');
  }

  async function reload() {
    const all = await DB.getAll('appointments');
    const role = Auth.getRole();
    const userId = Auth.getUserId();
    if (role === 'patient') {
      const myPat = allPatients.find(p => p.user_id === userId);
      allAppointments = myPat ? all.filter(a => a.patient_id === myPat.id) : [];
    } else if (role === 'doctor') {
      const myDoc = allDoctors.find(d => d.user_id === userId);
      allAppointments = myDoc ? all.filter(a => a.doctor_id === myDoc.id) : [];
    } else {
      allAppointments = all;
    }
  }

  function handleSearch(val) { searchQuery = val; currentPage = 1; renderList(); }
  function handleStatusFilter(val) { filterStatus = val; currentPage = 1; renderList(); }
  function handleDateFilter(val) { filterDate = val; currentPage = 1; renderList(); }
  function goPage(p) { currentPage = p; renderList(); }

  return { render, openAddModal, openEditModal, viewAppointment, updateStatus, cancelAppointment, filterDocsByDept, handleSearch, handleStatusFilter, handleDateFilter, goPage };
})();
