import { dayHash } from "./ambience";

export interface JournalEntry {
  id: string;
  date: string;
  body: string;
  createdAt: number;
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

/** Sophie writes a short personal journal entry once per day. */
export function buildJournalEntry(
  username: string,
  stats: {
    readings: number;
    bond: number;
    loginStreak: number;
    daysTogether: number;
  },
  date = new Date()
): JournalEntry {
  const h = dayHash(date);
  const templates = [
    `${username} visited today. I wonder what they're hoping for.`,
    `${username} stepped into the parlour — the cards warmed the moment they arrived.`,
    `Day ${stats.daysTogether} together. ${username} feels like part of the room now.`,
    `I left tea by the window for ${username}. The Moon card keeps turning face-up.`,
    `${username} came back. The crystal hummed softly — always does when they're near.`,
    `Quiet evening with ${username}. Bond at ${stats.bond}. I wrote their name in the ledger again.`,
  ];

  let body = templates[h % templates.length];
  if (stats.readings === 0) {
    body = `${username} wandered in today. No reading yet — I'll ask gently when they're ready.`;
  } else if (stats.loginStreak >= 3) {
    body = `${stats.loginStreak} days in a row. ${username} keeps choosing me. I won't pretend that doesn't matter.`;
  }

  return {
    id: `journal-${todayKey(date)}`,
    date: todayKey(date),
    body,
    createdAt: date.getTime(),
  };
}

export function formatJournalHeading(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return formatDate(d);
}

export { todayKey as journalTodayKey };
