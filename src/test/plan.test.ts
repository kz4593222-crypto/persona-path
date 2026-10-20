import { describe, expect, it } from 'vitest';
import { planDays, planLevel, planDayColor } from '@/lib/plan';

describe('Plan overview', () => {
  it('repeats the same seven day colors every week', () => {
    expect(Array.from({ length: 7 }, (_, index) => planDayColor(index + 1))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const firstDay of [8, 15, 22]) {
      expect(Array.from({ length: 7 }, (_, index) => planDayColor(firstDay + index))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
    expect([planDayColor(29), planDayColor(30)]).toEqual([1, 2]);
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