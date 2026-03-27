import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gmail-leads-api',
      configureServer(server) {
        // Helper to get Gmail client
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

        // Send inquiry email endpoint
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

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Inquiry sent successfully' }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/gmail-leads', async (req, res) => {
          try {
            const { google } = await import('googleapis');

            const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
            const xReplitToken = process.env.REPL_IDENTITY
              ? 'repl ' + process.env.REPL_IDENTITY
              : process.env.WEB_REPL_RENEWAL
              ? 'depl ' + process.env.WEB_REPL_RENEWAL
              : null;

            if (!xReplitToken || !hostname) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Gmail connector not configured', leads: [], labels: [] }));
              return;
            }

            const connResp = await fetch(
              'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
              { headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken } }
            );
            const connData = await connResp.json();
            const connectionSettings = connData.items?.[0];
            const accessToken =
              connectionSettings?.settings?.access_token ||
              connectionSettings?.settings?.oauth?.credentials?.access_token;

            if (!accessToken) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Gmail not connected', leads: [], labels: [] }));
              return;
            }

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            // Use gmail.labels scope (which we have) to verify connection and get mailbox info
            const labelsResp = await gmail.users.labels.list({ userId: 'me' });
            const labels = (labelsResp.data.labels || []).map(l => ({ id: l.id, name: l.name }));

            // Find INBOX label stats
            const inboxLabel = labelsResp.data.labels?.find(l => l.id === 'INBOX');
            const inboxDetail = inboxLabel
              ? (await gmail.users.labels.get({ userId: 'me', id: 'INBOX' })).data
              : null;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              connected: true,
              email: 'inquirysairolotech@gmail.com',
              adminEmail: 'admin.sairolotech@gmail.com',
              labels,
              inbox: inboxDetail ? {
                total: inboxDetail.messagesTotal,
                unread: inboxDetail.messagesUnread,
              } : null,
              leads: [],
              note: 'Gmail connected. Full inbox read requires gmail.readonly scope — upgrade needed for lead scanning.',
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
