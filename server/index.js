import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Gmail client helper ---
async function getGmailClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken || !hostname) throw new Error('Gmail connector not configured');

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

// --- API: Gmail leads / inbox stats ---
app.get('/api/gmail-leads', async (req, res) => {
  try {
    const gmail = await getGmailClient();
    const labelsResp = await gmail.users.labels.list({ userId: 'me' });
    const labels = (labelsResp.data.labels || []).map(l => ({ id: l.id, name: l.name }));

    const inboxLabel = labelsResp.data.labels?.find(l => l.id === 'INBOX');
    const inboxDetail = inboxLabel
      ? (await gmail.users.labels.get({ userId: 'me', id: 'INBOX' })).data
      : null;

    res.json({
      success: true,
      connected: true,
      email: 'inquirysairolotech@gmail.com',
      adminEmail: 'admin.sairolotech@gmail.com',
      labels,
      inbox: inboxDetail ? { total: inboxDetail.messagesTotal, unread: inboxDetail.messagesUnread } : null,
      leads: [],
    });
  } catch (err) {
    res.json({ success: false, error: err.message, leads: [], labels: [] });
  }
});

// --- API: Send inquiry email ---
app.post('/api/send-inquiry', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;
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
      `<h2 style="color:#667eea;border-bottom:2px solid #667eea;padding-bottom:10px;">📋 New Lead Inquiry</h2>`,
      `<table style="width:100%;border-collapse:collapse;">`,
      `<tr><td style="padding:8px;font-weight:bold;color:#374151;">Name:</td><td style="padding:8px;color:#1a1a2e;">${name}</td></tr>`,
      `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Email:</td><td style="padding:8px;color:#1a1a2e;">${email}</td></tr>`,
      `<tr><td style="padding:8px;font-weight:bold;color:#374151;">Phone:</td><td style="padding:8px;color:#1a1a2e;">${phone || 'Not provided'}</td></tr>`,
      `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Source:</td><td style="padding:8px;color:#1a1a2e;">${source || 'Website Form'}</td></tr>`,
      `<tr><td style="padding:8px;font-weight:bold;color:#374151;">Message:</td><td style="padding:8px;color:#1a1a2e;">${message || 'No message'}</td></tr>`,
      `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Time:</td><td style="padding:8px;color:#1a1a2e;">${new Date().toLocaleString('en-IN')}</td></tr>`,
      `</table>`,
      `<p style="margin-top:20px;padding:12px;background:#dbeafe;border-radius:8px;color:#1d4ed8;font-size:13px;">`,
      `This lead has been recorded in SAI RoloTech CRM. Login to dashboard to follow up.`,
      `</p></div>`,
    ].join('\n');

    const encoded = Buffer.from(emailContent).toString('base64url');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });

    res.json({ success: true, message: 'Inquiry sent successfully' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// --- Health check endpoint (required for deployment) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Serve React frontend in production ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAI RoloTech CRM running on port ${PORT}`);
});
