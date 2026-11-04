import { describe, expect, it } from 'vitest';
import { currentPlanDay, daysSinceStart, nextNameChange } from '@/lib/account';
import { bedtimeFor, dailyCalories, sleepTargetHours } from '@/lib/recovery';

const answers = { age: '25', height: '180', weight: '80', activity: 'moderate', fitness: 'beginner', sleep: '5-6' };

describe('name changes', () => {
  it('allows a first name change at any time', () => {
    expect(nextNameChange(null)).toBeNull();
  });
  it('locks the name for 30 days after a change', () => {
    const now = new Date('2026-11-02T10:00:00Z');
    expect(nextNameChange('2026-10-23T10:00:00Z', now)?.toISOString()).toBe('2026-11-22T10:00:00.000Z');
  });
  it('unlocks the name once 30 days have passed', () => {
    expect(nextNameChange('2026-10-01T10:00:00Z', new Date('2026-11-02T10:00:00Z'))).toBeNull();
  });
});

describe('plan start tracking', () => {
  it('counts the days since the plan was started', () => {
    expect(daysSinceStart('2026-10-25T09:00:00', new Date('2026-11-02T20:00:00'))).toBe(8);
  });
  it('caps the current plan day at 30', () => {
    expect(currentPlanDay('2026-09-01T09:00:00', new Date('2026-11-02T09:00:00'))).toBe(30);
  });
});

describe('recovery formula', () => {
  it('uses height, weight, age and activity for daily calories', () => {
    expect(dailyCalories({ gender: 'male', goal: 'keep-fit', answers })).toEqual({ maintenance: 2800, target: 2800 });
  });
  it('lowers calories by 450 for weight loss', () => {
    expect(dailyCalories({ gender: 'male', goal: 'weight-loss', answers }).target).toBe(2350);
  });
  it('keeps teenagers on maintenance calories', () => {
    const teen = { ...answers, age: '16' };
    const result = dailyCalories({ gender: 'male', goal: 'weight-loss', answers: teen });
    expect(result.target).toBe(result.maintenance);
  });
  it('recommends 8 hours of sleep for adults and a matching bedtime', () => {
    expect(sleepTargetHours(answers)).toBe(8);
    expect(bedtimeFor('07:00', 8)).toBe('22:45');
  });
});
