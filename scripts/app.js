/* ============================================================
   App State & Router
   ============================================================ */

const AppState = (() => {
  const KEYS = {
    scholarships: 'mentorapp_scholarships',
    checklist:    'mentorapp_checklist',
    reviews:      'mentorapp_reviews',
    chat:         'mentorapp_chat',
    profile:      'mentorapp_profile',
    apiKey:       'mentorapp_api_key',
  };

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Default pre-seeded scholarships
  const DEFAULT_SCHOLARSHIPS = [
    {
      id: 'daad', name: 'DAAD Research Grants', university: 'Various German Universities',
      country: '🇩🇪 Germany', region: 'Europe', fundingType: 'Full Funding',
      deadline: '2024-11-15', status: 'researching',
      url: 'https://www.daad.de/en/', notes: 'Excellent for Engineering & Renewable Energy research. Strong focus on academic excellence.',
      requirements: 'MSc degree, language proficiency, research proposal, 2 references', fieldMatch: 95
    },
    {
      id: 'fulbright', name: 'Fulbright Foreign Student Program', university: 'Various US Universities',
      country: '🇺🇸 USA', region: 'USA', fundingType: 'Full Funding',
      deadline: '2024-10-15', status: 'researching',
      url: 'https://foreign.fulbrightonline.org/', notes: 'Prestigious US scholarship. Covers tuition, stipend, health insurance.',
      requirements: 'Strong academic record, leadership, SOP, 3 references', fieldMatch: 88
    },
    {
      id: 'chevening', name: 'Chevening Scholarships', university: 'Any UK University',
      country: '🇬🇧 UK', region: 'UK', fundingType: 'Full Funding',
      deadline: '2024-11-05', status: 'researching',
      url: 'https://www.chevening.org/', notes: 'UK Government scholarship. Focus on leadership potential. Covers Masters & short courses.',
      requirements: '2+ years work experience, leadership potential, 3 references', fieldMatch: 80
    },
    {
      id: 'commonwealth', name: 'Commonwealth Scholarship', university: 'UK Universities',
      country: '🇬🇧 UK', region: 'UK', fundingType: 'Full Funding',
      deadline: '2024-10-25', status: 'researching',
      url: 'https://cscuk.fcdo.gov.uk/', notes: 'For citizens of Commonwealth countries. Excellent for STEM fields.',
      requirements: 'Commonwealth citizenship, strong academics, development impact statement', fieldMatch: 85
    },
    {
      id: 'gates', name: 'Gates Cambridge Scholarship', university: 'University of Cambridge',
      country: '🇬🇧 UK', region: 'UK', fundingType: 'Full Funding',
      deadline: '2024-10-11', status: 'researching',
      url: 'https://www.gatescambridge.org/', notes: 'Full cost for any postgrad program at Cambridge. Extremely competitive (~1% acceptance).',
      requirements: 'Intellectual ability, leadership, social commitment, Cambridge offer', fieldMatch: 75
    },
    {
      id: 'marie-curie', name: 'Marie Skłodowska-Curie Actions (MSCA)', university: 'Various EU Universities',
      country: '🇪🇺 European Union', region: 'Europe', fundingType: 'Full Funding + Salary',
      deadline: '2024-09-11', status: 'researching',
      url: 'https://marie-sklodowska-curie-actions.ec.europa.eu/', notes: 'EU fellowship with excellent salary, travel allowance. Apply through host institutions.',
      requirements: 'Must not have resided in host country >12 months in 3 years, research proposal', fieldMatch: 90
    },
    {
      id: 'erasmus', name: 'Erasmus Mundus Joint Doctorates', university: 'Multiple EU Universities',
      country: '🇪🇺 European Union', region: 'Europe', fundingType: 'Full Funding + Stipend',
      deadline: '2025-01-15', status: 'researching',
      url: 'https://erasmus-plus.ec.europa.eu/', notes: 'Joint PhD across multiple EU universities. Great for interdisciplinary research.',
      requirements: 'MSc degree, language skills, research proposal, motivation letter', fieldMatch: 92
    },
    {
      id: 'swedish', name: 'Swedish Institute Scholarships', university: 'Swedish Universities',
      country: '🇸🇪 Sweden', region: 'Europe', fundingType: 'Full Funding',
      deadline: '2025-02-10', status: 'researching',
      url: 'https://si.se/en/', notes: 'For future leaders. Sweden is a world leader in renewable energy research.',
      requirements: 'Leadership experience, professional experience, motivation letter', fieldMatch: 87
    },
    {
      id: 'eth', name: 'ETH Zurich Excellence Scholarship', university: 'ETH Zurich',
      country: '🇨🇭 Switzerland', region: 'Europe', fundingType: 'Partial Funding',
      deadline: '2024-12-15', status: 'researching',
      url: 'https://ethz.ch/en/studies/financial/scholarships.html', notes: 'World-top university for engineering. Excellent renewable energy programs.',
      requirements: 'Top academic record, research motivation letter, 2 references', fieldMatch: 83
    },
    {
      id: 'nsf', name: 'NSF Graduate Research Fellowship', university: 'US Universities',
      country: '🇺🇸 USA', region: 'USA', fundingType: 'Full Funding',
      deadline: '2024-10-18', status: 'researching',
      url: 'https://www.nsfgrfp.org/', notes: 'Prestigious NSF fellowship for STEM research. $37,000/year stipend.',
      requirements: 'Early-career researcher, US institution, research plan, 3 references', fieldMatch: 78
    }
  ];

  // Default checklist phases
  const DEFAULT_CHECKLIST = [
    {
      id: 'phase1', name: 'Self Assessment & Planning', icon: '🧭',
      desc: 'Define your research direction and set your PhD goals',
      tasks: [
        { id: 't1', name: 'Define your research interests & niche', tip: 'Renewable Energy + AI — focus on a specific intersection like AI-driven smart grids, precision agriculture energy systems, or ML for biomass optimization', done: false, tag: 'Foundation' },
        { id: 't2', name: 'Set target countries & universities', tip: 'Europe (Germany, Sweden, Netherlands), USA (MIT, UC Davis, Cornell), UK (Cambridge, Imperial, Edinburgh) are strong for your field', done: false, tag: 'Research' },
        { id: 't3', name: 'Identify your funding needs (full vs partial)', tip: 'Full funding is available via DAAD, Fulbright, Marie Curie — prioritize these', done: false, tag: 'Planning' },
        { id: 't4', name: 'Review your academic record & identify gaps', tip: 'Strong GPA in core Engineering courses is crucial. Highlight MSc thesis and any publications', done: false, tag: 'Foundation' },
        { id: 't5', name: 'List your publications, projects & achievements', tip: 'Even conference papers, technical reports, or thesis chapters count significantly', done: false, tag: 'Foundation' }
      ]
    },
    {
      id: 'phase2', name: 'Document Preparation', icon: '📄',
      desc: 'Craft compelling application documents',
      tasks: [
        { id: 't6', name: 'Write / update your CV for academic applications', tip: 'Academic CVs differ from industry CVs — emphasize research, publications, teaching, and technical skills', done: false, tag: 'Documents' },
        { id: 't7', name: 'Draft your Statement of Purpose (SOP)', tip: 'Tell a compelling story: BSc→MSc→PhD journey, specific research problem you want to solve, why this supervisor/university', done: false, tag: 'Documents' },
        { id: 't8', name: 'Write your Motivation Letter', tip: 'Personalize for each scholarship — connect their mission to your research goals and development potential', done: false, tag: 'Documents' },
        { id: 't9', name: 'Draft your Research Proposal', tip: 'Even 2-3 pages: problem statement, methodology, expected impact, timeline. Align with supervisor\'s work', done: false, tag: 'Documents' },
        { id: 't10', name: 'Request recommendation letters early', tip: 'Ask at least 3 months in advance. Brief your referees on your target programs and what to emphasize', done: false, tag: 'Documents' },
        { id: 't11', name: 'Get academic transcripts certified/translated', tip: 'Many scholarships require certified copies. Get extras — you\'ll need them for multiple applications', done: false, tag: 'Admin' }
      ]
    },
    {
      id: 'phase3', name: 'Supervisor & Program Research', icon: '🔍',
      desc: 'Find the right research groups and supervisors',
      tasks: [
        { id: 't12', name: 'Search for potential PhD supervisors in your field', tip: 'Google Scholar, ResearchGate, university department pages — search "renewable energy AI agricultural systems PhD"', done: false, tag: 'Research' },
        { id: 't13', name: 'Read 3-5 papers from each potential supervisor', tip: 'You need to reference their specific work in your outreach emails and SOP', done: false, tag: 'Research' },
        { id: 't14', name: 'Shortlist 10-15 programs that match your research', tip: 'Use the scholarship tracker to organize them by deadline and fit score', done: false, tag: 'Planning' },
        { id: 't15', name: 'Check admission requirements for each program', tip: 'Language tests (IELTS/TOEFL/GRE), GPA minimums, application fees, specific document requirements', done: false, tag: 'Research' },
        { id: 't16', name: 'Take required language / GRE tests', tip: 'IELTS 6.5+ for UK/Europe, TOEFL 80+ for USA. GRE may be required for some US programs', done: false, tag: 'Tests' }
      ]
    },
    {
      id: 'phase4', name: 'Supervisor Outreach', icon: '📬',
      desc: 'Contact potential supervisors and build connections',
      tasks: [
        { id: 't17', name: 'Write a personalized cold email template', tip: 'Subject: "PhD Inquiry — Renewable Energy + AI [Your Name]". Mention their specific paper, your relevant work, and a specific research idea', done: false, tag: 'Outreach' },
        { id: 't18', name: 'Send emails to 15-20 potential supervisors', tip: 'Stagger over 2-3 weeks. Follow up once after 2 weeks if no reply. Keep it professional and concise', done: false, tag: 'Outreach' },
        { id: 't19', name: 'Prepare for informal video calls', tip: 'Research their lab\'s current projects. Prepare your 2-min research pitch. Have questions ready about the lab culture and funding', done: false, tag: 'Outreach' },
        { id: 't20', name: 'Get a Letter of Interest from a supervisor (if needed)', tip: 'Some scholarships (DAAD, Marie Curie) require or strongly benefit from supervisor endorsement', done: false, tag: 'Outreach' }
      ]
    },
    {
      id: 'phase5', name: 'Application Submission', icon: '🚀',
      desc: 'Submit your applications strategically',
      tasks: [
        { id: 't21', name: 'Create accounts on scholarship portals', tip: 'Do this 2-3 weeks before deadline to avoid technical issues. Fill in basic info incrementally', done: false, tag: 'Submission' },
        { id: 't22', name: 'Tailor CV and SOP for each application', tip: 'Adjust the emphasis depending on what each program values — sustainability impact, technical innovation, interdisciplinary research', done: false, tag: 'Submission' },
        { id: 't23', name: 'Collect and submit all required documents', tip: 'Checklist: Transcripts, CV, SOP, Motivation Letter, Research Proposal, References, ID, Language Scores', done: false, tag: 'Submission' },
        { id: 't24', name: 'Submit before deadline (aim for 1 week early)', tip: 'System crashes and upload errors happen. Never submit on the last day', done: false, tag: 'Submission' },
        { id: 't25', name: 'Confirm submission & save confirmation emails', tip: 'Screenshot your submission confirmation and save it. Track reference numbers', done: false, tag: 'Submission' }
      ]
    },
    {
      id: 'phase6', name: 'Follow-up & Interviews', icon: '🎤',
      desc: 'Navigate interviews and final selection steps',
      tasks: [
        { id: 't26', name: 'Prepare for scholarship interview questions', tip: '"Why PhD?", "Describe your research plan", "How will this benefit your home country?", "Where do you see yourself in 10 years?"', done: false, tag: 'Interview' },
        { id: 't27', name: 'Practice your 3-minute research pitch', tip: 'Explain your research to both experts and non-experts. Record yourself and review it', done: false, tag: 'Interview' },
        { id: 't28', name: 'Prepare for technical questions', tip: 'Expect questions on your MSc thesis, methodology, data analysis, and your proposed PhD research methodology', done: false, tag: 'Interview' },
        { id: 't29', name: 'Follow up on submitted applications', tip: 'A polite email checking on status 2-3 weeks after deadline is acceptable and shows enthusiasm', done: false, tag: 'Follow-up' },
        { id: 't30', name: 'Respond to acceptances & negotiate if needed', tip: 'Compare funding packages. You can politely ask about additional funding, housing allowances, or conference travel budgets', done: false, tag: 'Offer' }
      ]
    }
  ];

  function getScholarships() {
    return load(KEYS.scholarships) || DEFAULT_SCHOLARSHIPS;
  }
  function saveScholarships(data) { save(KEYS.scholarships, data); }

  function getChecklist() {
    return load(KEYS.checklist) || DEFAULT_CHECKLIST;
  }
  function saveChecklist(data) { save(KEYS.checklist, data); }

  function getReviews() { return load(KEYS.reviews) || {}; }
  function saveReviews(data) { save(KEYS.reviews, data); }

  function getChatHistory() { return load(KEYS.chat) || []; }
  function saveChatHistory(data) { save(KEYS.chat, data); }

  function getProfile() {
    return load(KEYS.profile);
  }
  function saveProfile(data) { save(KEYS.profile, data); }

  return {
    getScholarships, saveScholarships,
    getChecklist, saveChecklist,
    getReviews, saveReviews,
    getChatHistory, saveChatHistory,
    getProfile, saveProfile,
    KEYS
  };
})();

// ── Toast Notifications ──────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal Helper ─────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ── Router ───────────────────────────────────────────────────
const Router = (() => {
  let current = 'dashboard';
  const views = ['dashboard', 'documents', 'tracker', 'checklist', 'chat', 'calendar', 'settings'];

  function navigate(viewId) {
    if (!views.includes(viewId)) return;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${viewId}`)?.classList.add('active');
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');
    current = viewId;
    // Refresh view
    if (viewId === 'dashboard')  DashboardView.render();
    if (viewId === 'tracker')    TrackerView.render();
    if (viewId === 'checklist')  ChecklistView.render();
    if (viewId === 'calendar')   CalendarView.render();
    if (viewId === 'settings')   SettingsView.render();
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  }

  return { navigate, getCurrent: () => current };
})();

// ── App Global Helpers ───────────────────────────────────────
const App = {
  checkOnboarding: function() {
    if (!AppState.getProfile()) {
      document.getElementById('onboarding-modal').style.display = 'flex';
    }
  },
  saveOnboarding: function() {
    const profile = {
      name: document.getElementById('ob-name').value,
      currentDegree: document.getElementById('ob-current-degree').value,
      targetDegree: document.getElementById('ob-target-degree').value,
      field: document.getElementById('ob-field').value,
      research: document.getElementById('ob-research').value,
      targetRegions: document.getElementById('ob-destinations').value,
      scholarships: document.getElementById('ob-scholarships').value,
    };
    AppState.saveProfile(profile);
    document.getElementById('onboarding-modal').style.display = 'none';
    
    // Update sidebar name if possible
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = profile.name;
    
    showToast('Profile saved! Your AI mentor is ready.', 'success');
  },
  addToCalendar: function(title, dateStr, url = '') {
    if (!dateStr) { showToast('No deadline set', 'error'); return; }
    
    // Create start and end date (Make it an all-day event or 9AM-10AM)
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dtstart = `${year}${month}${day}T090000Z`;
    const dtend = `${year}${month}${day}T100000Z`;

    // Construct ICS content with reminders (1 day and 3 days before)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PhD Scholar Mentor//EN',
      'BEGIN:VEVENT',
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:Deadline: ${title}`,
      `DESCRIPTION:Scholarship Application Deadline.\\n${url}`,
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: 3 Days until deadline',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: 1 Day until deadline',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\r\\n');

    // Create a Blob and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `deadline-${title.replace(/\\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar event downloaded! Add it to your calendar app.', 'success', 5000);
  }
};

// ── Sidebar Toggle (Mobile) ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Nav items
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => Router.navigate(item.dataset.view));
  });

  // Init all views
  DashboardView.init();
  DocumentsView.init();
  TrackerView.init();
  ChecklistView.init();
  ChatView.init();
  CalendarView.init();
  SettingsView.init();

  // Load profile name into sidebar
  const profile = AppState.getProfile();
  if (profile && profile.name) {
    document.getElementById('sidebar-user-name').textContent = profile.name;
  }

  // Check if first time user
  App.checkOnboarding();

  Router.navigate('dashboard');
});
