/**
 * AI Manager — OpenRouter (primary) → Gemini (fallback) → Predefined message
 * No lead ever gets lost due to AI failure
 */
import { GoogleGenAI } from '@google/genai';
import { isEnabled, increment, logError, getConfig } from './configService.js';

const GEMINI_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Response cache — same prompt se baar baar AI call nahi karte
const responseCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const SYSTEM_PROMPT = `You are a helpful sales assistant for SAI RoloTech, an industrial roll forming machine manufacturer in New Delhi.

Rules:
- Reply in Hinglish (mix of Hindi and English) — friendly, helpful tone
- Keep replies SHORT — under 50 words
- Never over-promise or use fake urgency
- Ask questions, don't push sales
- Focus on understanding customer needs first
- If asked about pricing, say "Aapki requirement ke hisaab se quote bhejta hoon"`;

const FALLBACK_MESSAGES = [
  "Namaste! SAI RoloTech mein aapka swagat hai. Aap kaunsi machine ke baare mein jaanna chahte hain? 🙏",
  "Hum yahan hain aapki madad ke liye! Apni requirement batayein, hum best solution dhundhenge.",
  "Thank you for reaching out! Aapko kya chahiye — machine specs, pricing, ya demo?",
];

// Predefined quick replies (no AI needed)
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

async function tryOpenRouter(prompt) {
  if (!OPENROUTER_KEY) throw new Error('No OpenRouter key');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sairolotech.com',
      'X-Title': 'SAI RoloTech CRM',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function tryGemini(prompt, model = 'gemini-1.5-flash') {
  if (!GEMINI_KEY) throw new Error('No Gemini key');
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  // Map control panel model names to Gemini API model IDs
  const modelMap = {
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'mistral-7b': 'gemini-1.5-flash', // fallback to gemini if OpenRouter used for mistral
  };
  const resolvedModel = modelMap[model] || 'gemini-1.5-flash';
  const response = await ai.models.generateContent({
    model: resolvedModel,
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 150, temperature: 0.7 },
  });
  return response.text || '';
}

export async function generateReply(userMessage, context = {}) {
  // 0. Check if AI is enabled via Control Panel
  if (!isEnabled('aiEnabled')) {
    return 'Hamari team jaldi aapse contact karegi. Dhanyawad! 🙏';
  }

  // 1. Check for predefined quick reply (fastest, no API cost)
  const quick = detectQuickReply(userMessage);
  if (quick) return quick;

  // 2. Check cache
  const cacheKey = `${userMessage}_${context.leadScore || ''}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.reply;
  }

  // Use model from Control Panel config
  const cfg = getConfig();
  const prompt = context.leadName
    ? `Customer: ${context.leadName}\nMessage: ${userMessage}`
    : userMessage;

  let reply = '';
  increment('aiCalls');

  // 3. Try OpenRouter
  try {
    reply = await tryOpenRouter(prompt);
    console.log('🤖 AI via OpenRouter');
  } catch (e1) {
    console.warn('OpenRouter failed:', e1.message, '— trying Gemini...');
    logError('OpenRouter', e1.message, `Prompt: ${prompt.slice(0, 100)}`);

    // 4. Try Gemini
    try {
      reply = await tryGemini(prompt, cfg.aiModel);
      console.log('🤖 AI via Gemini (' + cfg.aiModel + ')');
    } catch (e2) {
      console.warn('Gemini failed:', e2.message, '— using fallback');
      logError('Gemini', e2.message, `Model: ${cfg.aiModel}`);
      increment('aiErrors');

      // 5. Static fallback
      reply = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
    }
  }

  // Cache successful reply
  if (reply) responseCache.set(cacheKey, { reply, time: Date.now() });

  return reply;
}

export function clearCache() {
  responseCache.clear();
}
