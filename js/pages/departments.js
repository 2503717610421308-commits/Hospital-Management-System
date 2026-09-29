/**
 * MediCore HMS - Departments Page
 */

const DepartmentsPage = (() => {
  let allDepts = [];
  let allDoctors = [];

  async function render(params) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div style="padding:32px;text-align:center">Loading departments...</div>`;
    try {
      [allDepts, allDoctors] = await Promise.all([DB.getAll('departments'), DB.getAll('doctors')]);
      renderList();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  }

  function renderList() {
    const content = document.getElementById('page-content');
    const canCreate = Auth.can('create', 'departments');
    const canEdit = Auth.can('edit', 'departments');
    const canDelete = Auth.can('delete', 'departments');

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>Departments</h1><p>${allDepts.length} departments in the hospital</p></div>
        <div class="page-header-actions">
          ${canCreate ? `<button class="btn btn-primary" onclick="DepartmentsPage.openAddModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Department
          </button>` : ''}
        </div>
      </div>
      <div class="dept-grid">
        ${allDepts.map(dept => {
          const docCount = allDoctors.filter(d => d.department_id === dept.id).length;
          return `<div class="dept-card" onclick="DepartmentsPage.viewDept(${dept.id})">
            <div class="dept-icon" style="background:${dept.color}22;color:${dept.color}">${dept.icon||'🏥'}</div>
            <div class="dept-name">${dept.name}</div>
            <div class="dept-count">${docCount} doctor${docCount !== 1 ? 's' : ''}</div>
            ${canEdit || canDelete ? `<div style="display:flex;gap:4px;justify-content:center;margin-top:8px" onclick="event.stopPropagation()">
              ${canEdit ? `<button class="btn btn-icon-sm btn-ghost" title="Edit" onclick="DepartmentsPage.openEditModal(${dept.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>` : ''}
              ${canDelete ? `<button class="btn btn-icon-sm btn-ghost" title="Delete" style="color:var(--danger)" onclick="DepartmentsPage.deleteDept(${dept.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>` : ''}
            </div>` : ''}
          </div>`;
        }).join('')}
        ${allDepts.length === 0 ? `<div class="empty-state" style="grid-column:1/-1">${UI.emptyState('No departments found')}</div>` : ''}
      </div>`;
  }

  function deptForm(dept = null) {
    const colors = ['#ef4444','#f59e0b','#22c55e','#0ea5e9','#8b5cf6','#ec4899','#14b8a6','#6366f1','#f97316','#84cc16'];
    const icons = ['❤️','🧠','🦴','👶','🏥','🩺','👂','🔬','💊','🩹','🔭','🩻'];
    return `
      <form id="dept-form" novalidate>
        <div class="form-group">
          <label for="df2-name">Department Name *</label>
          <input type="text" id="df2-name" name="name" value="${dept?.name||''}" placeholder="e.g. Cardiology" />
          <span class="field-error" id="df2-name-error"></span>
        </div>
        <div class="form-group">
          <label for="df2-description">Description</label>
          <textarea id="df2-description" name="description" rows="2" placeholder="Brief description...">${dept?.description||''}</textarea>
        </div>
        <div class="form-group">
          <label>Department Color</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">
            ${colors.map(c => `<label style="cursor:pointer">
              <input type="radio" name="color" value="${c}" ${(dept?.color||colors[0])===c?'checked':''} style="display:none" />
              <div style="width:28px;height:28px;border-radius:50%;background:${c};border:3px solid ${(dept?.color||colors[0])===c?'var(--gray-800)':'transparent'};transition:all 0.15s" onclick="this.parentElement.previousElementSibling && void 0"></div>
            </label>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Department Icon</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">
            ${icons.map(ic => `<label style="cursor:pointer">
              <input type="radio" name="icon" value="${ic}" ${(dept?.icon||icons[4])===ic?'checked':''} style="display:none" />
              <div style="width:36px;height:36px;border-radius:8px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:2px solid ${(dept?.icon||icons[4])===ic?'var(--primary)':'transparent'}">${ic}</div>
            </label>`).join('')}
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><span class="btn-text">${dept ? 'Update' : 'Add Department'}</span><span class="btn-spinner hidden"></span></button>
        </div>
      </form>`;
  }

  async function openAddModal() {
    await UI.openModal('Add Department', deptForm());
    document.getElementById('dept-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const errors = UI.validateForm(fd, { name: { required: true, label: 'Department Name' } });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'df2-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.add('departments', fd);
        allDepts = await DB.getAll('departments');
        UI.closeModal(); renderList();
        UI.toast('Department added!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function openEditModal(id) {
    const dept = await DB.getById('departments', id);
    if (!dept) return;
    await UI.openModal('Edit Department', deptForm(dept));
    document.getElementById('dept-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const errors = UI.validateForm(fd, { name: { required: true, label: 'Department Name' } });
      if (Object.keys(errors).length) { UI.showFieldErrors(errors, 'df2-'); return; }
      const btn = e.target.querySelector('[type=submit]');
      UI.setLoading(btn, true);
      try {
        await DB.update('departments', { ...dept, ...fd });
        allDepts = await DB.getAll('departments');
        UI.closeModal(); renderList();
        UI.toast('Department updated!', 'success');
      } catch (err) { UI.toast(err.message, 'danger'); UI.setLoading(btn, false); }
    });
  }

  async function deleteDept(id) {
    const dept = await DB.getById('departments', id);
    const docCount = allDoctors.filter(d => d.department_id === id).length;
    if (docCount > 0) { UI.toast(`Cannot delete "${dept?.name}" — ${docCount} doctor(s) are assigned to this department.`, 'warning'); return; }
    const ok = await UI.confirm(`Delete department "${dept?.name}"?`, 'Delete Department');
    if (!ok) return;
    await DB.remove('departments', id);
    allDepts = await DB.getAll('departments');
    renderList();
    UI.toast('Department deleted.', 'success');
  }

  async function viewDept(id) {
    const dept = await DB.getById('departments', id);
    if (!dept) return;
    const doctors = allDoctors.filter(d => d.department_id === id);
    const body = `
      <div style="text-align:center;padding:var(--space-lg) 0">
        <div style="width:72px;height:72px;border-radius:var(--radius-lg);background:${dept.color}22;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto var(--space-md)">${dept.icon||'🏥'}</div>
        <h2 style="font-size:1.375rem">${dept.name}</h2>
        <p style="color:var(--text-secondary);margin-top:4px">${dept.description||'—'}</p>
      </div>
      <div class="form-section-title">Doctors in this Department (${doctors.length})</div>
      ${doctors.length === 0 ? UI.emptyState('No doctors in this department') : doctors.map(d=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
          <div style="width:36px;height:36px;border-radius:50%;background:${dept.color}33;display:flex;align-items:center;justify-content:center;color:${dept.color};font-weight:700">${UI.getInitials(d.name)}</div>
          <div style="flex:1">
            <div style="font-weight:600">${d.name}</div>
            <div style="font-size:0.8125rem;color:var(--text-muted)">${d.specialization||'—'}</div>
          </div>
          ${UI.statusBadge(d.status||'active')}
        </div>`).join('')}`;
    await UI.openModal(dept.name, body);
  }

  return { render, openAddModal, openEditModal, deleteDept, viewDept };
})();
