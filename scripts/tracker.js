/* ============================================================
   Scholarship Tracker View
   ============================================================ */

const TrackerView = (() => {
  const STATUS_CONFIG = {
    researching: { label: '🔍 Researching', badge: 'badge-gray' },
    drafting:    { label: '✍️ Drafting',    badge: 'badge-cyan' },
    submitted:   { label: '📤 Submitted',   badge: 'badge-violet' },
    accepted:    { label: '🏆 Accepted',    badge: 'badge-green' },
    rejected:    { label: '❌ Rejected',    badge: 'badge-red' },
    waitlist:    { label: '⏳ Waitlist',    badge: 'badge-gold' },
  };

  let filterStatus = 'all';
  let filterRegion = 'all';
  let searchQuery = '';
  let editingId = null;

  function getFiltered() {
    let data = AppState.getScholarships();
    if (filterStatus !== 'all') data = data.filter(s => s.status === filterStatus);
    if (filterRegion !== 'all') data = data.filter(s => s.region === filterRegion);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.university.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
      );
    }
    return data;
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  }

  function renderTable(data) {
    if (data.length === 0) return `
      <div class="empty-state">
        <div class="empty-state-icon">🎓</div>
        <div class="empty-state-title">No scholarships found</div>
        <div class="empty-state-desc">Try adjusting filters or add a new scholarship</div>
        <button class="btn btn-primary" onclick="TrackerView.openAddModal()">➕ Add Scholarship</button>
      </div>`;

    return `
      <table class="tracker-table w-full">
        <thead>
          <tr>
            <th>Scholarship</th>
            <th>Country</th>
            <th>Funding</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Match</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(s => {
            const days = daysUntil(s.deadline);
            const urgent = days !== null && days <= 30 && days >= 0;
            const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.researching;
            const d = s.deadline ? new Date(s.deadline) : null;
            return `
              <tr>
                <td>
                  <div class="tracker-name">${s.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${s.university}</div>
                </td>
                <td><div class="tracker-country">${s.country}</div></td>
                <td><span class="badge badge-violet" style="font-size:10px">${s.fundingType}</span></td>
                <td>
                  <div style="font-size:13px;font-weight:500;${urgent ? 'color:var(--red)' : ''}">${d ? d.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : '—'}</div>
                  ${days !== null && days >= 0 ? `<div style="font-size:11px;color:${urgent?'var(--red)':days<=60?'var(--gold)':'var(--text-muted)'}">${days}d left</div>` : ''}
                  ${days !== null && days < 0 ? `<div style="font-size:11px;color:var(--text-muted)">Passed</div>` : ''}
                </td>
                <td><span class="badge ${cfg.badge}">${cfg.label}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:60px;height:4px">
                      <div class="progress-fill" style="width:${s.fieldMatch||0}%;background:${(s.fieldMatch||0)>=80?'var(--green)':(s.fieldMatch||0)>=60?'var(--gold)':'var(--red)'}"></div>
                    </div>
                    <span style="font-size:12px;font-weight:600;color:${(s.fieldMatch||0)>=80?'var(--green)':(s.fieldMatch||0)>=60?'var(--gold)':'var(--text-muted)'}">${s.fieldMatch||0}%</span>
                  </div>
                </td>
                <td>
                  <div class="tracker-actions">
                    <button class="btn btn-sm btn-secondary btn-icon" onclick="TrackerView.openEditModal('${s.id}')" title="Edit">✏️</button>
                    ${s.url ? `<a href="${s.url}" target="_blank" class="btn btn-sm btn-secondary btn-icon" title="Visit">🔗</a>` : ''}
                    ${s.deadline ? `<button class="btn btn-sm btn-secondary btn-icon" onclick="App.addToCalendar('${s.name.replace(/'/g, "\\'")}', '${s.deadline}', '${(s.url||'').replace(/'/g, "\\'")}')" title="Add Reminder to Calendar">📅</button>` : ''}
                    <button class="btn btn-sm btn-danger btn-icon" onclick="TrackerView.deleteScholarship('${s.id}')" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }

  function render() {
    const data = getFiltered();
    const all = AppState.getScholarships();

    // Status counts
    const counts = {};
    all.forEach(s => { counts[s.status||'researching'] = (counts[s.status||'researching']||0)+1; });

    document.getElementById('tracker-stats').innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
        <div class="card card-sm flex-1" style="min-width:120px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:var(--violet-light);font-family:var(--font-heading)">${all.length}</div>
          <div class="text-xs text-muted">Total</div>
        </div>
        <div class="card card-sm flex-1" style="min-width:120px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:var(--cyan);font-family:var(--font-heading)">${counts.drafting||0}</div>
          <div class="text-xs text-muted">Drafting</div>
        </div>
        <div class="card card-sm flex-1" style="min-width:120px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:var(--violet-light);font-family:var(--font-heading)">${counts.submitted||0}</div>
          <div class="text-xs text-muted">Submitted</div>
        </div>
        <div class="card card-sm flex-1" style="min-width:120px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:var(--green);font-family:var(--font-heading)">${counts.accepted||0}</div>
          <div class="text-xs text-muted">Accepted</div>
        </div>
      </div>`;

    document.getElementById('tracker-table-wrap').innerHTML = renderTable(data);
  }

  function openAddModal() {
    editingId = null;
    document.getElementById('tracker-modal-title').textContent = 'Add Scholarship';
    document.getElementById('tracker-form').reset();
    document.getElementById('modal-field-match').value = '80';
    openModal('tracker-modal');
  }

  function openEditModal(id) {
    const scholarships = AppState.getScholarships();
    const s = scholarships.find(x => x.id === id);
    if (!s) return;
    editingId = id;
    document.getElementById('tracker-modal-title').textContent = 'Edit Scholarship';
    document.getElementById('modal-name').value = s.name || '';
    document.getElementById('modal-university').value = s.university || '';
    document.getElementById('modal-country').value = s.country || '';
    document.getElementById('modal-region').value = s.region || 'Europe';
    document.getElementById('modal-funding').value = s.fundingType || 'Full Funding';
    document.getElementById('modal-deadline').value = s.deadline || '';
    document.getElementById('modal-status').value = s.status || 'researching';
    document.getElementById('modal-url').value = s.url || '';
    document.getElementById('modal-field-match').value = s.fieldMatch || 80;
    document.getElementById('modal-notes').value = s.notes || '';
    document.getElementById('modal-requirements').value = s.requirements || '';
    openModal('tracker-modal');
  }

  function saveScholarship() {
    const scholarships = AppState.getScholarships();
    const data = {
      id: editingId || `s_${Date.now()}`,
      name:         document.getElementById('modal-name').value.trim(),
      university:   document.getElementById('modal-university').value.trim(),
      country:      document.getElementById('modal-country').value.trim(),
      region:       document.getElementById('modal-region').value,
      fundingType:  document.getElementById('modal-funding').value,
      deadline:     document.getElementById('modal-deadline').value,
      status:       document.getElementById('modal-status').value,
      url:          document.getElementById('modal-url').value.trim(),
      fieldMatch:   parseInt(document.getElementById('modal-field-match').value) || 80,
      notes:        document.getElementById('modal-notes').value.trim(),
      requirements: document.getElementById('modal-requirements').value.trim(),
    };

    if (!data.name) { showToast('Please enter a scholarship name', 'error'); return; }

    if (editingId) {
      const idx = scholarships.findIndex(x => x.id === editingId);
      if (idx !== -1) scholarships[idx] = data;
    } else {
      scholarships.push(data);
    }

    AppState.saveScholarships(scholarships);
    closeModal('tracker-modal');
    render();
    showToast(editingId ? 'Scholarship updated!' : 'Scholarship added!', 'success');
  }

  function deleteScholarship(id) {
    if (!confirm('Delete this scholarship?')) return;
    const updated = AppState.getScholarships().filter(s => s.id !== id);
    AppState.saveScholarships(updated);
    render();
    showToast('Scholarship removed', 'info');
  }

  function setFilter(type, value) {
    if (type === 'status') filterStatus = value;
    if (type === 'region') filterRegion = value;
    if (type === 'search') searchQuery = value;
    render();
  }

  function init() {
    // Search input
    const search = document.getElementById('tracker-search');
    if (search) search.addEventListener('input', e => setFilter('search', e.target.value));

    // Status filter
    const statusFilter = document.getElementById('tracker-status-filter');
    if (statusFilter) statusFilter.addEventListener('change', e => setFilter('status', e.target.value));

    // Region filter
    const regionFilter = document.getElementById('tracker-region-filter');
    if (regionFilter) regionFilter.addEventListener('change', e => setFilter('region', e.target.value));
  }

  return { init, render, openAddModal, openEditModal, saveScholarship, deleteScholarship, setFilter };
})();
