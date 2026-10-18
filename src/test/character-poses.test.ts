import { describe, expect, it } from 'vitest';
import { characterPoses, dayImage, questionImage } from '@/lib/character-poses';
import { questions } from '@/lib/questionnaire';

describe('Distinct illustration slots', () => {
  for (const gender of ['male', 'female'] as const) {
    it(`${gender} uses a distinct asset for every visible slot`, () => {
      const poses = characterPoses[gender];
      const slots = [poses.questions.gender, ...Object.values(poses.goals), poses.loading, poses.summary,
        ...questions.flatMap(question => question.options?.some(option => option.image)
          ? question.options.filter(option => option.image).map(option => questionImage(gender, question.id, option.id))
          : [questionImage(gender, question.id)]), ...poses.days];
      expect(new Set(slots).size).toBe(slots.length);
      expect(poses.days).toHaveLength(26);
      for (let day = 1; day <= 30; day++) expect(Boolean(dayImage(gender, day))).toBe(day % 7 !== 0);
    });
  }
});