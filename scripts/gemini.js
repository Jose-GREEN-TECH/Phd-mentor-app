/* ============================================================
   Gemini API Integration
   ============================================================ */

const GeminiAPI = (() => {

  // Model is configurable — gemini-1.5-flash has the most generous free tier
  const AVAILABLE_MODELS = [
    { id: 'gemini-1.5-flash',         label: 'Gemini 1.5 Flash (Free tier — Recommended)' },
    { id: 'gemini-1.5-flash-8b',      label: 'Gemini 1.5 Flash-8B (Lightest, fastest)' },
    { id: 'gemini-2.0-flash',         label: 'Gemini 2.0 Flash (Requires paid tier)' },
    { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview' },
  ];

  // Hardcode model to the most stable, generous free-tier model 
  // since the API key is now shared on the backend
  function getModel() {
    return 'gemini-1.5-flash';
  }
  function setModel(m) { localStorage.setItem('mentorapp_model', m); }

  async function fetchModels() {
    return AVAILABLE_MODELS;
  }

  async function generate(prompt, systemInstruction = '') {
    const model = getModel();
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, body })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      let msg = `HTTP ${res.status}`;
      if (err.error?.message) msg = err.error.message;
      else if (typeof err.error === 'string') msg = err.error;
      throw new Error(msg);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ── Document Review ────────────────────────────────────────
  async function reviewDocument(docType, content) {
    const docDescriptions = {
      cv: 'Curriculum Vitae (CV/Resume)',
      sop: 'Statement of Purpose (SOP)',
      motivation: 'Motivation Letter',
      recommendation: 'Recommendation Letter',
      proposal: 'Research Proposal',
      transcripts: 'Academic Transcripts/Grades Summary'
    };

    const system = `You are Dr. Scholar, an expert academic mentor specializing in PhD scholarship applications, 
particularly for students from Agricultural & Biosystem Engineering with research experience in Renewable Energy and AI. 
The applicant has an MSc in Agricultural and Biosystem Engineering and a BSc in Electrical and Electronic Engineering.
They are targeting PhD scholarships in Europe, USA, and UK.
You provide highly specific, actionable, encouraging feedback tailored to engineering and interdisciplinary research fields.
Always respond in valid JSON format.`;

    const prompt = `Review the following ${docDescriptions[docType] || docType} for a PhD scholarship application.

DOCUMENT CONTENT:
---
${content}
---

Provide a detailed review in the following JSON format:
{
  "score": <integer 0-100>,
  "grade": "<A+/A/A-/B+/B/B-/C>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [
    {"point": "<specific strength>", "detail": "<why it works well>"},
    ...3-4 items
  ],
  "weaknesses": [
    {"point": "<specific weakness>", "detail": "<why it hurts and how to fix it>"},
    ...3-4 items
  ],
  "suggestions": [
    {"point": "<specific actionable suggestion>", "example": "<brief example or template if relevant>"},
    ...4-5 items
  ],
  "keywords_missing": ["<keyword1>", "<keyword2>", ...],
  "quick_wins": ["<one-line quick fix>", ...]
}

Be specific to Renewable Energy, AI, Agricultural Engineering, and the target regions (Europe, USA, UK).`;

    const raw = await generate(prompt, system);
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    return JSON.parse(jsonMatch[0]);
  }

  // ── AI Mentor Chat ─────────────────────────────────────────
  async function chat(userMessage, history = []) {
    const system = `You are Dr. Scholar, a warm, encouraging, and highly knowledgeable AI mentor for PhD scholarship applications.
The student: 
- Has an MSc in Agricultural & Biosystem Engineering (specializing in Renewable Energy and AI)
- Has a BSc in Electrical & Electronic Engineering
- Is looking for PhD scholarships in Europe, USA, and UK
- Is currently an MSc student finishing their program

Your role: Guide them through every step of finding, applying for, and securing a PhD scholarship.
Topics you excel at: finding supervisors, writing SOPs, CV optimization, scholarship strategies, interview prep, 
research proposal writing, networking, DAAD, Fulbright, Chevening, Marie Curie, Gates Cambridge, EPSRC, Erasmus Mundus scholarships.

Be conversational, supportive, and specific. Use emojis sparingly for warmth. Keep responses concise but thorough.
Format key points with markdown bullet points or numbered lists when helpful.`;

    const contents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const body = {
      contents,
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
    };

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: getModel(), body })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      let msg = `HTTP ${res.status}`;
      if (err.error?.message) msg = err.error.message;
      else if (typeof err.error === 'string') msg = err.error;
      throw new Error(msg);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  return { generate, reviewDocument, chat, getModel, setModel, AVAILABLE_MODELS, fetchModels };
})();
