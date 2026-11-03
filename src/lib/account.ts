// Browser-safe account rules shared by the dashboard and tests.

export const NAME_LOCK_DAYS = 30;
const DAY = 86_400_000;

export type MemberCard = { id: string; display_name: string; avatar_url: string | null; avatar_path: string | null };

/** When the member may next change their name, or null if they may change it now. */
export function nextNameChange(nameChangedAt: string | null, now = new Date()) {
  if (!nameChangedAt) return null;
  const next = new Date(new Date(nameChangedAt).getTime() + NAME_LOCK_DAYS * DAY);
  return next > now ? next : null;
}

export function validDisplayName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 40;
}

function localDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days since the plan was started (0 on the start day). */
export function daysSinceStart(startedAt: string, now = new Date()) {
  return Math.max(0, Math.round((localDay(now) - localDay(new Date(startedAt))) / DAY));
}

/** Current plan day, 1 on the start day and capped at 30. */
export function currentPlanDay(startedAt: string, now = new Date()) {
  return Math.min(30, daysSinceStart(startedAt, now) + 1);
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || '?';
}
