import { describe, expect, it } from 'vitest';
import { planDays, planLevel, planDayColor } from '@/lib/plan';

describe('Plan overview', () => {
  it('gives every day box the same colour as Day 1', () => {
    expect(new Set(Array.from({ length: 30 }, (_, index) => planDayColor(index + 1)))).toEqual(new Set([planDayColor(1)]));
  });
  it('contains 30 consecutive days and one rest day after every six workouts', () => {
    expect(planDays.map(item => item.day)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    expect(planDays.filter(item => item.rest).map(item => item.day)).toEqual([7, 14, 21, 28]);
    expect(planDays.filter(item => !item.rest)).toHaveLength(26);
  });
  it('uses the declared fitness level without medical or routine inference', () => {
    expect(planLevel({ fitness: 'beginner' }).label).toBe('Beginner');
    expect(planLevel({ fitness: 'intermediate' }).label).toBe('Intermediate');
    expect(planLevel({ fitness: 'advanced' }).label).toBe('Advanced');
  });
});