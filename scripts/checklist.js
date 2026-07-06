/* ============================================================
   Checklist / Roadmap View
   ============================================================ */

const ChecklistView = (() => {
  function getProgress(phase) {
    const done = phase.tasks.filter(t => t.done).length;
    return { done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
  }

  function getOverallProgress() {
    const checklist = AppState.getChecklist();
    const total = checklist.reduce((a, p) => a + p.tasks.length, 0);
    const done  = checklist.reduce((a, p) => a + p.tasks.filter(t => t.done).length, 0);
    return { done, total, pct: Math.round((done / total) * 100) };
  }

  function phaseStatus(phase) {
    const { done, total } = getProgress(phase);
    if (done === total) return 'completed';
    if (done > 0) return 'active';
    return 'pending';
  }

  function render() {
    const checklist = AppState.getChecklist();
    const overall   = getOverallProgress();

    document.getElementById('checklist-overall').innerHTML = `
      <div class="card" style="margin-bottom:28px;background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(6,182,212,0.06));border-color:var(--border-accent)">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div style="font-family:var(--font-heading);font-size:22px;font-weight:700">PhD Application Roadmap</div>
            <div class="text-sm text-muted">Your step-by-step guide to securing a scholarship</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--font-heading);font-size:36px;font-weight:800;color:var(--violet-light)">${overall.pct}%</div>
            <div class="text-xs text-muted">${overall.done}/${overall.total} tasks done</div>
          </div>
        </div>
        <div class="progress-bar" style="height:10px">
          <div class="progress-fill" style="width:${overall.pct}%"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
          <span class="badge badge-green">✅ ${checklist.filter(p => phaseStatus(p) === 'completed').length} Phases Complete</span>
          <span class="badge badge-violet">🔄 ${checklist.filter(p => phaseStatus(p) === 'active').length} In Progress</span>
          <span class="badge badge-gray">⏳ ${checklist.filter(p => phaseStatus(p) === 'pending').length} Upcoming</span>
        </div>
      </div>`;

    document.getElementById('checklist-phases').innerHTML = checklist.map((phase, pi) => {
      const prog = getProgress(phase);
      const status = phaseStatus(phase);
      return `
        <div class="roadmap-phase">
          <!-- Phase Header -->
          <div class="phase-header ${status}" onclick="ChecklistView.togglePhase('phase-tasks-${phase.id}', this)">
            <div class="phase-num">${status === 'completed' ? '✓' : phase.icon || (pi + 1)}</div>
            <div class="phase-title-wrap">
              <div class="phase-name">${phase.name}</div>
              <div class="phase-desc">${phase.desc}</div>
            </div>
            <div style="text-align:right;min-width:80px">
              <span class="badge ${status === 'completed' ? 'badge-green' : status === 'active' ? 'badge-violet' : 'badge-gray'}">${prog.done}/${prog.total}</span>
              <div style="margin-top:6px">
                <div class="progress-bar" style="width:80px">
                  <div class="progress-fill" style="width:${prog.pct}%"></div>
                </div>
              </div>
            </div>
            <div style="color:var(--text-muted);font-size:18px;transition:transform 0.2s" id="phase-chevron-${phase.id}">▸</div>
          </div>

          <!-- Phase Tasks -->
          <div class="phase-tasks" id="phase-tasks-${phase.id}" style="display:${status !== 'pending' ? 'block' : 'none'}">
            ${phase.tasks.map(task => `
              <div class="task-item ${task.done ? 'done' : ''}" onclick="ChecklistView.toggleTask('${phase.id}','${task.id}')">
                <div class="task-checkbox">${task.done ? '✓' : ''}</div>
                <div class="task-text">
                  <div class="task-name ${task.done ? 'done-text' : ''}">${task.name}</div>
                  <div class="task-tip">💡 ${task.tip}</div>
                </div>
                ${task.tag ? `<div class="task-tag"><span class="tag">${task.tag}</span></div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function togglePhase(tasksId, headerEl) {
    const tasks = document.getElementById(tasksId);
    const phaseId = tasksId.replace('phase-tasks-', '');
    const chevron = document.getElementById(`phase-chevron-${phaseId}`);
    const isOpen = tasks.style.display !== 'none';
    tasks.style.display = isOpen ? 'none' : 'block';
    if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
  }

  function toggleTask(phaseId, taskId) {
    const checklist = AppState.getChecklist();
    const phase = checklist.find(p => p.id === phaseId);
    if (!phase) return;
    const task = phase.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.done = !task.done;
    AppState.saveChecklist(checklist);
    render();

    if (task.done) {
      showToast(`✅ "${task.name.substring(0, 40)}..." marked complete!`, 'success');
    }
  }

  function resetAll() {
    if (!confirm('Reset all checklist progress? This cannot be undone.')) return;
    const checklist = AppState.getChecklist();
    checklist.forEach(p => p.tasks.forEach(t => t.done = false));
    AppState.saveChecklist(checklist);
    render();
    showToast('Checklist reset', 'info');
  }

  function init() {}

  return { init, render, togglePhase, toggleTask, resetAll };
})();
