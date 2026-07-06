/* ============================================================
   Settings View
   ============================================================ */

const SettingsView = (() => {
  function render() {
    const profile = AppState.getProfile();
    const apiKey  = localStorage.getItem('mentorapp_api_key') || '';

    document.getElementById('settings-content').innerHTML = `
      <!-- Profile Section -->
      <div class="settings-section">
        <div class="settings-section-title">👤 Your Profile</div>
        <div class="card">
          <div class="flex items-center gap-4 mb-6">
            <div class="profile-avatar-big">🎓</div>
            <div>
              <div style="font-family:var(--font-heading);font-size:20px;font-weight:700">${profile.name || 'Set your name'}</div>
              <div class="text-sm text-muted">${profile.currentDegree || 'Update your profile'}</div>
              <div class="text-xs text-muted" style="margin-top:2px">Targeting: ${profile.targetRegions || 'N/A'}</div>
            </div>
          </div>
          <div class="grid-2" style="margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="profile-name" type="text" value="${profile?.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Current Degree</label>
              <input class="form-input" id="profile-current-degree" type="text" value="${profile?.currentDegree || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Target Degree</label>
              <input class="form-input" id="profile-target-degree" type="text" value="${profile?.targetDegree || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Field of Study</label>
              <input class="form-input" id="profile-field" type="text" value="${profile?.field || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Research Interests</label>
              <input class="form-input" id="profile-research" type="text" value="${profile?.research || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Target Regions</label>
              <input class="form-input" id="profile-regions" type="text" value="${profile?.targetRegions || ''}">
            </div>
            <div class="form-group" style="grid-column: 1 / -1">
              <label class="form-label">Target Scholarships</label>
              <input class="form-input" id="profile-scholarships" type="text" value="${profile?.scholarships || ''}">
            </div>
          </div>
          <button class="btn btn-primary" onclick="SettingsView.saveProfile()">💾 Save Profile</button>
        </div>
      </div>



      <!-- Scholarship Data -->
      <div class="settings-section">
        <div class="settings-section-title">🗃️ Data Management</div>
        <div class="card">
          <div class="grid-2">
            <div>
              <div style="font-size:14px;font-weight:600;margin-bottom:6px">Export Data</div>
              <div class="text-sm text-muted" style="margin-bottom:12px">Download all your scholarship and checklist data as JSON</div>
              <button class="btn btn-secondary" onclick="SettingsView.exportData()">📥 Export JSON</button>
            </div>
            <div>
              <div style="font-size:14px;font-weight:600;margin-bottom:6px;color:var(--red)">Reset Data</div>
              <div class="text-sm text-muted" style="margin-bottom:12px">⚠️ This will clear ALL app data including scholarships, reviews, and chat history</div>
              <button class="btn btn-danger" onclick="SettingsView.resetAllData()">⚠️ Reset Everything</button>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section-title">ℹ️ About</div>
        <div class="card">
          <div class="flex items-center gap-4">
            <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--violet),var(--cyan));border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:28px">🎓</div>
            <div>
              <div style="font-family:var(--font-heading);font-size:18px;font-weight:700">PhD Scholar Mentor</div>
              <div class="text-sm text-muted">Version 1.0 · Designed by Engr. Jose</div>
              <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
                <span class="badge badge-violet">Agricultural Engineering</span>
                <span class="badge badge-cyan">Renewable Energy</span>
                <span class="badge badge-gold">AI Research</span>
                <span class="badge badge-green">Europe • USA • UK</span>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="text-sm text-muted" style="line-height:1.7">
            This app is your personal PhD scholarship companion — helping you organize your documents, track opportunities, and leverage AI to put forward the strongest possible application. 
            Your interdisciplinary expertise in Renewable Energy + AI is a genuine competitive advantage. Use it!
          </div>
        </div>
      </div>`;
  }

  function saveProfile() {
    const profile = {
      name:          document.getElementById('profile-name').value.trim(),
      currentDegree: document.getElementById('profile-current-degree').value.trim(),
      targetDegree:  document.getElementById('profile-target-degree').value.trim(),
      field:         document.getElementById('profile-field').value.trim(),
      research:      document.getElementById('profile-research').value.trim(),
      targetRegions: document.getElementById('profile-regions').value.trim(),
      scholarships:  document.getElementById('profile-scholarships').value.trim(),
    };
    AppState.saveProfile(profile);
    // Update sidebar name
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl && profile.name) nameEl.textContent = profile.name;
    showToast('Profile saved! ✅', 'success');
  }

  function toggleApiKeyVisibility() {
    const input = document.getElementById('api-key-input');
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  function exportData() {
    const data = {
      profile:      AppState.getProfile(),
      scholarships: AppState.getScholarships(),
      checklist:    AppState.getChecklist(),
      reviews:      AppState.getReviews(),
      exportDate:   new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `phd-mentor-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported! 📥', 'success');
  }

  function resetAllData() {
    if (!confirm('⚠️ This will delete ALL data. Are you absolutely sure?')) return;
    if (!confirm('Last chance — all scholarships, reviews, and progress will be lost.')) return;
    Object.values(AppState.KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('mentorapp_api_key');
    showToast('All data reset. Refreshing...', 'info');
    setTimeout(() => location.reload(), 1500);
  }

  function init() {}

  return { init, render, saveProfile, exportData, resetAllData, toggleApiKeyVisibility };
})();
