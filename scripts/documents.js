/* ============================================================
   Document Review View
   ============================================================ */

const DocumentsView = (() => {
  const DOC_TYPES = [
    { id: 'cv',             icon: '👤', name: 'CV / Resume',           color: 'violet', desc: 'Academic curriculum vitae highlighting research and engineering experience' },
    { id: 'sop',            icon: '📋', name: 'Statement of Purpose',  color: 'cyan',   desc: 'Your research story and PhD motivation narrative' },
    { id: 'motivation',     icon: '💌', name: 'Motivation Letter',     color: 'gold',   desc: 'Personalised letter connecting your goals to the scholarship mission' },
    { id: 'recommendation', icon: '🤝', name: 'Recommendation Letter', color: 'green',  desc: 'Reference letter from professor or supervisor' },
    { id: 'proposal',       icon: '🔬', name: 'Research Proposal',     color: 'violet', desc: 'Your proposed PhD research plan and methodology' },
    { id: 'transcripts',    icon: '📊', name: 'Transcripts / Grades',  color: 'cyan',   desc: 'GPA summary and academic records overview' },
  ];

  let selectedDoc = null;

  function getScoreColor(score) {
    if (score >= 85) return 'var(--green)';
    if (score >= 70) return 'var(--gold)';
    return 'var(--red)';
  }

  function getScoreGradient(score) {
    if (score >= 85) return 'var(--green), #34d399';
    if (score >= 70) return 'var(--gold), var(--gold-light)';
    return 'var(--red), #f87171';
  }

  function renderScoreRing(score) {
    const r = 45, cx = 55, cy = 55;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = getScoreColor(score);
    return `
      <div class="score-ring">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
            style="transition:stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)"/>
        </svg>
        <div class="score-ring-value">
          <div class="score-ring-num" style="color:${color}">${score}</div>
          <div class="score-ring-label">/ 100</div>
        </div>
      </div>`;
  }

  function renderDocGrid() {
    const reviews = AppState.getReviews();
    return DOC_TYPES.map(d => {
      const rev = reviews[d.id];
      return `
        <div class="doc-type-card ${d.color} ${selectedDoc === d.id ? 'selected' : ''}"
             id="doc-card-${d.id}" onclick="DocumentsView.selectDoc('${d.id}')">
          ${rev ? `<div class="doc-has-review"><span class="badge badge-${rev.score >= 70 ? 'green' : 'gold'}">${rev.score}</span></div>` : ''}
          <div class="doc-type-icon">${d.icon}</div>
          <div class="doc-type-name">${d.name}</div>
          <div class="doc-type-desc">${d.desc}</div>
        </div>`;
    }).join('');
  }

  function renderReviewResults(review) {
    if (!review) return `
      <div class="empty-state">
        <div class="empty-state-icon">🤖</div>
        <div class="empty-state-title">Awaiting AI Review</div>
        <div class="empty-state-desc">Paste or upload your document on the left and click "Analyze with AI"</div>
      </div>`;

    return `
      <!-- Score + Grade -->
      <div class="flex items-center gap-20 mb-6" style="gap:20px;padding:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg)">
        <div class="score-ring-wrap">
          ${renderScoreRing(review.score)}
          <div class="text-sm font-bold text-muted">Overall Score</div>
        </div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span style="font-family:var(--font-heading);font-size:28px;font-weight:800;color:${getScoreColor(review.score)}">${review.grade}</span>
            <span class="badge ${review.score >= 85 ? 'badge-green' : review.score >= 70 ? 'badge-gold' : 'badge-red'}">${review.score >= 85 ? 'Excellent' : review.score >= 70 ? 'Good' : 'Needs Work'}</span>
          </div>
          <p style="font-size:13px;color:white;line-height:1.6">${review.summary}</p>
          <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">
            ${(review.keywords_missing || []).map(k => `<span class="tag">+${k}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="review-tabs">
        <div class="tab active" onclick="DocumentsView.switchTab('strengths',this)">💪 Strengths</div>
        <div class="tab" onclick="DocumentsView.switchTab('weaknesses',this)">⚠️ Weaknesses</div>
        <div class="tab" onclick="DocumentsView.switchTab('suggestions',this)">💡 Suggestions</div>
        <div class="tab" onclick="DocumentsView.switchTab('quickwins',this)">⚡ Quick Wins</div>
      </div>

      <div id="review-tab-content">
        <div id="tab-strengths">
          ${(review.strengths||[]).map(s => `
            <div class="feedback-item strength">
              <span class="feedback-item-icon">✅</span>
              <div><strong>${s.point}</strong><br><span style="color:white;line-height:1.5;display:inline-block;margin-top:4px">${s.detail}</span></div>
            </div>`).join('')}
        </div>
        <div id="tab-weaknesses" class="hidden">
          ${(review.weaknesses||[]).map(s => `
            <div class="feedback-item weakness">
              <span class="feedback-item-icon">❌</span>
              <div><strong>${s.point}</strong><br><span style="color:white;line-height:1.5;display:inline-block;margin-top:4px">${s.detail}</span></div>
            </div>`).join('')}
        </div>
        <div id="tab-suggestions" class="hidden">
          ${(review.suggestions||[]).map(s => `
            <div class="feedback-item suggestion">
              <span class="feedback-item-icon">💡</span>
              <div><strong>${s.point}</strong>
              ${s.example ? `<br><span style="color:white;font-style:italic;line-height:1.5;display:inline-block;margin-top:4px">${s.example}</span>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <div id="tab-quickwins" class="hidden">
          ${(review.quick_wins||[]).map((w,i) => `
            <div class="feedback-item" style="border-left-color:var(--cyan)">
              <span class="feedback-item-icon" style="color:var(--cyan)">${i+1}.</span>
              <div style="color:white;line-height:1.5">${w}</div>
            </div>`).join('')}
        </div>
      </div>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="text-xs text-muted">Reviewed ${review.timestamp ? new Date(review.timestamp).toLocaleString() : 'recently'}</div>
      </div>`;
  }

  function renderInputPanel(docId) {
    const doc = DOC_TYPES.find(d => d.id === docId);
    if (!doc) return '';
    const reviews = AppState.getReviews();
    const existing = reviews[docId];
    return `
      <div class="card" style="height:fit-content">
        <div class="card-title"><span class="icon">${doc.icon}</span> ${doc.name}</div>

        <!-- Upload Area -->
        <div class="upload-area mb-4" id="upload-area-${docId}"
             ondragover="DocumentsView.dragOver(event)" ondragleave="DocumentsView.dragLeave(event)"
             ondrop="DocumentsView.dropFile(event,'${docId}')" onclick="document.getElementById('file-input-${docId}').click()">
          <div class="upload-icon">📁</div>
          <div class="upload-text">Drop your file here or click to browse</div>
          <div class="upload-hint">Supports .pdf, .docx, .txt — or paste text below</div>
          <input type="file" id="file-input-${docId}" style="display:none" accept=".pdf,.docx,.txt"
                 onchange="DocumentsView.handleFileUpload(event,'${docId}')">
        </div>

        <div class="form-group">
          <label class="form-label">Or paste your document text here</label>
          <textarea class="form-textarea" id="doc-text-${docId}" placeholder="Paste the full text of your ${doc.name} here..." style="min-height:220px">${existing ? '' : ''}</textarea>
        </div>

        <button class="btn btn-primary w-full" id="analyze-btn-${docId}"
                onclick="DocumentsView.analyze('${docId}')">
          <span>🤖</span> Analyze with AI
        </button>

        ${existing ? `
          <div style="margin-top:12px;padding:10px 14px;background:var(--bg-card);border-radius:var(--radius-md);border:1px solid var(--border)">
            <div class="text-xs text-muted">Last review: ${new Date(existing.timestamp).toLocaleDateString()} — Score: <span class="text-violet">${existing.score}/100</span></div>
          </div>` : ''}

        <div style="margin-top:16px;padding:14px;background:rgba(124,58,237,0.06);border:1px solid var(--border-accent);border-radius:var(--radius-md)">
          <div style="font-size:12px;font-weight:600;color:var(--violet-light);margin-bottom:6px">💡 Tips for best results</div>
          <ul style="font-size:12px;color:var(--text-muted);line-height:1.7;padding-left:14px">
            <li>Paste the complete document, not just excerpts</li>
            <li>Include all sections (even personal info headers)</li>
            <li>For recommendation letters, include both the content and closing</li>
          </ul>
        </div>
      </div>`;
  }

  function selectDoc(docId) {
    selectedDoc = docId;
    const reviews = AppState.getReviews();

    // Update grid selections
    document.querySelectorAll('.doc-type-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`doc-card-${docId}`)?.classList.add('selected');

    // Render panels
    document.getElementById('doc-review-panels').innerHTML = `
      <div class="review-panel">
        <div id="doc-input-panel">${renderInputPanel(docId)}</div>
        <div id="doc-results-panel">
          <div class="card" style="min-height:400px">
            <div class="card-title"><span class="icon">🤖</span> AI Feedback</div>
            ${renderReviewResults(reviews[docId])}
          </div>
        </div>
      </div>`;
  }

  function switchTab(tabId, el) {
    document.querySelectorAll('#review-tabs .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    ['strengths','weaknesses','suggestions','quickwins'].forEach(t => {
      document.getElementById(`tab-${t}`)?.classList.toggle('hidden', t !== tabId);
    });
  }

  async function analyze(docId) {
    const text = document.getElementById(`doc-text-${docId}`)?.value?.trim();
    if (!text || text.length < 50) {
      showToast('Please paste your document text (at least 50 characters)', 'error'); return;
    }

    const btn = document.getElementById(`analyze-btn-${docId}`);
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Analyzing with AI...';

    try {
      const result = await GeminiAPI.reviewDocument(docId, text);
      result.timestamp = Date.now();

      const reviews = AppState.getReviews();
      reviews[docId] = result;
      AppState.saveReviews(reviews);

      // Update results panel
      const resultsPanel = document.getElementById('doc-results-panel');
      resultsPanel.innerHTML = `
        <div class="card">
          <div class="card-title"><span class="icon">🤖</span> AI Feedback</div>
          ${renderReviewResults(result)}
        </div>`;

      // Update doc grid badge
      const card = document.getElementById(`doc-card-${docId}`);
      if (card) {
        const existingBadge = card.querySelector('.doc-has-review');
        if (existingBadge) existingBadge.remove();
        card.insertAdjacentHTML('afterbegin', `<div class="doc-has-review"><span class="badge ${result.score >= 70 ? 'badge-green' : 'badge-gold'}">${result.score}</span></div>`);
      }

      showToast('Document analyzed successfully! 🎉', 'success');
    } catch (err) {
      const msg = err.message === 'QUOTA_EXCEEDED'
        ? '⚠️ Quota exceeded! Go to ⚙️ Settings → switch model to "Gemini 1.5 Flash" → try again'
        : `Analysis failed: ${err.message}`;
      showToast(msg, 'error', 6000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🤖</span> Analyze with AI';
    }
  }

  function dragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  function dragLeave(e) { e.currentTarget.classList.remove('drag-over'); }

  function dropFile(e, docId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file, docId);
  }

  function handleFileUpload(e, docId) {
    const file = e.target.files[0];
    if (file) processFile(file, docId);
  }

  function processFile(file, docId) {
    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(result => {
            document.getElementById(`doc-text-${docId}`).value = result.value;
            showToast(`DOCX loaded: ${file.name}`, 'success');
          })
          .catch(err => showToast(`Failed to read DOCX: ${err.message}`, 'error'));
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.pdf')) {
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map(item => item.str).join(' ') + '\\n\\n';
            }
            document.getElementById(`doc-text-${docId}`).value = fullText.trim();
            showToast(`PDF loaded: ${file.name}`, 'success');
          } catch (err) {
            showToast(`Failed to read PDF: ${err.message}`, 'error');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        showToast('PDF library failed to load. Please copy-paste instead.', 'error');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById(`doc-text-${docId}`).value = e.target.result;
        showToast(`Text file loaded: ${file.name}`, 'success');
      };
      reader.readAsText(file);
    }
  }

  function render() {
    const reviews = AppState.getReviews();
    document.getElementById('docs-grid').innerHTML = renderDocGrid();
    if (selectedDoc) selectDoc(selectedDoc);
  }

  function init() {
    // Render doc type grid
    const grid = document.getElementById('docs-grid');
    if (grid) grid.innerHTML = renderDocGrid();
  }

  return { init, render, selectDoc, analyze, switchTab, dragOver, dragLeave, dropFile, handleFileUpload };
})();
