import type { Answers } from './questionnaire';
import type { Gender, GoalId } from './goals';

// Holds a just-finished questionnaire only for this tab while the person signs in
// (sign-in may reload the page); it is cleared as soon as it is saved to the account.
const KEY = 'fitness-pending-plan';
export type PendingPlan = { gender: Gender; goal: GoalId; answers: Answers };

export function stashPendingPlan(plan: PendingPlan) {
  sessionStorage.setItem(KEY, JSON.stringify(plan));
}

export function readPendingPlan(): PendingPlan | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as PendingPlan : null;
  } catch { return null; }
}

export function clearPendingPlan() {
  sessionStorage.removeItem(KEY);
}
