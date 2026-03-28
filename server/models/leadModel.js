/**
 * Lead Model — in-memory store with JSON file persistence
 * MongoDB nahi hone par bhi data save rehta hai restart ke baad
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory store
let leads = new Map(); // phone → lead object

// Load existing leads from file
function loadLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, 'utf8');
      const arr = JSON.parse(raw);
      arr.forEach(l => leads.set(l.phone, l));
      console.log(`📂 Loaded ${arr.length} leads from disk`);
    }
  } catch (err) {
    console.error('⚠️  Could not load leads:', err.message);
  }
}

// Save leads to file (debounced)
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([...leads.values()], null, 2));
    } catch (err) {
      console.error('⚠️  Could not save leads:', err.message);
    }
  }, 1000);
}

loadLeads();

/* ── CRUD Operations ── */

export function createLead({ name, phone, source = 'unknown', email = '', extra = {} }) {
  if (!phone) throw new Error('Phone required');
  const clean = phone.replace(/\D/g, '');
  if (leads.has(clean)) return { existing: true, lead: leads.get(clean) };

  const lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || 'Unknown',
    phone: clean,
    email,
    source,
    score: 'COLD',           // COLD | WARM | HOT | VERY_HOT
    status: 'new',           // new | contacted | active | dnd | converted
    appInstalled: false,
    appOpened: false,
    features: [],            // ['quotation', 'maintenance', 'quality']
    meetingBooked: false,
    dnd: false,
    fcmToken: null,
    followupIndex: 0,        // which follow-up step next
    lastContact: null,
    nextFollowup: null,
    replies: [],
    notes: extra.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  };

  leads.set(clean, lead);
  scheduleSave();
  return { existing: false, lead };
}

export function getLead(phone) {
  return leads.get(phone.replace(/\D/g, '')) || null;
}

export function updateLead(phone, updates) {
  const clean = phone.replace(/\D/g, '');
  const lead = leads.get(clean);
  if (!lead) return null;
  const updated = { ...lead, ...updates, updatedAt: new Date().toISOString() };
  leads.set(clean, updated);
  scheduleSave();
  return updated;
}

export function getAllLeads() {
  return [...leads.values()];
}

export function getLeadsByScore(score) {
  return [...leads.values()].filter(l => l.score === score);
}

export function getActiveLeads() {
  return [...leads.values()].filter(l => !l.dnd && l.status !== 'converted');
}

export function markDND(phone) {
  return updateLead(phone, { dnd: true, status: 'dnd' });
}

/** Score a lead based on activity */
export function recalculateScore(phone) {
  const lead = getLead(phone);
  if (!lead) return null;

  let score = 'COLD';
  if (lead.meetingBooked) score = 'VERY_HOT';
  else if (lead.features.includes('quotation')) score = 'HOT';
  else if (lead.appOpened) score = 'WARM';

  return updateLead(phone, { score });
}

export function getStats() {
  const all = getAllLeads();
  return {
    total: all.length,
    cold: all.filter(l => l.score === 'COLD').length,
    warm: all.filter(l => l.score === 'WARM').length,
    hot: all.filter(l => l.score === 'HOT').length,
    veryHot: all.filter(l => l.score === 'VERY_HOT').length,
    dnd: all.filter(l => l.dnd).length,
    appInstalled: all.filter(l => l.appInstalled).length,
    meetings: all.filter(l => l.meetingBooked).length,
  };
}
