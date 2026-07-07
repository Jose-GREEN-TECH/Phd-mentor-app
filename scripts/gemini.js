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
    return 'gemini-2.5-flash';
  }
  function setModel(m) { localStorage.setItem('mentorapp_model', m); }

  async function fetchModels() {
    return AVAILABLE_MODELS;
  }

  async function generate(prompt, systemInstruction = null, isJson = false) {
    const model = getModel();
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };
    if (isJson) {
      body.generationConfig.responseMimeType = 'application/json';
    }
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      if (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error('Content blocked by AI safety filters');
      }
      throw new Error('Received empty response from AI');
    }
    return text;
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

    const p = typeof AppState !== 'undefined' ? AppState.getProfile() : {};
    const system = `You are Dr. Scholar, an expert academic mentor specializing in university applications and scholarships. 
The applicant is named ${p.name || 'a student'}. They have a ${p.currentDegree || 'degree'} in ${p.field || 'a related field'} ${p.research ? `with research interests in ${p.research}` : ''}.
They are targeting a ${p.targetDegree || 'degree'} in ${p.targetRegions || 'universities globally'}. ${p.scholarships ? `They are interested in scholarships like ${p.scholarships}.` : ''}
You provide highly specific, actionable, encouraging feedback tailored to their specific field and goals.
Always respond in valid JSON format.`;

    const fieldSpecifics = p.field ? `Be specific to ${p.field}, ${p.research || ''}, and their target regions (${p.targetRegions || 'globally'}).` : '';
    
    const prompt = `Review the following ${docDescriptions[docType] || docType} for a ${p.targetDegree || 'university'} scholarship application.

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

${fieldSpecifics}`;

    const raw = await generate(prompt, system, true);
    
    try {
      // The model is now forced to return JSON, but it might still have markdown wrappers
      const cleanJson = raw.replace(/^```(json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      // Fallback regex matching if parsing fails
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(`Invalid AI response format: ${raw.substring(0, 50)}...`);
      return JSON.parse(jsonMatch[0]);
    }
  }

  // ── AI Mentor Chat ─────────────────────────────────────────
  async function chat(userMessage, history = []) {
    const p = typeof AppState !== 'undefined' ? AppState.getProfile() : {};
    const system = `You are Dr. Scholar, a warm, encouraging, and highly knowledgeable AI mentor for scholarship applications.
The student: 
- Name: ${p.name || 'Student'}
- Current Education: ${p.currentDegree || 'Student'} in ${p.field || 'their field'}
- Research Interests: ${p.research || 'N/A'}
- Targeting: ${p.targetDegree || 'degree'} scholarships in ${p.targetRegions || 'universities globally'}
- Specific Scholarships: ${p.scholarships || 'N/A'}

Your role: Guide them through every step of finding, applying for, and securing a scholarship.
Topics you excel at: finding supervisors, writing SOPs, CV optimization, scholarship strategies, interview prep, research proposal writing, networking.

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
