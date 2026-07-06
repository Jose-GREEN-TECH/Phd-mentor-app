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
              <div class="text-sm text-muted">${profile.degree}</div>
              <div class="text-xs text-muted" style="margin-top:2px">Targeting: ${profile.targetRegions}</div>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="profile-name" type="text" value="${profile.name || ''}" placeholder="Your full name">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-input" id="profile-email" type="email" value="${profile.email || ''}" placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Current Degree</label>
              <input class="form-input" id="profile-degree" type="text" value="${profile.degree || ''}" placeholder="MSc Agricultural & Biosystem Engineering">
            </div>
            <div class="form-group">
              <label class="form-label">BSc Degree</label>
              <input class="form-input" id="profile-bsc" type="text" value="${profile.bsc || ''}" placeholder="BSc Electrical & Electronic Engineering">
            </div>
            <div class="form-group">
              <label class="form-label">Research Field / Specialization</label>
              <input class="form-input" id="profile-field" type="text" value="${profile.field || ''}" placeholder="Renewable Energy & AI">
            </div>
            <div class="form-group">
              <label class="form-label">Target Regions</label>
              <input class="form-input" id="profile-regions" type="text" value="${profile.targetRegions || ''}" placeholder="Europe, USA, UK">
            </div>
          </div>
          <button class="btn btn-primary" onclick="SettingsView.saveProfile()">💾 Save Profile</button>
        </div>
      </div>

      <!-- API Key Section -->
      <div class="settings-section">
        <div class="settings-section-title">🔑 Gemini API Key &amp; Model</div>
        <div class="card">

          <!-- Quota troubleshooting box -->
          <div style="margin-bottom:16px;padding:16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.35);border-radius:var(--radius-md)">
            <div style="font-size:13px;font-weight:700;color:var(--gold-light);margin-bottom:8px">⚠️ Getting a quota error? Follow these steps:</div>
            <ol style="font-size:12px;color:var(--text-secondary);line-height:1.9;padding-left:18px;margin:0">
              <li>Make sure you selected <strong style="color:var(--gold-light)">Gemini 1.5 Flash</strong> as your model (it has the most generous free tier)</li>
              <li>Go to <a href="https://ai.dev/rate-limit" target="_blank" style="color:var(--cyan)">ai.dev/rate-limit</a> to check your current usage</li>
              <li>If limits are 0, your project may need <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--cyan)">billing enabled</a> — or create a new project &amp; new API key</li>
              <li>Free tier allows ~15 requests/min and 1M tokens/day on <strong style="color:var(--gold-light)">gemini-1.5-flash</strong></li>
            </ol>
          </div>

          <!-- Model selector -->
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:6px">
              <label class="form-label" style="margin-bottom:0">AI Model <span style="color:var(--text-muted);font-weight:400">(select based on your quota)</span></label>
              <button class="btn btn-sm btn-secondary" onclick="SettingsView.loadModelsFromApi()" id="fetch-models-btn">🔄 Fetch Available Models</button>
            </div>
            <select class="form-select" id="model-select" onchange="SettingsView.changeModel(this.value)">
              ${GeminiAPI.AVAILABLE_MODELS.map(m =>
                `<option value="${m.id}" ${GeminiAPI.getModel() === m.id ? 'selected' : ''}>${m.label}</option>`
              ).join('')}
            </select>
            <div class="text-xs text-muted" style="margin-top:6px">✅ If you see "Model not found", click <strong>Fetch Available Models</strong> to see what your key supports.</div>
          </div>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">API Key — get yours free at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--cyan)">Google AI Studio</a></label>
            <div class="api-key-input-wrap">
              <input class="form-input" id="api-key-input" type="password"
                     value="${apiKey}" placeholder="AIza...">
              <button class="api-key-toggle" onclick="SettingsView.toggleApiKeyVisibility()" id="api-key-toggle-btn">👁️</button>
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="SettingsView.saveApiKey()">🔑 Save API Key</button>
            <button class="btn btn-secondary" onclick="SettingsView.testApiKey()">🧪 Test Connection</button>
            ${apiKey ? `<button class="btn btn-danger" onclick="SettingsView.clearApiKey()">🗑️ Clear Key</button>` : ''}
          </div>
          ${apiKey ? `
            <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
              <span style="color:var(--green)">✅</span>
              <span class="text-sm text-muted">API key configured · Model: <strong style="color:var(--violet-light)">${GeminiAPI.getModel()}</strong></span>
            </div>` : `
            <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
              <span style="color:var(--gold)">⚠️</span>
              <span class="text-sm text-muted">No API key. Document review and chat features require a key.</span>
            </div>`}
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
      email:         document.getElementById('profile-email').value.trim(),
      degree:        document.getElementById('profile-degree').value.trim(),
      bsc:           document.getElementById('profile-bsc').value.trim(),
      field:         document.getElementById('profile-field').value.trim(),
      targetRegions: document.getElementById('profile-regions').value.trim(),
    };
    AppState.saveProfile(profile);
    // Update sidebar name
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl && profile.name) nameEl.textContent = profile.name;
    showToast('Profile saved! ✅', 'success');
  }

  function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) { showToast('Please enter an API key', 'error'); return; }
    localStorage.setItem('mentorapp_api_key', key);
    showToast('API key saved! 🔑', 'success');
    render();
  }

  function clearApiKey() {
    if (!confirm('Remove the API key? AI features will be disabled.')) return;
    localStorage.removeItem('mentorapp_api_key');
    showToast('API key removed', 'info');
    render();
  }

  async function testApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) { showToast('Enter your API key first', 'error'); return; }
    localStorage.setItem('mentorapp_api_key', key);

    showToast('Testing connection...', 'info');
    try {
      const result = await GeminiAPI.generate('Say "Hello, PhD Scholar! Connection successful!" in exactly those words.');
      if (result.includes('Hello')) {
        showToast(`✅ Connected! Using ${GeminiAPI.getModel()}. AI features are ready.`, 'success', 4000);
        render();
      } else {
        showToast('API responded. Key is working!', 'success');
      }
    } catch (err) {
      if (err.message === 'QUOTA_EXCEEDED') {
        showToast('❌ Quota exceeded! Switch to "Gemini 1.5 Flash" in the model dropdown above and try again.', 'error', 6000);
      } else {
        showToast(`Connection failed: ${err.message}`, 'error', 5000);
      }
    }
  }

  function changeModel(modelId) {
    GeminiAPI.setModel(modelId);
    showToast(`Model switched to ${modelId} ✅`, 'success');
    // Re-render to update status line
    render();
  }

  async function loadModelsFromApi() {
    const btn = document.getElementById('fetch-models-btn');
    if (btn) btn.innerHTML = '<div class="spinner"></div> Fetching...';
    try {
      const models = await GeminiAPI.fetchModels();
      if (models.length === 0) {
        showToast('No chat models found for this API key.', 'warning');
        return;
      }
      
      const select = document.getElementById('model-select');
      const current = GeminiAPI.getModel();
      const hasCurrent = models.some(m => m.id === current);
      const targetModel = hasCurrent ? current : models[0].id;
      
      select.innerHTML = models.map(m =>
        `<option value="${m.id}" ${targetModel === m.id ? 'selected' : ''}>${m.label} (${m.id})</option>`
      ).join('');
      
      if (!hasCurrent) {
        GeminiAPI.setModel(targetModel);
        showToast(`Auto-switched to supported model: ${targetModel}`, 'info');
      } else {
        showToast('Available models loaded successfully!', 'success');
      }
      
      // Update global available models if needed (optional)
      GeminiAPI.AVAILABLE_MODELS.length = 0;
      models.forEach(m => GeminiAPI.AVAILABLE_MODELS.push(m));
      
      // Re-render the bottom status string manually to avoid resetting the whole view
      const statusEl = document.querySelector('.card > div:last-child');
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="color:var(--green)">✅</span>
          <span class="text-sm text-muted">API key configured · Model: <strong style="color:var(--violet-light)">${targetModel}</strong></span>`;
      }
    } catch (err) {
      showToast(err.message === 'NO_KEY' ? 'Please enter an API key first' : `Failed to load models: ${err.message}`, 'error');
    } finally {
      if (btn) btn.innerHTML = '🔄 Fetch Available Models';
    }
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

  return { init, render, saveProfile, saveApiKey, clearApiKey, testApiKey, toggleApiKeyVisibility, exportData, resetAllData, changeModel, loadModelsFromApi };
})();
