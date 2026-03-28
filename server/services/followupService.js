/**
 * Follow-up Engine — 4 month automated follow-up schedule
 * Queue-based (not just cron) — no lead gets missed
 */
import { enqueue } from './queueService.js';
import { getAllLeads, getActiveLeads, updateLead } from '../models/leadModel.js';

// Schedule: [day, label]
const FOLLOWUP_SCHEDULE = [
  [1,   'day1'],
  [3,   'day3'],
  [7,   'day7'],
  [15,  'day15'],
  [30,  'month1'],
  [60,  'month2'],
  [90,  'month3'],
  [120, 'month4'],
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Schedule all follow-ups for a new lead */
export function scheduleFollowups(lead) {
  const createdAt = new Date(lead.createdAt).getTime();

  FOLLOWUP_SCHEDULE.forEach(([dayOffset, label], index) => {
    const runAt = createdAt + dayOffset * DAY_MS;
    const delayMs = Math.max(0, runAt - Date.now());

    enqueue('SEND_FOLLOWUP', {
      phone: lead.phone,
      followupIndex: index,
      label,
    }, { delayMs });
  });

  console.log(`📅 Scheduled ${FOLLOWUP_SCHEDULE.length} follow-ups for ${lead.phone}`);
}

/** Called when user replies — stop further follow-ups */
export function stopFollowups(phone) {
  updateLead(phone, {
    followupIndex: 999,  // skip all remaining
    lastContact: new Date().toISOString(),
  });
  console.log(`⛔ Follow-ups stopped for ${phone} (user replied)`);
}

/** Called when meeting booked */
export function stopOnMeeting(phone) {
  updateLead(phone, {
    meetingBooked: true,
    followupIndex: 999,
    lastContact: new Date().toISOString(),
  });
  console.log(`📅 Meeting booked, follow-ups stopped for ${phone}`);
}

/** Restart follow-up scheduler on server boot — catch up missed jobs */
export function resumeFollowups() {
  const active = getActiveLeads();
  let resumed = 0;

  active.forEach(lead => {
    if (!lead.nextFollowup) return;

    const due = new Date(lead.nextFollowup).getTime();
    if (due <= Date.now()) {
      // Missed — run now
      enqueue('SEND_FOLLOWUP', {
        phone: lead.phone,
        followupIndex: lead.followupIndex,
        label: 'resume',
      }, { delayMs: 5000 });
      resumed++;
    }
  });

  if (resumed > 0) {
    console.log(`🔄 Resumed ${resumed} missed follow-ups`);
  }
}
