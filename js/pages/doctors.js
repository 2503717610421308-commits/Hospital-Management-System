/**
 * MediCore HMS - Doctors Page
 */

const DoctorsPage = (() => {
  let allDoctors = [];
  let allDepts = [];
  let allUsers = [];
  let currentPage = 1;
  let searchQuery = '';
  let filterDept = '';

  async function render(params) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div style="padding:32px;text-align:center">Loading doctors...</div>`;
    try {
      [allDoctors, allDepts, allUsers] = await Promise.all([DB.getAll('doctors'), DB.getAll('departments'), DB.getAll('users')]);
      renderList();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  }

  function deptName(id) { return allDepts.find(d => d.id === id)?.name || '—'; }
  function deptColor(id) { return allDepts.find(d => d.id === id)?.color || 'var(--primary)'; }

  function renderList() {
    const content = document.getElementById('page-content');
    const filtered = allDoctors.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.license_no?.toLowerCase().includes(q);
      const matchDept = !filterDept || d.department_id == filterDept;
      return matchSearch && matchDept;
    });
    const paged = UI.paginate(filtered, currentPage, 10);
    const canCreate = Auth.can('create', 'doctors');
    const canEdit = Auth.can('edit', 'doctors');

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>Doctors</h1><p>${allDoctors.length} registered doctors</p></div>
        <div class="page-header-actions">
          ${canCreate ? `<button class="btn btn-primary" onclick="DoctorsPage.openAddModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Doctor
          </button>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" placeholder="Search name, specialization..." value="${searchQuery}" oninput="DoctorsPage.handleSearch(this.value)" />
          </div>
          <div class="toolbar-filters">
            <select onchange="DoctorsPage.handleDeptFilter(this.value)">
              <option value="">All Departments</option>
              ${allDepts.map(d=>`<option value="${d.id}" ${filterDept==d.id?'selected':''}>${d.name}</option>`).join('')}
            </select>
          </div>
          <span style="color:var(--text-muted);font-size:0.8125rem;margin-left:auto">${filtered.length} results</span>
        </div>
        <div class="table-wrapper" style="border:none;border-radius:0">
          <table>
            <thead><tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${paged.items.length === 0 ? `<tr><td colspan="8">${UI.emptyState('No doctors found')}</td></tr>` :
              paged.items.map(doc => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:0.875rem;flex-shrink:0">${UI.getInitials(doc.name)}</div>
                      <div><div style="font-weight:600">${doc.name}</div><div style="font-size:0.75rem;color:var(--text-muted)">Lic: ${doc.license_no||'—'}</div></div>
                    </div>
                  </td>
                  <td><span style="background:${deptColor(doc.department_id)}22;color:${deptColor(doc.department_id)};padding:3px 8px;border-radius:4px;font-size:0.75rem;font-weight:600">${deptName(doc.department_id)}</span></td>
                  <td>${doc.specialization||'—'}</td>
                  <td>${doc.experience_years||'—'} yrs</td>
                  <td>${UI.formatCurrency(doc.consultation_fee)}</td>
                  <td style="font-size:0.75rem">${(doc.available_days||[]).join(', ')}<br><span style="color:var(--text-muted)">${doc.available_start||''} – ${doc.available_end||''}</span></td>
                  <td>${UI.statusBadge(doc.status||'active')}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-icon-sm btn-ghost" title="View Profile" onclick="DoctorsPage.viewDoctor(${doc.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      ${canEdit ? `<button class="btn btn-icon-sm btn-ghost" title="Edit" onclick="DoctorsPage.openEditModal(${doc.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${UI.renderPagination(paged, 'function(p){DoctorsPage.goPage(p)}')}
      </div>`;
  }

  function doctorForm(doctor = null) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return `
      <form id="doctor-form" novalidate>
        <div class="form-section-title">Doctor Information</div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="df-name">Full Name *</label>
            <input type="text" id="df-name" name="name" value="${doctor?.name||''}" placeholder="Dr. John Smith" />
            <span class="field-error" id="df-name-error"></span>
          </div>
          <div class="form-group">
            <label for="df-license_no">License Number</label>
            <input type="text" id="df-license_no" name="license_no" value="${doctor?.license_no||''}" placeholder="MD-2024-001" />
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="df-department_id">Department *</label>
            <select id="df-department_id" name="department_id">
              <option value="">Select department</option>
              ${allDepts.map(d=>`<option value="${d.id}" ${doctor?.department_id==d.id?'selected':''}>${d.name}</option>`).join('')}
            </select>
            <span class="field-error" id="df-department_id-error"></span>
          </div>
          <div class="form-group">
            <label for="df-specialization">Specialization *</label>
            <input type="text" id="df-specialization" name="specialization" value="${doctor?.specialization||''}" placeholder="Cardiology" />
            <span class="field-error" id="df-specialization-error"></span>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="df-experience_years">Years of Experience</label>
            <input type="number" id="df-experience_years" name="experience_years" value="${doctor?.experience_years||''}" min="0" max="60" placeholder="5" />
          </div>
          <div class="form-group">
            <label for="df-consultation_fee">Consultation Fee ($)</label>
            <input type="number" id="df-consultation_fee" name="consultation_fee" value="${doctor?.consultation_fee||''}" min="0" step="0.01" placeholder="100" />
          </div>
        </div>
        <div class="form-section-title" style="margin-top:8px">Availability</div>
        <div class="form-group">
          <label>Available Days</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">
            ${days.map(d=>`<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.875rem">
              <input type="checkbox" name="available_days" value="${d}" ${(doctor?.available_days||[]).includes(d)?'checked':''} style="width:auto;padding:0" />${d}
            </label>`).join('')}
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group">
            <label for="df-available_start">Start Time</label>
            <input type="time" id="df-available_start" name="available_start" value="${doctor?.available_start||'09:00'}" />
          </div>
          <div class="form-group">
            <label for="df-available_end">End Time</label>
            <input type="time" id="df-available_end" name="available_end" value="${doctor?.available_end||'17:00'}" />
          </div>
        </div>
        <div class="form-group">
          <label for="df-bio">Bio / Notes</label>
          <textarea id="df-bio" name="bio" rows="2" placeholder="Brief doctor biography...">${doctor?.bio||''}</textarea>
        </div>
        <div class="form-group">
          <label for="df-status">Status</label>
          <select id="df-status" name="status">
            <option value="active" ${(!doctor||doctor?.status==='active')?'selected':''}>Active</option>
            <option value="inactive" ${doctor?.status==='inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><span class="btn-text">${doctor ? 'Update Doctor' : 'Add Doctor'}</span><span class="btn-spinner hidden"></span></button>
        </div>
      </form>`;
  }

  async function openAddModal() {
    await UI.openModal('Add New Doctor', doctorForm(), { size: 'lg' });
    setupDoctorForm(null);
  }

  async function openEditModal(id) {
    const doctor = await DB.getById('doctors', id);
    if (!doctor) return;
    await UI.openModal('Edit Doctor', doctorForm(doctor), { size: 'lg' });
    setupDoctorForm(doctor);
  }

  function setupDoctorForm(doctor) {
    document.getElementById('doctor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        name: fd.get('name'), license_no: fd.get('license_no'),
        department_id: parseInt(fd.get('department_id')),
        specialization: fd.get('specialization'),
        experience_years: parseInt(fd.get('experience_years')) || 0,
        consultation_fee: parseFloat(fd.get('consultation_fee')) || 0,
        available_days: fd.getAll('available_days'),
        available_start: fd.get('available_start'),
        available_end: fd.get('available_end'),
        bio: fd.get('bio'), status: fd.get('status'),
        user_id: doctor?.user_id || null
      };
      const errors = UI.validateForm(data, {
        name: { required: true, label: 'Doctor Name' },
        department_id: { required: true, label: 'Department', requiredMsg: 'Please select a department.' },
        specialization: { required: true, label: 'Specialization' },
      });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'df-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        if (doctor) { await DB.update('doctors', { ...doctor, ...data }); }
        else { await DB.add('doctors', data); }
        allDoctors = await DB.getAll('doctors');
        UI.closeModal();
        renderList();
        UI.toast(doctor ? 'Doctor updated!' : 'Doctor added!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function viewDoctor(id) {
    const doc = await DB.getById('doctors', id);
    if (!doc) return;
    const dept = allDepts.find(d => d.id === doc.department_id);
    const appointments = await DB.getByIndex('appointments', 'doctor_id', id);
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const body = `
      <div class="profile-header" style="margin:-24px -24px 24px">
        <div class="profile-avatar">${UI.getInitials(doc.name)}</div>
        <div class="profile-info">
          <h2>${doc.name}</h2>
          <p style="opacity:0.85">${doc.specialization||'—'}</p>
          <p style="margin-top:6px">${UI.statusBadge(doc.status||'active')}</p>
        </div>
      </div>
      <div class="profile-details" style="padding:0">
        <div class="detail-item"><label>Department</label><span style="color:${dept?.color||'var(--primary)'}">${dept?.name||'—'}</span></div>
        <div class="detail-item"><label>License No.</label><span>${doc.license_no||'—'}</span></div>
        <div class="detail-item"><label>Experience</label><span>${doc.experience_years||'—'} years</span></div>
        <div class="detail-item"><label>Consultation Fee</label><span>${UI.formatCurrency(doc.consultation_fee)}</span></div>
        <div class="detail-item"><label>Hours</label><span>${doc.available_start||'—'} – ${doc.available_end||'—'}</span></div>
        <div class="detail-item"><label>Total Appointments</label><span>${appointments.length}</span></div>
      </div>
      <div style="margin-top:var(--space-md)">
        <div class="form-section-title">Weekly Schedule</div>
        <div class="schedule-grid">
          ${days.map(d=>`<div class="schedule-day ${(doc.available_days||[]).includes(d)?'available':'unavailable'}">
            <div class="schedule-day-name">${d}</div>
            <div class="schedule-time">${(doc.available_days||[]).includes(d)?'✓':'—'}</div>
          </div>`).join('')}
        </div>
      </div>
      ${doc.bio ? `<div style="margin-top:var(--space-md)"><div class="form-section-title">Biography</div><p style="font-size:0.875rem;color:var(--text-secondary)">${doc.bio}</p></div>` : ''}`;
    await UI.openModal(`Doctor Profile`, body, { size: 'lg' });
  }

  function handleSearch(val) { searchQuery = val; currentPage = 1; renderList(); }
  function handleDeptFilter(val) { filterDept = val; currentPage = 1; renderList(); }
  function goPage(p) { currentPage = p; renderList(); }

  return { render, openAddModal, openEditModal, viewDoctor, handleSearch, handleDeptFilter, goPage };
})();
