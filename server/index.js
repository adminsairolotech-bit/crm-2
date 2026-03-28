import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

/* ── Middleware ──────────────────────────── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

/* ── Rate limit helper (simple in-memory) ── */
const hitMap = new Map();
function rateLimit(key, maxPerMinute = 10) {
  const now = Date.now();
  const hits = hitMap.get(key) || [];
  const recent = hits.filter(t => now - t < 60000);
  recent.push(now);
  hitMap.set(key, recent);
  return recent.length > maxPerMinute;
}

/* ── Gemini helper ──────────────────────── */
function getAI() {
  if (!GEMINI_KEY) throw new Error('Gemini API key not configured');
  return new GoogleGenAI({ apiKey: GEMINI_KEY });
}

async function gemini(contents, systemInstruction, opts = {}) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: opts.model || 'gemini-2.0-flash',
    contents,
    config: { systemInstruction, maxOutputTokens: opts.maxTokens || 1024, temperature: opts.temp ?? 0.7 }
  });
  return response.text || '';
}

/* ── Body reader for streaming ──────────── */
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

/* ── AI: Buddy Chat ─────────────────────── */
app.post('/api/buddy-chat', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`buddy-${ip}`, 20)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, error: 'Message required' });

    const systemPrompt = `You are "Buddy" — SAI RoloTech CRM ka AI Assistant. You help with:
- Sales & Lead Management (products: PLC Panels, HMI, SCADA, VFD, Servo Motors)
- Service & Troubleshooting (machine repairs, PLC errors, maintenance)
- Industrial Automation (PLC programming - Siemens, Allen Bradley, Mitsubishi, Omron, Delta)
- PMEGP / MSME Loan Schemes
- Machine Testing (15 test parameters for industrial panels)
- CRM Navigation help

Rules: Reply in Hinglish (Hindi + English mix). Concise but helpful. Use bullet points. Be friendly & professional.`;

    const contents = history.slice(-10).map(h => ({
      role: h.from === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const reply = await gemini(contents, systemPrompt, { maxTokens: 1024, temp: 0.7 });
    res.json({ success: true, reply });
  } catch (err) {
    console.error('[buddy-chat]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Quotation Generator ────────────── */
app.post('/api/ai-quotation', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`quote-${ip}`, 5)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { clientName, clientPhone, clientEmail, clientCompany, products, budget, requirements, catalogData = {} } = req.body;

    const productList = (catalogData.products || []).map(p =>
      `- ${p.name} (${p.category}): ₹${p.basePrice?.toLocaleString('en-IN')}/${p.unit}, HSN: ${p.hsn}`
    ).join('\n') || 'PLC Panels (₹28,000-₹85,000), HMI (₹18,000-₹32,000), VFD (₹8,500-₹22,000), SCADA (₹85,000)';

    const systemPrompt = `You are a professional quotation generator for SAI RoloTech, Pune (GSTIN: 27AABCS1429B1Z1).
Available Products: ${productList}
Payment: ${catalogData.terms?.payment || '50% advance, 50% before delivery'} | GST: 18% | Warranty: 12 months

Generate a professional quotation in JSON format with this EXACT structure:
{"quotationNo":"SAI-YYYY-NNNN","date":"DD/MM/YYYY","validUntil":"DD/MM/YYYY (30 days)","client":{"name":"","phone":"","email":"","company":""},"items":[{"sno":1,"description":"","hsn":"","qty":1,"unit":"","unitPrice":0,"amount":0}],"subtotal":0,"discount":0,"discountAmount":0,"taxableAmount":0,"gstRate":18,"gstAmount":0,"grandTotal":0,"paymentTerms":"","deliveryTerms":"","warranty":"","notes":"","executiveName":"Technical Sales Team"}
Return ONLY valid JSON.`;

    const text = await gemini(
      [{ role: 'user', parts: [{ text: `Client: ${clientName}, ${clientPhone}, ${clientEmail || 'N/A'}, ${clientCompany || 'Individual'}\nNeeds: ${products}\nBudget: ${budget || 'Not specified'}\nRequirements: ${requirements || 'None'}` }] }],
      systemPrompt, { maxTokens: 2048, temp: 0.3 }
    );
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const quotation = JSON.parse(clean);
    res.json({ success: true, quotation });
  } catch (err) {
    console.error('[ai-quotation]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Machine Guide (Troubleshooter) ──── */
app.post('/api/machine-guide', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`machine-${ip}`, 20)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { message, history = [] } = req.body;

    const systemPrompt = `You are "MASTER" — SAI RoloTech ka Roll Forming Machine Expert AI. 20+ saal ka experience. Expertise: Roll Forming Machines, Coil Slitting, Decoiler, Forming Stations, Punching, Cut-off, PLC/HMI/Encoder/Servo, Material handling.

Common problems knowledge: strip going left/right, bow up/down, twist, flare, wave/buckle, dimension issues, surface marks, cutting length wrong, punching misalignment, vibration, motor overload, material slip, straightener issues.

REPLY RULES: Hinglish mein jawab do. Step-by-step numbered list. Practical & actionable. Safety warnings include karein. Emojis use karein (🔧 ⚙️ ✅ ⚠️ 📏). End mein "Kya aur help chahiye?" zaror poochho.`;

    const contents = history.slice(-12).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const reply = await gemini(contents, systemPrompt, { maxTokens: 1500, temp: 0.5 });
    res.json({ success: true, reply });
  } catch (err) {
    console.error('[machine-guide]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Project Report Generator ──────── */
app.post('/api/generate-project-report', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`report-${ip}`, 3)) return res.status(429).json({ success: false, error: 'Too many requests. 1 minute wait karein.' });
    const { formData: f } = req.body;
    if (!f) return res.status(400).json({ success: false, error: 'Form data required' });

    const subsidyPct = ['SC','ST','OBC','Minority','Ex-Serviceman','Physically Handicapped'].includes(f.category) ? 35 : 25;
    const toNum = (v) => parseFloat(String(v || '0').replace(/,/g, '')) || 0;
    const totalCost = toNum(f.totalProjectCost);
    const loan = toNum(f.loanAmount);
    const own = toNum(f.ownContribution);
    const revenue = toNum(f.expectedRevenueMontly);
    const rmCost = toNum(f.rawMaterialCostMonthly);
    const labourCost = toNum(f.labourCostMonthly);
    const overhead = toNum(f.overheadMonthly);
    const interest = toNum(f.interestRate) || 11.5;
    const tenure = toNum(f.loanTenure) || 7;
    const r = (interest/1200);
    const n = tenure * 12;
    const monthlyEMI = loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
    const monthlyProfit = revenue - rmCost - labourCost - overhead - monthlyEMI;
    const breakEven = totalCost > 0 && monthlyProfit > 0 ? Math.ceil(totalCost / monthlyProfit) : 0;
    const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
    const fmt = (n) => Math.round(n).toLocaleString('en-IN');

    const prompt = `Write a complete, professional project report in English for bank loan under ${f.loanScheme} scheme.

Applicant: ${f.applicantName}, Father: ${f.fatherName||'N/A'}, DOB: ${f.dob||'N/A'}, Category: ${f.category}
Qualification: ${f.qualification}, Experience: ${f.experience}
Address: ${f.address}, ${f.city}, ${f.state} - ${f.pincode}
Phone: ${f.phone}, Email: ${f.email}
Business: ${f.businessName} (${f.businessType}), Location: ${f.proposedLocation||f.city}
Products: ${f.productDescription}, Market: ${f.targetMarket}
Machine: ${f.machineName} from ${f.machineSupplier}, Cost: ₹${f.machinePrice}, Capacity: ${f.machineCapacity}
Total Project Cost: ₹${fmt(totalCost)} | Own: ₹${fmt(own)} | Loan: ₹${fmt(loan)}
Bank: ${f.bankName}, Tenure: ${tenure}yrs, Rate: ${interest}%, EMI: ₹${fmt(monthlyEMI)}/month
Revenue: ₹${fmt(revenue)}/mo | Profit: ₹${fmt(monthlyProfit)}/mo | Payback: ~${breakEven} months
Subsidy: ${subsidyPct}% (${f.category})

Write a complete 14-section report:
1. COVER PAGE (Date: ${today}, Ref: SAI-PR-${Date.now().toString().slice(-6)})
2. EXECUTIVE SUMMARY
3. PROMOTER'S PROFILE
4. PROJECT DESCRIPTION
5. MARKET ANALYSIS & DEMAND
6. TECHNICAL DETAILS
7. COST OF PROJECT (itemized table)
8. MEANS OF FINANCE (own contribution, bank loan, ${f.loanScheme} subsidy: ${subsidyPct}%)
9. FINANCIAL PROJECTIONS - 5 YEAR PLAN (table: 70%/80%/90%/90%/90% capacity)
10. REPAYMENT SCHEDULE (EMI: ₹${fmt(monthlyEMI)}/month × ${n} months)
11. BREAK-EVEN ANALYSIS
12. EMPLOYMENT GENERATION (${f.manpowerTotal||'N/A'} total jobs)
13. SOCIAL & ECONOMIC IMPACT
14. DECLARATION

Be thorough, professional, bank-ready. ~1200-1500 words.`;

    const report = await gemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      null, { maxTokens: 4096, temp: 0.3 }
    );
    res.json({ success: true, report });
  } catch (err) {
    console.error('[project-report]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Machine Spec Estimator ─────────── */
app.post('/api/ai-machine-spec', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`spec-${ip}`, 10)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { form } = req.body;

    const prompt = `You are a roll forming machine expert at SAI RoloTech, Pune.
Based on requirements below, give a brief technical machine spec in Hinglish.

Material: ${form.materialType}, Thickness: ${form.minThickness}-${form.maxThickness}mm
Strip Width: ${form.minStripWidth}-${form.maxStripWidth}mm, Profile H: ${form.profileHeight||'N/A'}mm
Type: ${form.machineType}, Punching: ${form.punchingOption} ${form.punchingDetails||''}
Speed: ${form.outputSpeed||'N/A'} m/min, Coil: ${form.coilWeight||'N/A'}kg, Cut: ${form.cutType||'N/A'}
Control: ${form.controlSystem||'N/A'}, Special: ${form.specialRequirements||'None'}

5-8 lines covering: forming stations, motor/drive, frame, tooling material, machine size (L×W×H), technical notes.`;

    const spec = await gemini([{ role: 'user', parts: [{ text: prompt }] }], null, { maxTokens: 512, temp: 0.3 });
    res.json({ success: true, spec });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Quotation Analyzer ─────────────── */
app.post('/api/analyze-quotation', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`analyze-${ip}`, 5)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { quotationText, catalogData = {} } = req.body;

    const saiPricing = (catalogData.products || []).map(p => `${p.name}: ₹${p.basePrice?.toLocaleString('en-IN')}/${p.unit}`).join('\n')
      || 'PLC Panels: ₹28,000-₹85,000, HMI: ₹18,000-₹32,000, VFD: ₹8,500-₹22,000';

    const systemPrompt = `You are an expert industrial automation procurement analyst for SAI RoloTech, Pune.
SAI Reference Pricing: ${saiPricing}

Analyze the quotation and return ONLY valid JSON:
{"companyName":"","quotationRef":"","totalAmount":"","overallScore":0,"overallVerdict":"Good","summary":"","pros":[{"point":"","detail":""}],"cons":[{"point":"","detail":"","severity":"High"}],"priceAnalysis":{"verdict":"Fair","detail":"","savingOpportunity":""},"missingItems":[],"redFlags":[],"recommendations":[],"sairolotech_advantage":""}`;

    const text = await gemini(
      [{ role: 'user', parts: [{ text: `Analyze:\n\n${quotationText}` }] }],
      systemPrompt, { maxTokens: 2048, temp: 0.4 }
    );
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(clean);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error('[analyze-quotation]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── AI: Question Generator (OpenAI) ─────── */
app.post('/api/generate-questions', async (req, res) => {
  try {
    const ip = req.ip;
    if (rateLimit(`questions-${ip}`, 5)) return res.status(429).json({ success: false, error: 'Too many requests' });
    const { topic, count, qType } = req.body;
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY });

    const prompt = `Generate exactly ${count||5} ${qType==='MCQ'?'multiple choice':qType==='Short'?'short answer':'mixed'} questions about "${topic||'Industrial Automation, PLC'}".
Context: SAI RoloTech CRM — PLC, HMI, SCADA, VFD, Servo Motors, Panel Manufacturing, Machine Testing.
Return ONLY valid JSON array. Each: {"q":"(Hinglish)","a":"correct answer","type":"MCQ or Short","options":["(4 options, MCQ only)"]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.8, max_tokens: 2000
    });
    let text = completion.choices[0]?.message?.content || '[]';
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    res.json({ success: true, questions: JSON.parse(text) });
  } catch (err) {
    console.error('[generate-questions]', err.message);
    res.json({ success: false, error: err.message });
  }
});

/* ── Gmail helpers ──────────────────────── */
async function getGmailClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? 'repl ' + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? 'depl ' + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken || !hostname) throw new Error('Gmail connector not configured');
  const connResp = await fetch('https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail', { headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken } });
  const connData = await connResp.json();
  const conn = connData.items?.[0];
  const accessToken = conn?.settings?.access_token || conn?.settings?.oauth?.credentials?.access_token;
  if (!accessToken) throw new Error('Gmail not connected');
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/* ── Gmail: Leads ───────────────────────── */
app.get('/api/gmail-leads', async (req, res) => {
  try {
    const gmail = await getGmailClient();
    const labelsResp = await gmail.users.labels.list({ userId: 'me' });
    const labels = (labelsResp.data.labels || []).map(l => ({ id: l.id, name: l.name }));
    const inboxLabel = labelsResp.data.labels?.find(l => l.id === 'INBOX');
    const inboxDetail = inboxLabel ? (await gmail.users.labels.get({ userId: 'me', id: 'INBOX' })).data : null;
    res.json({ success: true, connected: true, email: 'inquirysairolotech@gmail.com', labels, inbox: inboxDetail ? { total: inboxDetail.messagesTotal, unread: inboxDetail.messagesUnread } : null, leads: [] });
  } catch (err) {
    res.json({ success: false, error: err.message, leads: [], labels: [] });
  }
});

/* ── Gmail: Send Inquiry ─────────────────── */
app.post('/api/send-inquiry', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;
    const gmail = await getGmailClient();
    const INQUIRY_EMAIL = 'inquirysairolotech@gmail.com';
    const emailContent = [
      `From: CRM System <${INQUIRY_EMAIL}>`, `To: ${INQUIRY_EMAIL}`,
      `Subject: New Lead: ${name} (${source||'Website'})`,
      `MIME-Version: 1.0`, `Content-Type: text/html; charset=utf-8`, ``,
      `<div style="font-family:Arial;max-width:600px;padding:20px">`,
      `<h2 style="color:#2563eb">📋 New Lead Inquiry</h2>`,
      `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p>`,
      `<p><b>Phone:</b> ${phone||'N/A'}</p><p><b>Message:</b> ${message||'N/A'}</p>`,
      `<p style="color:#6b7280;font-size:12px">Time: ${new Date().toLocaleString('en-IN')}</p></div>`,
    ].join('\n');
    const encoded = Buffer.from(emailContent).toString('base64url');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/* ── Health check ───────────────────────── */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '5.6.0', timestamp: new Date().toISOString(), ai: !!GEMINI_KEY });
});

/* ── Serve React SPA ─────────────────────── */
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath, { maxAge: '1y', etag: true }));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SAI RoloTech CRM v5.6 PRO running on port ${PORT}`);
  console.log(`   Gemini AI: ${GEMINI_KEY ? '✅ Connected' : '⚠️  Key missing'}`);
});
