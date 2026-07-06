/* ============================================================
   Deadline Calendar View
   ============================================================ */

const CalendarView = (() => {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let currentYear  = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  function getDeadlineMap() {
    const scholarships = AppState.getScholarships();
    const map = {};
    scholarships.forEach(s => {
      if (!s.deadline) return;
      const d = new Date(s.deadline);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }

  function getDotColor(status) {
    const colors = { researching:'gray', drafting:'cyan', submitted:'gold', accepted:'green', rejected:'red', waitlist:'gold' };
    return colors[status] || 'gray';
  }

  function render() {
    const deadlineMap = getDeadlineMap();
    const now = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev  = new Date(currentYear, currentMonth, 0).getDate();

    // Get upcoming deadlines (next 90 days)
    const allScholarships = AppState.getScholarships();
    const upcoming = allScholarships
      .filter(s => s.deadline)
      .map(s => ({ ...s, daysLeft: Math.ceil((new Date(s.deadline) - now) / 86400000) }))
      .filter(s => s.daysLeft >= 0 && s.daysLeft <= 90)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    document.getElementById('calendar-content').innerHTML = `
      <div class="grid-2" style="gap:24px;align-items:start">
        <!-- Calendar -->
        <div class="card">
          <div class="calendar-header">
            <div class="cal-month">${MONTHS[currentMonth]} ${currentYear}</div>
            <div class="calendar-nav">
              <button class="cal-btn" onclick="CalendarView.prevMonth()">◀</button>
              <button class="cal-btn" onclick="CalendarView.goToday()">Today</button>
              <button class="cal-btn" onclick="CalendarView.nextMonth()">▶</button>
            </div>
          </div>

          <div class="calendar-grid">
            ${DAYS.map(d => `<div class="cal-day-label">${d}</div>`).join('')}

            ${/* Previous month trailing days */ Array.from({length: firstDay}, (_, i) => {
              const d = daysInPrev - firstDay + 1 + i;
              return `<div class="cal-day other-month"><div class="cal-day-num">${d}</div></div>`;
            }).join('')}

            ${/* Current month days */ Array.from({length: daysInMonth}, (_, i) => {
              const d = i + 1;
              const key = `${currentYear}-${currentMonth}-${d}`;
              const items = deadlineMap[key] || [];
              const isToday = now.getFullYear() === currentYear && now.getMonth() === currentMonth && now.getDate() === d;
              return `
                <div class="cal-day ${isToday ? 'today' : ''}" ${items.length ? `onclick="CalendarView.showDayModal(${currentYear},${currentMonth},${d})"` : ''} style="${items.length ? 'cursor:pointer' : ''}">
                  <div class="cal-day-num">${d}</div>
                  ${items.length ? `
                    <div class="cal-dots">
                      ${items.slice(0,3).map(s => `<div class="cal-dot ${getDotColor(s.status)}" title="${s.name}"></div>`).join('')}
                      ${items.length > 3 ? `<div class="cal-dot gray"></div>` : ''}
                    </div>` : ''}
                </div>`;
            }).join('')}

            ${/* Next month leading days */ (() => {
              const total = firstDay + daysInMonth;
              const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
              return Array.from({length: remaining}, (_, i) => `<div class="cal-day other-month"><div class="cal-day-num">${i+1}</div></div>`).join('');
            })()}
          </div>

          <!-- Legend -->
          <div style="display:flex;gap:16px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap">
            <div class="flex items-center gap-2"><div class="cal-dot red"></div><span class="text-xs text-muted">Rejected</span></div>
            <div class="flex items-center gap-2"><div class="cal-dot gold"></div><span class="text-xs text-muted">Drafting/Waitlist</span></div>
            <div class="flex items-center gap-2"><div class="cal-dot cyan"></div><span class="text-xs text-muted">Researching</span></div>
            <div class="flex items-center gap-2"><div class="cal-dot green"></div><span class="text-xs text-muted">Accepted</span></div>
          </div>
        </div>

        <!-- Upcoming Deadlines List -->
        <div class="card">
          <div class="card-title"><span class="icon">⏰</span> Next 90 Days</div>
          ${upcoming.length === 0 ? `
            <div class="empty-state" style="padding:30px 0">
              <div class="empty-state-icon">🎉</div>
              <div class="empty-state-title">No urgent deadlines</div>
              <div class="empty-state-desc">All caught up! Add scholarships to track their deadlines.</div>
            </div>` :
            upcoming.map(s => {
              const d = new Date(s.deadline);
              const urgent = s.daysLeft <= 14;
              const soon   = s.daysLeft <= 30;
              return `
                <div class="deadline-item ${urgent ? 'deadline-urgent' : ''}">
                  <div class="deadline-date" style="${urgent ? 'border-color:rgba(239,68,68,0.5)' : soon ? 'border-color:rgba(245,158,11,0.4)' : ''}">
                    <div class="day" style="${urgent ? 'color:var(--red)' : soon ? 'color:var(--gold)' : ''}">${d.getDate()}</div>
                    <div class="month">${d.toLocaleDateString('en',{month:'short'})}</div>
                  </div>
                  <div class="deadline-info">
                    <div class="deadline-name">${s.name}</div>
                    <div class="deadline-meta">${s.country} · ${s.fundingType}</div>
                  </div>
                  <div style="text-align:right">
                    <span class="badge ${urgent ? 'badge-red' : soon ? 'badge-gold' : 'badge-gray'}">${s.daysLeft}d</span>
                    <button class="btn btn-secondary btn-sm" style="margin-top:4px;padding:2px 8px;font-size:11px" onclick="App.addToCalendar('${s.name.replace(/'/g, "\\'")}', '${s.deadline}', '${(s.url||'').replace(/'/g, "\\'")}')" title="Add Reminder to Calendar">📅 Sync</button>
                  </div>
                </div>`;
            }).join('')
          }
          ${upcoming.length > 0 ? `
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
              <button class="btn btn-secondary w-full" onclick="Router.navigate('tracker')">View All Scholarships →</button>
            </div>` : ''}
        </div>
      </div>

      <!-- Day Modal -->
      <div class="modal-overlay" id="day-modal">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title" id="day-modal-title">Deadlines on this day</div>
            <button class="modal-close" onclick="closeModal('day-modal')">✕</button>
          </div>
          <div id="day-modal-content"></div>
        </div>
      </div>`;
  }

  function showDayModal(year, month, day) {
    const key = `${year}-${month}-${day}`;
    const map = getDeadlineMap();
    const items = map[key] || [];
    const d = new Date(year, month, day);

    document.getElementById('day-modal-title').textContent =
      d.toLocaleDateString('en', {weekday:'long', month:'long', day:'numeric', year:'numeric'});

    document.getElementById('day-modal-content').innerHTML = items.length === 0
      ? '<div class="empty-state" style="padding:20px 0">No deadlines on this day</div>'
      : items.map(s => `
          <div style="padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:10px">
            <div style="font-weight:700;font-size:15px;margin-bottom:4px">${s.name}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">${s.university} · ${s.country}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span class="badge badge-violet">${s.fundingType}</span>
              <span class="badge ${s.status === 'accepted' ? 'badge-green' : s.status === 'rejected' ? 'badge-red' : 'badge-gray'}">${s.status}</span>
            </div>
            ${s.notes ? `<div style="margin-top:10px;font-size:12px;color:var(--text-muted);line-height:1.5">${s.notes}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:10px">
              ${s.url ? `<a href="${s.url}" target="_blank" class="btn btn-sm btn-secondary">🔗 Open Portal</a>` : ''}
              <button class="btn btn-sm btn-secondary" onclick="App.addToCalendar('${s.name.replace(/'/g, "\\'")}', '${s.deadline}', '${(s.url||'').replace(/'/g, "\\'")}')">📅 Sync to Calendar</button>
            </div>
          </div>`).join('');

    openModal('day-modal');
  }

  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    render();
  }
  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    render();
  }
  function goToday() {
    currentYear  = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    render();
  }

  function init() {}

  return { init, render, prevMonth, nextMonth, goToday, showDayModal };
})();
