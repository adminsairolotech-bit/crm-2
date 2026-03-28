import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gmail-leads-api',
      configureServer(server) {
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
