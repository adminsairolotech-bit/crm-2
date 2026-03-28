/**
 * WhatsApp Business API Service
 * Env vars needed: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_ID
 * Get from: Meta Business → WhatsApp → API Setup
 */

const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WA_API = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;
const APP_LINK = process.env.APP_DOWNLOAD_LINK || 'https://sairolotech.app';

// DND check import
import { getLead, markDND } from '../models/leadModel.js';

function isConfigured() {
  return !!(WA_TOKEN && PHONE_ID);
}

async function sendRaw(to, body) {
  if (!isConfigured()) {
    console.log(`📱 [WA MOCK] To: ${to}\n${body}`);
    return { mock: true };
  }

  const res = await fetch(WA_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { body },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA API error ${res.status}: ${err}`);
  }

  return res.json();
}

/** Send first message — focused on app download */
export async function sendWelcomeMessage(lead) {
  const { phone, name } = lead;

  // Check DND
  const existing = getLead(phone);
  if (existing?.dnd) return;

  const msg =
`🙏 Namaste ${name}!

SAI RoloTech ki taraf se aapka swagat hai — New Delhi ki trusted Roll Forming Machine manufacturer.

Hamare *FREE app* mein ye sab milega:
✅ AI Quotation (instant machine quote)
✅ Maintenance Guide (apni machine ka care karo)
✅ Quality Check (production issues solve karo)

App download karein 👇
${APP_LINK}?user=${phone}

Koi bhi sawaal ho — hum yahan hain! 😊`;

  return sendRaw(phone, msg);
}

/** Send follow-up message based on day index */
export async function sendFollowup(lead, dayIndex) {
  const { phone, name } = lead;

  const existing = getLead(phone);
  if (existing?.dnd) return;

  const MESSAGES = [
    // Day 3
    `Hi ${name}! App download kiya? Hum aapki koi bhi machine query instantly solve kar sakte hain. 😊 ${APP_LINK}?user=${phone}`,
    // Day 7
    `${name} ji, kya aapko kisi machine ki zaroorat hai ya koi problem solve karni hai? Bata dein, free consultation dete hain! 📞`,
    // Day 15
    `Namaste ${name}! SAI RoloTech mein is mahine special offer chal raha hai. Apni requirement share karein, customize quote bhejte hain. 🏭`,
    // Month 2
    `${name} ji, hum chahte hain ki aapka production smooth chale. Koi machine problem? Ya naye machine ki zaroorat? Free demo book karo!`,
    // Month 3
    `Hi ${name}! Kai customers ne hamare saath switch karke production cost 30% kam ki. Aap bhi discuss karna chahenge? 15-min call?`,
    // Month 4
    `${name} ji, last message — agar future mein kabhi bhi machine ki zaroorat ho, SAI RoloTech yaad rakhein. Shukriya! 🙏`,
  ];

  const msg = MESSAGES[Math.min(dayIndex, MESSAGES.length - 1)];
  return sendRaw(phone, msg);
}

/** Send hot lead alert to admin */
export async function sendAdminAlert(lead, event) {
  const ADMIN_PHONE = process.env.ADMIN_PHONE;
  if (!ADMIN_PHONE) return;

  const msg =
`🔥 HOT LEAD ALERT!

Name: ${lead.name}
Phone: ${lead.phone}
Event: ${event}
Score: ${lead.score}
Time: ${new Date().toLocaleString('en-IN')}`;

  return sendRaw(ADMIN_PHONE, msg);
}

/** Send quotation-triggered message */
export async function sendQuotationFollowup(lead) {
  const { phone, name } = lead;
  const existing = getLead(phone);
  if (existing?.dnd) return;

  const msg = `${name} ji! Aapne quotation create kiya — bahut achha! 🎉

Kya main aapki further help kar sakta hoon?
- Machine specs ke baare mein?
- Delivery timeline?  
- Installation support?

Batayein, hum ready hain! 😊`;

  return sendRaw(phone, msg);
}

/** Handle incoming message — check DND keywords */
export async function handleIncoming(phone, message) {
  const lower = message.toLowerCase().trim();
  const DND_WORDS = ['stop', 'remove', 'no message', 'mat bhejo', 'band karo', 'unsubscribe'];

  if (DND_WORDS.some(w => lower.includes(w))) {
    markDND(phone);
    console.log(`🚫 DND set for ${phone}`);
    await sendRaw(phone, 'Aapko unsubscribe kar diya gaya hai. Agar future mein zaroorat ho toh contact karein. 🙏');
    return { dnd: true };
  }

  return { dnd: false, message };
}

/** Send daily report to admin via WhatsApp */
export async function sendDailyReport(stats) {
  const ADMIN_PHONE = process.env.ADMIN_PHONE;
  if (!ADMIN_PHONE) return;

  const msg =
`📊 SAI RoloTech Daily Report
${new Date().toLocaleDateString('en-IN')}

👥 Total Leads: ${stats.total}
🔥 Hot: ${stats.hot} | Very Hot: ${stats.veryHot}
🌡️ Warm: ${stats.warm} | ❄️ Cold: ${stats.cold}
📱 App Installed: ${stats.appInstalled}
📅 Meetings: ${stats.meetings}
🚫 DND: ${stats.dnd}`;

  return sendRaw(ADMIN_PHONE, msg);
}

export { isConfigured };
