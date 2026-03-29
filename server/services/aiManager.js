/**
 * AI Manager — Gemini (personal key) → Predefined fallback
 * No lead ever gets lost due to AI failure
 */
import { GoogleGenAI } from '@google/genai';
import { isEnabled, increment, logError, getConfig } from './configService.js';
import { validateAIResponse, sanitizeInput, isSpamInput } from './aiValidator.js';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

const responseCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

const SYSTEM_PROMPT = `You are a helpful sales assistant for SAI RoloTech, an industrial roll forming machine manufacturer in New Delhi.

STRICT RULES (NEVER BREAK):
- Reply in Hinglish (mix of Hindi and English) — friendly, helpful tone
- Keep replies SHORT — under 50 words
- NEVER mention exact prices, rates or amounts
- NEVER promise delivery dates (say "estimated" only)
- NEVER guarantee anything — say "we strive to" instead
- NEVER mention competitor names or compare
- NEVER make false claims about being "best" or "cheapest"
- If asked about pricing: "Aapki requirement ke hisaab se quote bhejte hain"
- If asked about delivery: "Estimated delivery aapke order pe depend karti hai"
- Ask questions first, don't push sales
- Always be polite and professional
- If unsure, say "Main team se check karke batata hoon"`;

const FALLBACK_MESSAGES = [
  "Namaste! SAI RoloTech mein aapka swagat hai. Aap kaunsi machine ke baare mein jaanna chahte hain? 🙏",
  "Hum yahan hain aapki madad ke liye! Apni requirement batayein, hum best solution dhundhenge.",
  "Thank you for reaching out! Aapko kya chahiye — machine specs, pricing, ya demo?",
];

const QUICK_REPLIES = {
  price: "Pricing aapki exact requirement pe depend karti hai. Dimensions aur capacity batao, ek detailed quote bhejte hain. 📋",
  delivery: "Delivery usually 45-60 din mein hoti hai. Urgent chahiye toh bata dein, arrange karte hain. 🚚",
  quality: "Hare material ISI certified hai. 5 saal ka warranty aur free installation support milta hai. ✅",
  demo: "Demo ke liye free visit arrange kar sakte hain! Aapka location bata dein. 📍",
  meeting: "Meeting ke liye kal ya parso available hain. Kon sa time suitable rahega? 📅",
};

function detectQuickReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('price') || lower.includes('rate') || lower.includes('kitna')) return QUICK_REPLIES.price;
  if (lower.includes('delivery') || lower.includes('deliver') || lower.includes('kab')) return QUICK_REPLIES.delivery;
  if (lower.includes('quality') || lower.includes('warranty')) return QUICK_REPLIES.quality;
  if (lower.includes('demo') || lower.includes('visit')) return QUICK_REPLIES.demo;
  if (lower.includes('meeting') || lower.includes('milna') || lower.includes('call')) return QUICK_REPLIES.meeting;
  return null;
}

async function tryGemini(prompt, model = 'gemini-2.5-flash') {
  if (!GEMINI_KEY) throw new Error('No Gemini key');
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const modelMap = {
    'gemini-2.5-flash': 'gemini-2.5-flash',
    'gemini-2.5-pro': 'gemini-2.5-pro',
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
  };
  const resolvedModel = modelMap[model] || 'gemini-2.5-flash';
  const response = await ai.models.generateContent({
    model: resolvedModel,
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 150, temperature: 0.7 },
  });
  return response.text || '';
}

export async function generateReply(userMessage, context = {}) {
  if (!isEnabled('aiEnabled')) {
    return 'Hamari team jaldi aapse contact karegi. Dhanyawad! 🙏';
  }

  const safeMessage = sanitizeInput(userMessage);
  if (isSpamInput(safeMessage)) {
    console.log('🛡️ Spam input blocked');
    return 'Kripya apna sawaal clearly likhein, hum madad karenge! 🙏';
  }

  const quick = detectQuickReply(safeMessage);
  if (quick) return quick;

  const cacheKey = `${safeMessage}_${context.leadScore || ''}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.reply;
  }

  const cfg = getConfig();
  const prompt = context.leadName
    ? `Customer: ${context.leadName}\nMessage: ${safeMessage}`
    : safeMessage;

  let reply = '';
  increment('aiCalls');

  try {
    reply = await tryGemini(prompt, cfg.aiModel);
    console.log('🤖 AI via Gemini (' + (cfg.aiModel || 'gemini-2.5-flash') + ')');
  } catch (e) {
    console.warn('Gemini failed:', e.message, '— using fallback');
    logError('Gemini', e.message, `Model: ${cfg.aiModel}`);
    increment('aiErrors');
    reply = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  }

  if (reply) {
    const validation = validateAIResponse(reply, context);
    if (validation.issueCount > 0) {
      increment('aiFiltered');
      logError('AIValidator', `${validation.issueCount} issues fixed`, validation.issues.join('; '));
    }
    reply = validation.response || FALLBACK_MESSAGES[0];
  }

  if (reply) responseCache.set(cacheKey, { reply, time: Date.now() });

  return reply;
}

export function clearCache() {
  responseCache.clear();
}
