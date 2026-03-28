import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ai-api-endpoints',
      configureServer(server) {

        server.middlewares.use('/api/buddy-chat', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { message, history } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });
            const systemPrompt = `You are "Buddy" — SAI RoloTech CRM ka AI Assistant. You help with:
- Sales & Lead Management (products: PLC Panels, HMI, SCADA, VFD, Servo Motors)
- Service & Troubleshooting (machine repairs, PLC errors, maintenance)
- Industrial Automation (PLC programming - Siemens, Allen Bradley, Mitsubishi, Omron, Delta)
- PNMG Loan Schemes (Personal/Business/Machinery/Home/Education loans)
- Machine Testing (15 test parameters for industrial panels)
- CRM Navigation help

Rules:
- Reply in Hinglish (Hindi + English mix) unless user speaks pure English
- Keep responses concise but helpful
- Use bullet points and formatting
- If user says "open X" or "go to X", tell them you'll navigate them there
- You represent SAI RoloTech company
- Be friendly and professional`;

            const contents = [];
            if (history && history.length > 0) {
              for (const h of history.slice(-10)) {
                contents.push({ role: h.from === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
              }
            }
            contents.push({ role: 'user', parts: [{ text: message }] });

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents,
              config: { systemInstruction: systemPrompt, maxOutputTokens: 1024, temperature: 0.7 }
            });
            const reply = response.text || 'Sorry, main samajh nahi paaya. Dobara try karein.';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, reply }));
          } catch (err) {
            console.error('Buddy chat error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/generate-questions', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { topic, count, qType } = JSON.parse(body);
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY });
            const prompt = `Generate exactly ${count || 5} ${qType === 'MCQ' ? 'multiple choice' : qType === 'Short' ? 'short answer' : 'mixed (MCQ and short answer)'} questions about "${topic || 'Industrial Automation, PLC, Electrical Safety, CRM Sales'}".

Context: These are for SAI RoloTech CRM - an industrial automation company dealing with PLC, HMI, SCADA, VFD, Servo Motors, Panel Manufacturing, Machine Testing, and CRM/Sales.

Return ONLY valid JSON array. Each question object must have:
- "q": question text (in Hinglish - Hindi+English mix)
- "a": correct answer
- "type": "MCQ" or "Short"
- "options": array of 4 options (only for MCQ type, include correct answer)

Example: [{"q":"PLC ka full form kya hai?","a":"Programmable Logic Controller","type":"MCQ","options":["Programmable Logic Controller","Power Logic Circuit","Program Level Control","Process Logic Computer"]}]

Return ONLY the JSON array, no other text.`;

            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
              max_tokens: 2000,
            });
            let text = completion.choices[0]?.message?.content || '[]';
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const questions = JSON.parse(text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, questions }));
          } catch (err) {
            console.error('Question gen error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        async function getGmailClient() {
          const { google } = await import('googleapis');
          const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
          const xReplitToken = process.env.REPL_IDENTITY
            ? 'repl ' + process.env.REPL_IDENTITY
            : process.env.WEB_REPL_RENEWAL
            ? 'depl ' + process.env.WEB_REPL_RENEWAL
            : null;
          const connResp = await fetch(
            'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
            { headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken } }
          );
          const connData = await connResp.json();
          const conn = connData.items?.[0];
          const accessToken = conn?.settings?.access_token || conn?.settings?.oauth?.credentials?.access_token;
          if (!accessToken) throw new Error('Gmail not connected');
          const oauth2Client = new google.auth.OAuth2();
          oauth2Client.setCredentials({ access_token: accessToken });
          return google.gmail({ version: 'v1', auth: oauth2Client });
        }

        server.middlewares.use('/api/send-inquiry', async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405); res.end('Method not allowed'); return;
          }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { name, email, phone, message, source } = JSON.parse(body);
            const gmail = await getGmailClient();
            const INQUIRY_EMAIL = 'inquirysairolotech@gmail.com';
            const ADMIN_EMAIL = 'admin.sairolotech@gmail.com';
            const emailContent = [
              `From: CRM System <${INQUIRY_EMAIL}>`,
              `To: ${INQUIRY_EMAIL}`,
              `Cc: ${ADMIN_EMAIL}`,
              `Subject: New Lead Inquiry: ${name} (${source || 'Website'})`,
              `MIME-Version: 1.0`,
              `Content-Type: text/html; charset=utf-8`,
              ``,
              `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">`,
              `<h2 style="color:#667eea;border-bottom:2px solid #667eea;padding-bottom:10px;">New Lead Inquiry</h2>`,
              `<table style="width:100%;border-collapse:collapse;">`,
              `<tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${name}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>`,
              `<tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Source:</td><td style="padding:8px;">${source || 'Website Form'}</td></tr>`,
              `<tr><td style="padding:8px;font-weight:bold;">Message:</td><td style="padding:8px;">${message || 'No message'}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Time:</td><td style="padding:8px;">${new Date().toLocaleString('en-IN')}</td></tr>`,
              `</table></div>`,
            ].join('\n');
            const encoded = Buffer.from(emailContent).toString('base64url');
            await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Inquiry sent successfully' }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/gmail-leads', async (req, res) => {
          try {
            const gmail = await getGmailClient();
            const labelsResp = await gmail.users.labels.list({ userId: 'me' });
            const labels = (labelsResp.data.labels || []).map(l => ({ id: l.id, name: l.name }));
            const inboxDetail = (await gmail.users.labels.get({ userId: 'me', id: 'INBOX' })).data;

            let leads = [];
            let emailsScanned = 0;
            let scanMethod = 'none';
            try {
              const msgList = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 50,
                q: 'in:inbox',
              });
              const messages = msgList.data.messages || [];
              emailsScanned = messages.length;
              scanMethod = 'full';
              for (const msg of messages.slice(0, 30)) {
                try {
                  const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date'],
                  });
                  const headers = detail.data.payload?.headers || [];
                  const from = headers.find(h => h.name === 'From')?.value || '';
                  const subject = headers.find(h => h.name === 'Subject')?.value || '';
                  const date = headers.find(h => h.name === 'Date')?.value || '';
                  const nameMatch = from.match(/^"?([^"<]+)"?\s*<?/);
                  const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s<]+@[^\s>]+)/);
                  const senderName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
                  const senderEmail = emailMatch ? emailMatch[1] : from;
                  const isLead = /inquiry|lead|quote|price|buy|order|interest|request|contact|help|service|product/i.test(subject)
                    || /inquiry|lead|quote|price|order|interest|request/i.test(from);
                  const isInternal = /sairolotech|noreply|no-reply|mailer-daemon|postmaster/i.test(senderEmail);
                  const labelIds = detail.data.labelIds || [];
                  const isUnread = labelIds.includes('UNREAD');
                  leads.push({
                    id: msg.id,
                    name: senderName,
                    email: senderEmail,
                    subject: subject,
                    date: date,
                    snippet: detail.data.snippet || '',
                    isLead,
                    isInternal,
                    isUnread,
                    status: isLead ? 'Hot Lead' : isInternal ? 'Internal' : 'New',
                    source: 'Gmail',
                  });
                } catch (e) {}
              }
              leads = leads.filter(l => !l.isInternal);
            } catch (readErr) {
              scanMethod = 'labels_only';
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              connected: true,
              email: 'inquirysairolotech@gmail.com',
              adminEmail: 'admin.sairolotech@gmail.com',
              labels,
              inbox: {
                total: inboxDetail.messagesTotal,
                unread: inboxDetail.messagesUnread,
              },
              leads,
              emailsScanned,
              scanMethod,
              totalLeads: leads.filter(l => l.isLead).length,
            }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message, leads: [], labels: [] }));
          }
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY ||
      process.env.FIRE_BASE_API_KEY ||
      process.env.GOOGLE_API_KEY || ''
    ),
  },
})
