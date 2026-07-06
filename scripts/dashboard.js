/* ============================================================
   Dashboard View
   ============================================================ */

const DashboardView = (() => {
  const QUOTES = [
    "The secret of getting ahead is getting started. — Mark Twain",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
    "Education is the passport to the future. — Malcolm X",
    "A PhD is not just a degree; it is a commitment to advancing human knowledge.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Research is what I'm doing when I don't know what I'm doing. — Wernher von Braun",
    "Science knows no country, because knowledge belongs to humanity. — Louis Pasteur",
    "Your renewable energy + AI expertise is exactly what the world needs. Now go get that PhD!"
  ];

  function getStats() {
    const scholarships = AppState.getScholarships();
    const checklist    = AppState.getChecklist();
    const reviews      = AppState.getReviews();

    const totalTasks = checklist.reduce((acc, p) => acc + p.tasks.length, 0);
    const doneTasks  = checklist.reduce((acc, p) => acc + p.tasks.filter(t => t.done).length, 0);
    const progress   = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const applied = scholarships.filter(s => ['submitted','accepted','rejected'].includes(s.status)).length;
    const reviewCount = Object.keys(reviews).length;

    return { total: scholarships.length, applied, progress, reviewCount, doneTasks, totalTasks };
  }

  function getUpcomingDeadlines() {
    const scholarships = AppState.getScholarships();
    const now = new Date();
    return scholarships
      .filter(s => s.deadline && s.status !== 'rejected' && s.status !== 'accepted')
      .map(s => ({ ...s, daysLeft: Math.ceil((new Date(s.deadline) - now) / 86400000) }))
      .filter(s => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }

  function getKanban() {
    const scholarships = AppState.getScholarships();
    const statuses = { researching: [], drafting: [], submitted: [], result: [] };
    scholarships.forEach(s => {
      const group = s.status === 'accepted' || s.status === 'rejected' ? 'result' : (s.status || 'researching');
      if (statuses[group]) statuses[group].push(s);
    });
    return statuses;
  }

  function render() {
    const stats = getStats();
    const deadlines = getUpcomingDeadlines();
    const kanban = getKanban();
    const profile = AppState.getProfile();
    const name = profile.name ? profile.name.split(' ')[0] : 'Scholar';
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const reviews = AppState.getReviews();

    document.getElementById('dashboard-content').innerHTML = `
      <!-- Hero -->
      <div class="dashboard-hero">
        <div style="position:relative;z-index:1">
          <div class="hero-greeting">Welcome back, <span>${name}</span> 👋</div>
          <p class="hero-sub">Your PhD scholarship journey is <strong style="color:var(--violet-light)">${stats.progress}% complete</strong>. 
          You're targeting <strong>${stats.total} scholarships</strong> in Europe, USA, and UK. Keep pushing — your Renewable Energy + AI expertise is a unique advantage!</p>
          <div style="margin-top:14px;">
            <div class="flex items-center gap-3" style="max-width:500px">
              <div class="progress-bar flex-1" style="height:8px">
                <div class="progress-fill" style="width:${stats.progress}%"></div>
              </div>
              <span class="text-sm text-muted">${stats.doneTasks}/${stats.totalTasks} tasks</span>
            </div>
          </div>
          <div class="hero-quote">💬 "${quote}"</div>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" onclick="Router.navigate('documents')">📄 Review a Document</button>
            <button class="btn btn-secondary btn-lg" onclick="Router.navigate('chat')">💬 Ask Dr. Scholar</button>
            <button class="btn btn-gold" onclick="Router.navigate('checklist')">✅ View Roadmap</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4 mb-8">
        <div class="stat-card violet">
          <div class="stat-icon violet">🎓</div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Scholarships Tracked</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-icon cyan">🚀</div>
          <div class="stat-value">${stats.applied}</div>
          <div class="stat-label">Applications Submitted</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-icon gold">📋</div>
          <div class="stat-value">${stats.reviewCount}</div>
          <div class="stat-label">Documents Reviewed</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon green">✅</div>
          <div class="stat-value">${stats.progress}%</div>
          <div class="stat-label">Overall Progress</div>
        </div>
      </div>

      <!-- Deadlines + Kanban -->
      <div class="grid-2 mb-8">
        <!-- Deadlines -->
        <div class="card">
          <div class="card-title"><span class="icon">📅</span> Upcoming Deadlines</div>
          ${deadlines.length === 0 ? `
            <div class="empty-state" style="padding:30px 0">
              <div class="empty-state-icon">📅</div>
              <div class="empty-state-desc">No upcoming deadlines. Add scholarships to track!</div>
            </div>` : deadlines.map(s => {
            const d = new Date(s.deadline);
            const urgent = s.daysLeft <= 30;
            return `
              <div class="deadline-item ${urgent ? 'deadline-urgent' : ''}" style="cursor:pointer" onclick="Router.navigate('tracker')">
                <div class="deadline-date">
                  <div class="day">${d.getDate()}</div>
                  <div class="month">${d.toLocaleDateString('en', {month:'short'})} '${String(d.getFullYear()).slice(-2)}</div>
                </div>
                <div class="deadline-info">
                  <div class="deadline-name">${s.name}</div>
                  <div class="deadline-meta">${s.country} · ${s.fundingType}</div>
                </div>
                <div>
                  <span class="badge ${urgent ? 'badge-red' : s.daysLeft <= 60 ? 'badge-gold' : 'badge-gray'}">${s.daysLeft}d</span>
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- Kanban -->
        <div class="card">
          <div class="card-title"><span class="icon">🗂️</span> Application Board</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${Object.entries({researching:'🔍 Researching', drafting:'✍️ Drafting', submitted:'📤 Submitted', result:'🏆 Result'}).map(([k,label]) => `
              <div class="kanban-col">
                <div class="kanban-col-title">
                  <span>${label}</span>
                  <span class="badge badge-gray">${(kanban[k]||[]).length}</span>
                </div>
                ${(kanban[k]||[]).slice(0,3).map(s => `
                  <div class="kanban-card">
                    <div class="kanban-card-name truncate">${s.name.replace(/Scholarship|Program|Grant/gi,'').trim()}</div>
                    <div class="kanban-card-meta">${s.country}</div>
                  </div>`).join('')}
                ${(kanban[k]||[]).length > 3 ? `<div class="text-xs text-muted" style="padding:6px 12px">+${(kanban[k]||[]).length - 3} more</div>` : ''}
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Reviews + Quick Actions -->
      <div class="grid-2">
        <!-- Recent Doc Reviews -->
        <div class="card">
          <div class="card-title"><span class="icon">📝</span> Document Review Status</div>
          ${['cv','sop','motivation','recommendation','proposal'].map(type => {
            const names = {cv:'CV / Resume', sop:'Statement of Purpose', motivation:'Motivation Letter', recommendation:'Recommendation Letter', proposal:'Research Proposal'};
            const icons = {cv:'👤', sop:'📋', motivation:'💌', recommendation:'🤝', proposal:'🔬'};
            const rev = reviews[type];
            return `
              <div class="flex items-center gap-12 justify-between" style="padding:10px 0;border-bottom:1px solid var(--border)">
                <div class="flex items-center gap-3">
                  <span style="font-size:18px">${icons[type]}</span>
                  <span class="text-sm font-bold">${names[type]}</span>
                </div>
                <div class="flex items-center gap-2">
                  ${rev ? `
                    <span class="badge ${rev.score >= 80 ? 'badge-green' : rev.score >= 60 ? 'badge-gold' : 'badge-red'}">${rev.score}/100</span>
                    <span class="badge ${rev.score >= 80 ? 'badge-green' : rev.score >= 60 ? 'badge-gold' : 'badge-red'}">${rev.grade}</span>
                  ` : `<span class="badge badge-gray">Not Reviewed</span>`}
                  <button class="btn btn-sm btn-secondary" onclick="Router.navigate('documents')">${rev ? '🔄 Re-review' : '📤 Upload'}</button>
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-title"><span class="icon">⚡</span> Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-secondary w-full" style="justify-content:flex-start;gap:14px" onclick="Router.navigate('documents')">
              <span style="font-size:22px">📄</span>
              <div style="text-align:left">
                <div class="font-bold" style="font-size:13px">Review a Document</div>
                <div class="text-xs text-muted">AI-powered feedback on your CV, SOP, and more</div>
              </div>
            </button>
            <button class="btn btn-secondary w-full" style="justify-content:flex-start;gap:14px" onclick="Router.navigate('tracker');TrackerView.openAddModal()">
              <span style="font-size:22px">➕</span>
              <div style="text-align:left">
                <div class="font-bold" style="font-size:13px">Add a Scholarship</div>
                <div class="text-xs text-muted">Track new opportunities and deadlines</div>
              </div>
            </button>
            <button class="btn btn-secondary w-full" style="justify-content:flex-start;gap:14px" onclick="Router.navigate('chat')">
              <span style="font-size:22px">💬</span>
              <div style="text-align:left">
                <div class="font-bold" style="font-size:13px">Chat with Dr. Scholar</div>
                <div class="text-xs text-muted">Ask about scholarships, supervisors, and strategy</div>
              </div>
            </button>
            <button class="btn btn-secondary w-full" style="justify-content:flex-start;gap:14px" onclick="Router.navigate('checklist')">
              <span style="font-size:22px">✅</span>
              <div style="text-align:left">
                <div class="font-bold" style="font-size:13px">Update Your Roadmap</div>
                <div class="text-xs text-muted">Mark tasks done and track your progress</div>
              </div>
            </button>
            <button class="btn btn-secondary w-full" style="justify-content:flex-start;gap:14px" onclick="Router.navigate('settings')">
              <span style="font-size:22px">🔑</span>
              <div style="text-align:left">
                <div class="font-bold" style="font-size:13px">Configure Gemini API</div>
                <div class="text-xs text-muted">Add your API key to unlock AI features</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    // Intentionally empty — render is called by router
  }

  return { init, render };
})();
