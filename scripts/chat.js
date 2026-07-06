/* ============================================================
   AI Mentor Chat View
   ============================================================ */

const ChatView = (() => {
  const CHIPS = [
    'What makes a strong SOP for Renewable Energy PhD?',
    'How do I find the right PhD supervisor?',
    'Best scholarships for Agricultural Engineering in Europe?',
    'How to write a cold email to a professor?',
    'What GPA do I need for DAAD scholarship?',
    'Difference between SOP and Motivation Letter?',
    'How to tailor my CV for academic applications?',
    'What questions do scholarship interviews ask?',
    'How to write a strong research proposal?',
    'Tips for Fulbright application as an engineer?',
  ];

  const WELCOME_MSG = {
    role: 'model',
    text: `👋 Hello! I'm **Dr. Scholar**, your personal PhD scholarship mentor.

I know you're finishing your MSc in **Agricultural & Biosystem Engineering** with a focus on **Renewable Energy and AI**, and you have a BSc in **Electrical & Electronic Engineering**. You're targeting scholarships in **Europe, USA, and UK** — excellent choices!

Your interdisciplinary background is a genuine strength. The intersection of Renewable Energy + AI + Agriculture is a hot research frontier, and many top universities are actively seeking PhD candidates with exactly this profile.

Here's how I can help you:
- 📄 Guide you through every application document
- 🎓 Help you find the right supervisors and programs
- 💡 Strategy for DAAD, Fulbright, Chevening, Marie Curie, and more
- 🎤 Interview preparation and practice

**What would you like to work on today?** Use the suggestion chips below or ask me anything!`,
    time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
  };

  let history = [];

  function formatMessage(text) {
    // Convert markdown-ish formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4 style="margin:12px 0 6px;font-family:var(--font-heading);font-size:14px;color:var(--violet-light)">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="margin:12px 0 6px;font-family:var(--font-heading);font-size:15px;color:var(--cyan)">$1</h3>')
      .replace(/^- (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:var(--violet-light);flex-shrink:0">•</span><span>$1</span></div>')
      .replace(/^\d+\. (.+)$/gm, (m, p1, offset, str) => {
        const num = str.substring(0, offset).split('\n').filter(l => /^\d+\./.test(l)).length + 1;
        return `<div style="display:flex;gap:8px;margin:3px 0"><span style="color:var(--cyan-light);font-weight:600;flex-shrink:0">${num}.</span><span>${p1}</span></div>`;
      })
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function renderMessages(msgs) {
    return msgs.map(m => `
      <div class="chat-msg ${m.role === 'user' ? 'user' : 'ai'}">
        <div class="chat-avatar">${m.role === 'user' ? '👤' : '🎓'}</div>
        <div>
          <div class="chat-bubble">${formatMessage(m.text)}</div>
          <div class="chat-time">${m.time || ''}</div>
        </div>
      </div>`).join('');
  }

  function scrollToBottom() {
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function appendMessage(msg) {
    const container = document.getElementById('chat-messages');
    const el = document.createElement('div');
    el.innerHTML = renderMessages([msg]);
    container.appendChild(el.firstElementChild);
    scrollToBottom();
  }

  function showTyping() {
    const container = document.getElementById('chat-messages');
    const el = document.createElement('div');
    el.id = 'typing-indicator';
    el.className = 'chat-msg ai';
    el.innerHTML = `
      <div class="chat-avatar">🎓</div>
      <div>
        <div class="chat-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>`;
    container.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    document.getElementById('typing-indicator')?.remove();
  }

  async function sendMessage(text) {
    if (!text?.trim()) return;

    const userMsg = { role: 'user', text: text.trim(), time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    appendMessage(userMsg);

    // Add to history for context
    history.push({ role: 'user', text: text.trim() });

    // Clear input
    const input = document.getElementById('chat-input');
    if (input) input.value = '';

    showTyping();

    try {
      const reply = await GeminiAPI.chat(text.trim(), history.slice(-10));
      hideTyping();

      const aiMsg = { role: 'model', text: reply, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      appendMessage(aiMsg);
      history.push({ role: 'model', text: reply });

      // Save history (limit to last 40 messages)
      if (history.length > 40) history = history.slice(-40);
      AppState.saveChatHistory(history);

    } catch (err) {
      hideTyping();
      const errMsg = err.message === 'QUOTA_EXCEEDED'
        ? '⚠️ Quota exceeded. Go to ⚙️ Settings and switch the model to **Gemini 1.5 Flash**, then try again.'
        : `Error: ${err.message}`;
      appendMessage({ role: 'model', text: `⚠️ ${errMsg}`, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) });
    }
  }

  function clearHistory() {
    if (!confirm('Clear chat history? This cannot be undone.')) return;
    history = [];
    AppState.saveChatHistory([]);
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    appendMessage(WELCOME_MSG);
    showToast('Chat history cleared', 'info');
  }

  function init() {
    // Load history
    history = AppState.getChatHistory();

    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Show welcome + history
    if (history.length === 0) {
      appendMessage(WELCOME_MSG);
    } else {
      container.innerHTML = renderMessages([WELCOME_MSG, ...history]);
      scrollToBottom();
    }

    // Chips
    const chipsContainer = document.getElementById('chat-chips');
    if (chipsContainer) {
      chipsContainer.innerHTML = CHIPS.map(chip =>
        `<div class="chat-chip" onclick="ChatView.sendMessage('${chip.replace(/'/g, "\\'")}')">${chip}</div>`
      ).join('');
    }

    // Send form
    const form = document.getElementById('chat-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      sendMessage(input.value);
    });

    // Enter to send (Shift+Enter for newline)
    const input = document.getElementById('chat-input');
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
  }

  return { init, sendMessage, clearHistory };
})();
