/**
 * MediCore HMS - Patients Page
 */

const PatientsPage = (() => {
  let allPatients = [];
  let allDepts = [];
  let currentPage = 1;
  let searchQuery = '';
  let filterGender = '';
  let filterBlood = '';

  async function render(params) {
    const content = document.getElementById('page-content');
    const role = Auth.getRole();
    const isPatientRole = role === 'patient';

    // Patient can only see their own record
    if (isPatientRole) {
      await renderPatientProfile();
      return;
    }

    content.innerHTML = `<div class="card"><div style="padding:32px;text-align:center">Loading patients...</div></div>`;
    try {
      allPatients = await DB.getAll('patients');
      allDepts = await DB.getAll('departments');
      renderList();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  }

  function renderList() {
    const content = document.getElementById('page-content');
    const filtered = allPatients.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.patient_id.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q);
      const matchGender = !filterGender || p.gender === filterGender;
      const matchBlood = !filterBlood || p.blood_group === filterBlood;
      return matchSearch && matchGender && matchBlood;
    });
    const paged = UI.paginate(filtered, currentPage, 10);
    const canCreate = Auth.can('create', 'patients');
    const canEdit = Auth.can('edit', 'patients');
    const canDelete = Auth.can('delete', 'patients');

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Patients</h1>
          <p>${allPatients.length} total patients registered</p>
        </div>
        <div class="page-header-actions">
          ${canCreate ? `<button class="btn btn-primary" id="add-patient-btn" onclick="PatientsPage.openAddModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Patient
          </button>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" id="patient-search" placeholder="Search by name, ID, phone, email..." value="${searchQuery}" oninput="PatientsPage.handleSearch(this.value)" />
          </div>
          <div class="toolbar-filters">
            <select id="gender-filter" onchange="PatientsPage.handleGenderFilter(this.value)">
              <option value="">All Genders</option>
              <option value="Male" ${filterGender==='Male'?'selected':''}>Male</option>
              <option value="Female" ${filterGender==='Female'?'selected':''}>Female</option>
              <option value="Other" ${filterGender==='Other'?'selected':''}>Other</option>
            </select>
            <select id="blood-filter" onchange="PatientsPage.handleBloodFilter(this.value)">
              <option value="">All Blood Groups</option>
              ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => `<option value="${bg}" ${filterBlood===bg?'selected':''}>${bg}</option>`).join('')}
            </select>
          </div>
          <span style="color:var(--text-muted);font-size:0.8125rem;margin-left:auto">${filtered.length} results</span>
        </div>
        <div class="table-wrapper" style="border:none;border-radius:0">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age / DOB</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paged.items.length === 0 ? `<tr><td colspan="8">${UI.emptyState('No patients found', searchQuery ? 'Try a different search term' : 'Add the first patient to get started', canCreate ? `<button class="btn btn-primary" onclick="PatientsPage.openAddModal()">Add Patient</button>` : '')}</td></tr>` :
              paged.items.map(p => `
                <tr>
                  <td><span class="patient-id-badge">${p.patient_id}</span></td>
                  <td>
                    <div style="font-weight:600">${p.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">${p.email||'—'}</div>
                  </td>
                  <td>${UI.calcAge(p.dob)} yrs<div style="font-size:0.75rem;color:var(--text-muted)">${UI.formatDate(p.dob)}</div></td>
                  <td>${p.gender||'—'}</td>
                  <td><span class="blood-group-badge">${p.blood_group||'?'}</span></td>
                  <td>${p.phone||'—'}</td>
                  <td>${UI.statusBadge(p.status||'active')}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-icon-sm btn-ghost" title="View Details" onclick="PatientsPage.viewPatient(${p.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      ${canEdit ? `<button class="btn btn-icon-sm btn-ghost" title="Edit" onclick="PatientsPage.openEditModal(${p.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>` : ''}
                      ${canDelete ? `<button class="btn btn-icon-sm btn-ghost" title="Delete" style="color:var(--danger)" onclick="PatientsPage.deletePatient(${p.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${UI.renderPagination(paged, 'function(p){PatientsPage.goPage(p)}')}
      </div>`;
  }

  function handleSearch(val) { searchQuery = val; currentPage = 1; renderList(); }
  function handleGenderFilter(val) { filterGender = val; currentPage = 1; renderList(); }
  function handleBloodFilter(val) { filterBlood = val; currentPage = 1; renderList(); }
  function goPage(p) { currentPage = p; renderList(); }

  function patientForm(patient = null) {
    return `
      <form id="patient-form" novalidate>
        <div class="form-section-title">Personal Information</div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="pf-name">Full Name *</label>
            <input type="text" id="pf-name" name="name" value="${patient?.name||''}" placeholder="John Doe" />
            <span class="field-error" id="pf-name-error"></span>
          </div>
          <div class="form-group">
            <label for="pf-dob">Date of Birth *</label>
            <input type="date" id="pf-dob" name="dob" value="${patient?.dob||''}" max="${new Date().toISOString().split('T')[0]}" />
            <span class="field-error" id="pf-dob-error"></span>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="pf-gender">Gender *</label>
            <select id="pf-gender" name="gender">
              <option value="">Select gender</option>
              <option value="Male" ${patient?.gender==='Male'?'selected':''}>Male</option>
              <option value="Female" ${patient?.gender==='Female'?'selected':''}>Female</option>
              <option value="Other" ${patient?.gender==='Other'?'selected':''}>Other</option>
            </select>
            <span class="field-error" id="pf-gender-error"></span>
          </div>
          <div class="form-group">
            <label for="pf-blood_group">Blood Group</label>
            <select id="pf-blood_group" name="blood_group">
              <option value="">Unknown</option>
              ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg=>`<option value="${bg}" ${patient?.blood_group===bg?'selected':''}>${bg}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-section-title" style="margin-top:8px">Contact Information</div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="pf-phone">Phone *</label>
            <input type="tel" id="pf-phone" name="phone" value="${patient?.phone||''}" placeholder="+1-555-0100" />
            <span class="field-error" id="pf-phone-error"></span>
          </div>
          <div class="form-group">
            <label for="pf-email">Email</label>
            <input type="email" id="pf-email" name="email" value="${patient?.email||''}" placeholder="patient@email.com" />
            <span class="field-error" id="pf-email-error"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="pf-address">Address</label>
          <textarea id="pf-address" name="address" rows="2" placeholder="Street, City, State ZIP">${patient?.address||''}</textarea>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="pf-emergency_contact">Emergency Contact Name</label>
            <input type="text" id="pf-emergency_contact" name="emergency_contact" value="${patient?.emergency_contact||''}" placeholder="Contact name" />
          </div>
          <div class="form-group">
            <label for="pf-emergency_phone">Emergency Contact Phone</label>
            <input type="tel" id="pf-emergency_phone" name="emergency_phone" value="${patient?.emergency_phone||''}" placeholder="+1-555-0100" />
          </div>
        </div>
        <div class="form-section-title" style="margin-top:8px">Medical Information</div>
        <div class="form-group">
          <label for="pf-medical_history">Medical History</label>
          <textarea id="pf-medical_history" name="medical_history" rows="2" placeholder="e.g. Hypertension, Diabetes...">${patient?.medical_history||''}</textarea>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="pf-allergies">Allergies</label>
            <input type="text" id="pf-allergies" name="allergies" value="${patient?.allergies||''}" placeholder="e.g. Penicillin, Peanuts" />
          </div>
          <div class="form-group">
            <label for="pf-insurance">Insurance Info</label>
            <input type="text" id="pf-insurance" name="insurance" value="${patient?.insurance||''}" placeholder="Provider & Policy #" />
          </div>
        </div>
        <div class="form-group">
          <label for="pf-status">Status</label>
          <select id="pf-status" name="status">
            <option value="active" ${(!patient||patient?.status==='active')?'selected':''}>Active</option>
            <option value="inactive" ${patient?.status==='inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><span class="btn-text">${patient ? 'Update Patient' : 'Add Patient'}</span><span class="btn-spinner hidden"></span></button>
        </div>
      </form>`;
  }

  async function openAddModal() {
    await UI.openModal('Add New Patient', patientForm(), { size: 'lg' });
    document.getElementById('patient-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const errors = UI.validateForm(fd, {
        name: { required: true, label: 'Full Name' },
        dob: { required: true, label: 'Date of Birth' },
        gender: { required: true, label: 'Gender' },
        phone: { required: true, label: 'Phone', phone: true },
        email: { email: true }
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'pf-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        const patients = await DB.getAll('patients');
        const patient_id = generatePatientId(patients.length);
        await DB.add('patients', { ...fd, patient_id, user_id: null });
        allPatients = await DB.getAll('patients');
        UI.closeModal();
        renderList();
        UI.toast('Patient added successfully!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function openEditModal(id) {
    const patient = await DB.getById('patients', id);
    if (!patient) return;
    await UI.openModal('Edit Patient', patientForm(patient), { size: 'lg' });
    document.getElementById('patient-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const errors = UI.validateForm(fd, {
        name: { required: true, label: 'Full Name' },
        dob: { required: true, label: 'Date of Birth' },
        gender: { required: true, label: 'Gender' },
        phone: { required: true, label: 'Phone', phone: true },
        email: { email: true }
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'pf-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.update('patients', { ...patient, ...fd });
        allPatients = await DB.getAll('patients');
        UI.closeModal();
        renderList();
        UI.toast('Patient updated successfully!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function viewPatient(id) {
    const patient = await DB.getById('patients', id);
    if (!patient) return;
    const records = await DB.getByIndex('medical_records', 'patient_id', id);
    const appts = await DB.getByIndex('appointments', 'patient_id', id);
    const body = `
      <div class="profile-header" style="margin:-24px -24px 24px">
        <div class="profile-avatar">${UI.getInitials(patient.name)}</div>
        <div class="profile-info">
          <h2>${patient.name}</h2>
          <p><span class="patient-id-badge" style="background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.3)">${patient.patient_id}</span></p>
          <p style="margin-top:6px">${UI.statusBadge(patient.status||'active')}</p>
        </div>
      </div>
      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab('info')">Info</button>
        <button class="tab-btn" onclick="switchTab('medical')">Medical (${records.length})</button>
        <button class="tab-btn" onclick="switchTab('appts')">Appointments (${appts.length})</button>
      </div>
      <div id="tab-info" class="tab-panel active">
        <div class="profile-details" style="padding:0">
          <div class="detail-item"><label>Date of Birth</label><span>${UI.formatDate(patient.dob)} (Age ${UI.calcAge(patient.dob)})</span></div>
          <div class="detail-item"><label>Gender</label><span>${patient.gender||'—'}</span></div>
          <div class="detail-item"><label>Blood Group</label><span><span class="blood-group-badge">${patient.blood_group||'?'}</span></span></div>
          <div class="detail-item"><label>Phone</label><span>${patient.phone||'—'}</span></div>
          <div class="detail-item"><label>Email</label><span>${patient.email||'—'}</span></div>
          <div class="detail-item"><label>Address</label><span>${patient.address||'—'}</span></div>
          <div class="detail-item"><label>Emergency Contact</label><span>${patient.emergency_contact||'—'}</span></div>
          <div class="detail-item"><label>Emergency Phone</label><span>${patient.emergency_phone||'—'}</span></div>
          <div class="detail-item"><label>Allergies</label><span>${patient.allergies||'None known'}</span></div>
          <div class="detail-item"><label>Insurance</label><span>${patient.insurance||'—'}</span></div>
          <div class="detail-item" style="grid-column:span 2"><label>Medical History</label><span>${patient.medical_history||'—'}</span></div>
        </div>
      </div>
      <div id="tab-medical" class="tab-panel">
        ${records.length === 0 ? UI.emptyState('No medical records') : records.map(r => `
          <div class="record-card mb-md">
            <div class="record-date">${UI.formatDate(r.visit_date)}</div>
            <div class="record-field"><label>Diagnosis</label><p>${r.diagnosis}</p></div>
            <div class="record-field"><label>Treatment</label><p>${r.treatment}</p></div>
          </div>`).join('')}
      </div>
      <div id="tab-appts" class="tab-panel">
        ${appts.length === 0 ? UI.emptyState('No appointments') : appts.sort((a,b)=>b.date.localeCompare(a.date)).map(a => `
          <div class="appt-item" style="border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;padding:10px 14px">
            <span class="appt-time" style="min-width:90px;font-size:0.75rem">${UI.formatDate(a.date)} ${a.time}</span>
            <div class="appt-info"><div class="appt-patient">${a.reason||'General consultation'}</div></div>
            ${UI.statusBadge(a.status)}
          </div>`).join('')}
      </div>`;
    await UI.openModal(`Patient: ${patient.name}`, body, { size: 'lg' });
    // Tab switching
    window.switchTab = (tab) => {
      document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.toggle('active', ['info','medical','appts'][i]===tab));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id===`tab-${tab}`));
    };
  }

  async function deletePatient(id) {
    const patient = await DB.getById('patients', id);
    if (!patient) return;
    const ok = await UI.confirm(`Are you sure you want to delete patient "${patient.name}"? This cannot be undone.`, 'Delete Patient');
    if (!ok) return;
    await DB.remove('patients', id);
    allPatients = await DB.getAll('patients');
    renderList();
    UI.toast('Patient deleted.', 'success');
  }

  async function renderPatientProfile() {
    const content = document.getElementById('page-content');
    const userId = Auth.getUserId();
    const patients = await DB.getAll('patients');
    const patient = patients.find(p => p.user_id === userId);
    if (!patient) {
      content.innerHTML = `<div class="empty-state"><h3>Profile not found</h3><p>Your patient profile has not been set up yet. Contact the hospital reception.</p></div>`;
      return;
    }
    content.innerHTML = `
      <div class="page-header"><div class="page-header-left"><h1>My Profile</h1></div></div>
      <div class="card" style="max-width:700px">
        <div class="profile-header">
          <div class="profile-avatar">${UI.getInitials(patient.name)}</div>
          <div class="profile-info">
            <h2>${patient.name}</h2>
            <p><span class="patient-id-badge" style="background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.3)">${patient.patient_id}</span></p>
          </div>
        </div>
        <div class="profile-details">
          <div class="detail-item"><label>Date of Birth</label><span>${UI.formatDate(patient.dob)} (Age ${UI.calcAge(patient.dob)})</span></div>
          <div class="detail-item"><label>Gender</label><span>${patient.gender||'—'}</span></div>
          <div class="detail-item"><label>Blood Group</label><span><span class="blood-group-badge">${patient.blood_group||'?'}</span></span></div>
          <div class="detail-item"><label>Phone</label><span>${patient.phone||'—'}</span></div>
          <div class="detail-item"><label>Email</label><span>${patient.email||'—'}</span></div>
          <div class="detail-item" style="grid-column:span 2"><label>Address</label><span>${patient.address||'—'}</span></div>
          <div class="detail-item"><label>Emergency Contact</label><span>${patient.emergency_contact||'—'}</span></div>
          <div class="detail-item"><label>Emergency Phone</label><span>${patient.emergency_phone||'—'}</span></div>
          <div class="detail-item"><label>Allergies</label><span>${patient.allergies||'None known'}</span></div>
          <div class="detail-item"><label>Insurance</label><span>${patient.insurance||'—'}</span></div>
          <div class="detail-item" style="grid-column:span 2"><label>Medical History</label><span>${patient.medical_history||'—'}</span></div>
        </div>
      </div>`;
  }

  return { render, openAddModal, openEditModal, viewPatient, deletePatient, handleSearch, handleGenderFilter, handleBloodFilter, goPage };
})();
