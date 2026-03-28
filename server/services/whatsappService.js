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
import { isEnabled, increment, logError, isWithinDailyLimit, retryOperation } from './configService.js';

function isConfigured() {
  return !!(WA_TOKEN && PHONE_ID);
}

async function sendRaw(to, body) {
  // ── Control Panel checks ─────────────────────────────────────────────────
  if (!isEnabled('whatsappEnabled')) {
    console.log(`📵 [WA BLOCKED] WhatsApp disabled via Control Panel. To: ${to}`);
    return { blocked: true, reason: 'whatsapp_disabled' };
  }

  if (!isWithinDailyLimit()) {
    console.warn(`⛔ [WA LIMIT] Daily limit reached. Message to ${to} dropped.`);
    logError('WhatsApp', 'Daily message limit reached', `Attempted to send to ${to}`);
    return { blocked: true, reason: 'daily_limit_reached' };
  }

  if (!isConfigured()) {
    console.log(`📱 [WA MOCK] To: ${to}\n${body}`);
    increment('whatsappSent');
    return { mock: true };
  }

  // ── Send with auto-retry ─────────────────────────────────────────────────
  try {
    const result = await retryOperation(async () => {
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
        throw new Error(`WA API ${res.status}: ${err}`);
      }
      return res.json();
    }, 3, 1000); // 3 retries, 1s → 2s → 4s backoff

    increment('whatsappSent');
    return result;
  } catch (e) {
    increment('whatsappFailed');
    logError('WhatsApp', e.message, `To: ${to} | Message: ${body.slice(0, 80)}`);
    throw e;
  }
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

  const loc = existing?.locationPriority || 'UNKNOWN';

  // Location-aware message templates
  const NEAR_MESSAGES = [
    `Hi ${name}! App download kiya? Aap Delhi/NCR mein hain — hum same-day visit arrange kar sakte hain! 🔥 ${APP_LINK}?user=${phone}`,
    `${name} ji, aap nearby hain isliye personally discuss karna chahenge? Free factory visit arrange karte hain — bas ek call karein! 📞`,
    `Namaste ${name}! Nearby customers ke liye fast delivery + free installation support dete hain. Apni requirement share karein! 🏭`,
    `${name} ji, 2-3 din mein machine demo arrange kar sakte hain aapke paas. Kab convenient rahega? Meeting fix karte hain! 📅`,
    `Hi ${name}! Nearby hone ki wajah se 48-hour delivery aur lifetime support milta hai. Kya is week discuss kar sakte hain?`,
    `${name} ji, last message — kabhi bhi machine ki zaroorat ho, SAI RoloTech ek call door hai. Hum Delhi/NCR mein hain! 🙏`,
  ];

  const MEDIUM_MESSAGES = [
    `Hi ${name}! App download kiya? Hum aapki machine query instantly solve kar sakte hain — free consultation bhi! ${APP_LINK}?user=${phone}`,
    `${name} ji, aapki requirement ke hisaab se best machine suggest kar sakte hain. Detail share karein, quote bhejte hain! 📋`,
    `Namaste ${name}! Is mahine special offer hai. Customize quote + delivery plan ke saath bhejte hain — bata dein requirements! 🏭`,
    `${name} ji, video call pe machine demo arrange kar sakte hain. Aap interested hain to time fix karte hain!`,
    `Hi ${name}! Customers ne hamare saath switch karke cost 25% kam ki. Aap bhi discuss karna chahenge? 15-min video call?`,
    `${name} ji, last message — future mein machine zaroorat ho to zaroor batayein. SAI RoloTech hamesha available! 🙏`,
  ];

  const FAR_MESSAGES = [
    `Hi ${name}! SAI RoloTech CRM app mein detailed machine info, specs aur quotes mil jaate hain. Explore karein! ${APP_LINK}?user=${phone}`,
    `${name} ji, app mein apni requirement ke hisaab se quote generate kar sakte hain. Koi sawaal ho toh bata dein! 💬`,
    `Namaste ${name}! Aap app mein machine guide aur troubleshooting bhi dekh sakte hain — bilkul free! 🔧`,
    `${name} ji, agar future mein machine ki zaroorat ho toh please consider karein. Online delivery arrangement possible hai!`,
    `Hi ${name}! Aapki requirement note kar li gayi hai. Jab bhi decide karein, main details share kar sakta hoon.`,
    `${name} ji, thank you for considering SAI RoloTech. Kabhi bhi contact karein — always here to help! 🙏`,
  ];

  let MESSAGES;
  if (loc === 'HIGH') MESSAGES = NEAR_MESSAGES;
  else if (loc === 'MEDIUM') MESSAGES = MEDIUM_MESSAGES;
  else MESSAGES = FAR_MESSAGES;

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
