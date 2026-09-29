/**
 * MediCore HMS - Medical Records Page
 */

const MedicalRecordsPage = (() => {
  let allRecords = [];
  let allPatients = [];
  let allDoctors = [];
  let currentPage = 1;
  let searchQuery = '';
  let filterPatient = '';

  async function render(params) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div style="padding:32px;text-align:center">Loading medical records...</div>`;
    try {
      [allRecords, allPatients, allDoctors] = await Promise.all([
        DB.getAll('medical_records'), DB.getAll('patients'), DB.getAll('doctors')
      ]);
      const role = Auth.getRole();
      const userId = Auth.getUserId();
      // Patients can only see their own records
      if (role === 'patient') {
        const myPat = allPatients.find(p => p.user_id === userId);
        allRecords = myPat ? allRecords.filter(r => r.patient_id === myPat.id) : [];
        if (params?.patient_id) filterPatient = params.patient_id;
      }
      // Doctors see all records but filter to their patients
      if (role === 'doctor') {
        const myDoc = allDoctors.find(d => d.user_id === userId);
        if (myDoc) allRecords = allRecords.filter(r => r.doctor_id === myDoc.id);
      }
      renderList();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  }

  function patientName(id) { return allPatients.find(p => p.id === id)?.name || '—'; }
  function doctorName(id) { return allDoctors.find(d => d.id === id)?.name || '—'; }

  function renderList() {
    const content = document.getElementById('page-content');
    const role = Auth.getRole();
    let filtered = [...allRecords];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        patientName(r.patient_id).toLowerCase().includes(q) ||
        (r.diagnosis||'').toLowerCase().includes(q) ||
        (r.symptoms||'').toLowerCase().includes(q)
      );
    }
    if (filterPatient) filtered = filtered.filter(r => r.patient_id == filterPatient);
    filtered.sort((a,b) => (b.visit_date||'').localeCompare(a.visit_date||''));
    const paged = UI.paginate(filtered, currentPage, 8);
    const canCreate = Auth.can('create', 'medical_records');

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>${role === 'patient' ? 'My Medical Records' : 'Medical Records'}</h1><p>${allRecords.length} records total</p></div>
        <div class="page-header-actions">
          ${canCreate ? `<button class="btn btn-primary" onclick="MedicalRecordsPage.openAddModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Record
          </button>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" placeholder="Search diagnosis, symptoms, patient..." value="${searchQuery}" oninput="MedicalRecordsPage.handleSearch(this.value)" />
          </div>
          ${role !== 'patient' ? `<div class="toolbar-filters">
            <select onchange="MedicalRecordsPage.handlePatientFilter(this.value)">
              <option value="">All Patients</option>
              ${allPatients.map(p=>`<option value="${p.id}" ${filterPatient==p.id?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>` : ''}
          <span style="color:var(--text-muted);font-size:0.8125rem;margin-left:auto">${filtered.length} results</span>
        </div>
        <div class="table-wrapper" style="border:none;border-radius:0">
          <table>
            <thead>
              <tr>
                ${role !== 'patient' ? '<th>Patient</th>' : ''}
                ${role !== 'doctor' ? '<th>Doctor</th>' : ''}
                <th>Visit Date</th>
                <th>Diagnosis</th>
                <th>Symptoms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paged.items.length === 0 ? `<tr><td colspan="6">${UI.emptyState('No medical records found', canCreate ? '' : 'Records will appear here after your doctor visits.')}</td></tr>` :
              paged.items.map(r => `
                <tr>
                  ${role !== 'patient' ? `<td style="font-weight:600">${patientName(r.patient_id)}</td>` : ''}
                  ${role !== 'doctor' ? `<td style="font-size:0.875rem">${doctorName(r.doctor_id)}</td>` : ''}
                  <td>${UI.formatDate(r.visit_date)}</td>
                  <td style="max-width:200px" class="truncate">${r.diagnosis||'—'}</td>
                  <td style="max-width:160px;font-size:0.8125rem" class="truncate">${r.symptoms||'—'}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-icon-sm btn-ghost" title="View" onclick="MedicalRecordsPage.viewRecord(${r.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      ${canCreate ? `<button class="btn btn-icon-sm btn-ghost" title="Edit" onclick="MedicalRecordsPage.openEditModal(${r.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${UI.renderPagination(paged, 'function(p){MedicalRecordsPage.goPage(p)}')}
      </div>`;
  }

  function recordForm(record = null) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();
    let doctorDefaultId = record?.doctor_id || '';
    if (role === 'doctor') {
      const myDoc = allDoctors.find(d => d.user_id === userId);
      if (myDoc) doctorDefaultId = myDoc.id;
    }
    const today = new Date().toISOString().split('T')[0];
    return `
      <form id="record-form" novalidate>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="rf-patient_id">Patient *</label>
            <select id="rf-patient_id" name="patient_id">
              <option value="">Select patient</option>
              ${allPatients.map(p=>`<option value="${p.id}" ${record?.patient_id==p.id?'selected':''}>${p.name} (${p.patient_id})</option>`).join('')}
            </select>
            <span class="field-error" id="rf-patient_id-error"></span>
          </div>
          <div class="form-group">
            <label for="rf-doctor_id">Doctor *</label>
            <select id="rf-doctor_id" name="doctor_id" ${role==='doctor'?'disabled':''}>
              <option value="">Select doctor</option>
              ${allDoctors.map(d=>`<option value="${d.id}" ${(record?.doctor_id||doctorDefaultId)==d.id?'selected':''}>${d.name}</option>`).join('')}
            </select>
            <span class="field-error" id="rf-doctor_id-error"></span>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="rf-visit_date">Visit Date *</label>
            <input type="date" id="rf-visit_date" name="visit_date" value="${record?.visit_date||today}" max="${today}" />
            <span class="field-error" id="rf-visit_date-error"></span>
          </div>
          <div class="form-group">
            <label for="rf-diagnosis">Diagnosis *</label>
            <input type="text" id="rf-diagnosis" name="diagnosis" value="${record?.diagnosis||''}" placeholder="Primary diagnosis" />
            <span class="field-error" id="rf-diagnosis-error"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="rf-symptoms">Symptoms</label>
          <textarea id="rf-symptoms" name="symptoms" rows="2" placeholder="Chief complaints, symptoms...">${record?.symptoms||''}</textarea>
        </div>
        <div class="form-group">
          <label for="rf-treatment">Treatment *</label>
          <textarea id="rf-treatment" name="treatment" rows="3" placeholder="Treatment plan, medications prescribed, procedures...">${record?.treatment||''}</textarea>
          <span class="field-error" id="rf-treatment-error"></span>
        </div>
        <div class="form-group">
          <label for="rf-notes">Doctor's Notes</label>
          <textarea id="rf-notes" name="notes" rows="2" placeholder="Additional observations, follow-up instructions...">${record?.notes||''}</textarea>
        </div>
        <div class="form-section-title" style="margin-top:8px">Vitals (optional)</div>
        <div class="form-row cols-4">
          <div class="form-group"><label>BP</label><input type="text" name="vitals_bp" value="${record?.vitals?.bp||''}" placeholder="120/80" /></div>
          <div class="form-group"><label>Pulse</label><input type="text" name="vitals_pulse" value="${record?.vitals?.pulse||''}" placeholder="72 bpm" /></div>
          <div class="form-group"><label>Temp</label><input type="text" name="vitals_temp" value="${record?.vitals?.temp||''}" placeholder="98.6°F" /></div>
          <div class="form-group"><label>Weight</label><input type="text" name="vitals_weight" value="${record?.vitals?.weight||''}" placeholder="70 kg" /></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><span class="btn-text">${record ? 'Update Record' : 'Save Record'}</span><span class="btn-spinner hidden"></span></button>
        </div>
      </form>`;
  }

  function getFormData(e) {
    const fd = new FormData(e.target);
    const raw = Object.fromEntries(fd);
    // For disabled doctor select (doctor role), re-read value
    const docSelect = e.target.querySelector('[name=doctor_id]');
    if (docSelect) raw.doctor_id = docSelect.value;
    return {
      patient_id: parseInt(raw.patient_id),
      doctor_id: parseInt(raw.doctor_id),
      visit_date: raw.visit_date,
      diagnosis: raw.diagnosis,
      symptoms: raw.symptoms,
      treatment: raw.treatment,
      notes: raw.notes,
      vitals: { bp: raw.vitals_bp, pulse: raw.vitals_pulse, temp: raw.vitals_temp, weight: raw.vitals_weight }
    };
  }

  async function openAddModal() {
    if (Auth.getRole() === 'doctor') {
      const userId = Auth.getUserId();
      const myDoc = allDoctors.find(d => d.user_id === userId);
      if (!myDoc) { UI.toast('Your doctor profile is not set up.', 'warning'); return; }
    }
    await UI.openModal('Add Medical Record', recordForm(), { size: 'lg' });
    document.getElementById('record-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = getFormData(e);
      const errors = UI.validateForm(data, {
        patient_id: { required: true, label: 'Patient', requiredMsg: 'Please select a patient.' },
        doctor_id: { required: true, label: 'Doctor', requiredMsg: 'Please select a doctor.' },
        visit_date: { required: true, label: 'Visit Date' },
        diagnosis: { required: true, label: 'Diagnosis' },
        treatment: { required: true, label: 'Treatment' },
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'rf-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.add('medical_records', data);
        await reload();
        UI.closeModal(); renderList();
        UI.toast('Medical record saved!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function openEditModal(id) {
    const record = await DB.getById('medical_records', id);
    if (!record) return;
    await UI.openModal('Edit Medical Record', recordForm(record), { size: 'lg' });
    document.getElementById('record-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = getFormData(e);
      const errors = UI.validateForm(data, {
        patient_id: { required: true, label: 'Patient', requiredMsg: 'Please select a patient.' },
        doctor_id: { required: true, label: 'Doctor', requiredMsg: 'Please select a doctor.' },
        visit_date: { required: true, label: 'Visit Date' },
        diagnosis: { required: true, label: 'Diagnosis' },
        treatment: { required: true, label: 'Treatment' },
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'rf-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.update('medical_records', { ...record, ...data });
        await reload();
        UI.closeModal(); renderList();
        UI.toast('Record updated!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function viewRecord(id) {
    const record = await DB.getById('medical_records', id);
    if (!record) return;
    const patient = allPatients.find(p => p.id === record.patient_id);
    const doctor = allDoctors.find(d => d.id === record.doctor_id);
    const body = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:var(--space-lg);padding-bottom:var(--space-md);border-bottom:1px solid var(--border)">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:white;font-weight:700">${UI.getInitials(patient?.name||'?')}</div>
        <div>
          <div style="font-weight:700;font-size:1rem">${patient?.name||'—'}</div>
          <div style="font-size:0.8125rem;color:var(--text-muted)">${patient?.patient_id||''}</div>
        </div>
      </div>
      <div class="record-field"><label>Visit Date</label><p>${UI.formatDate(record.visit_date)}</p></div>
      <div class="record-field"><label>Attending Doctor</label><p>${doctor?.name||'—'}</p></div>
      <div class="record-field"><label>Diagnosis</label><p>${record.diagnosis||'—'}</p></div>
      <div class="record-field"><label>Symptoms</label><p>${record.symptoms||'—'}</p></div>
      <div class="record-field"><label>Treatment Plan</label><p>${record.treatment||'—'}</p></div>
      ${record.notes ? `<div class="record-field"><label>Notes</label><p>${record.notes}</p></div>` : ''}
      ${record.vitals && Object.values(record.vitals).some(v=>v) ? `
        <div class="form-section-title" style="margin-top:var(--space-md)">Vitals</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
          ${record.vitals.bp ? `<div class="detail-item"><label>Blood Pressure</label><span>${record.vitals.bp}</span></div>` : ''}
          ${record.vitals.pulse ? `<div class="detail-item"><label>Pulse</label><span>${record.vitals.pulse}</span></div>` : ''}
          ${record.vitals.temp ? `<div class="detail-item"><label>Temperature</label><span>${record.vitals.temp}</span></div>` : ''}
          ${record.vitals.weight ? `<div class="detail-item"><label>Weight</label><span>${record.vitals.weight}</span></div>` : ''}
        </div>` : ''}`;
    await UI.openModal('Medical Record Details', body, { size: 'lg' });
  }

  async function reload() {
    const all = await DB.getAll('medical_records');
    const role = Auth.getRole();
    const userId = Auth.getUserId();
    if (role === 'patient') {
      const myPat = allPatients.find(p => p.user_id === userId);
      allRecords = myPat ? all.filter(r => r.patient_id === myPat.id) : [];
    } else if (role === 'doctor') {
      const myDoc = allDoctors.find(d => d.user_id === userId);
      allRecords = myDoc ? all.filter(r => r.doctor_id === myDoc.id) : all;
    } else {
      allRecords = all;
    }
  }

  function handleSearch(val) { searchQuery = val; currentPage = 1; renderList(); }
  function handlePatientFilter(val) { filterPatient = val; currentPage = 1; renderList(); }
  function goPage(p) { currentPage = p; renderList(); }

  return { render, openAddModal, openEditModal, viewRecord, handleSearch, handlePatientFilter, goPage };
})();
