import { describe, expect, it } from 'vitest';
import { questions, isValidAnswer, toggleHealthAnswer } from '@/lib/questionnaire';

describe('Personal fitness questions', () => {
  it('includes nine questions with workout duration last', () => {
    expect(questions).toHaveLength(9);
    expect(questions.at(-1)?.id).toBe('time');
    expect(new Set(questions.map(question => question.id)).size).toBe(9);
  });
  it('rejects empty, invalid and out-of-range answers', () => {
    for (const question of questions) {
      expect(isValidAnswer(question, undefined)).toBe(false);
      expect(isValidAnswer(question, 'invalid')).toBe(false);
      if (question.numeric) {
        expect(isValidAnswer(question, String(question.numeric.min - 1))).toBe(false);
        expect(isValidAnswer(question, String(question.numeric.max + 1))).toBe(false);
        expect(isValidAnswer(question, question.numeric.placeholder)).toBe(true);
      } else {
        expect(isValidAnswer(question, question.options?.[0]?.id)).toBe(true);
      }
    }
  });
  it('keeps no concerns and prefer not to say exclusive', () => {
    expect(toggleHealthAnswer(['back'], 'none')).toEqual(['none']);
    expect(toggleHealthAnswer(['none'], 'joints')).toEqual(['joints']);
    expect(toggleHealthAnswer(['joints'], 'back')).toEqual(['joints', 'back']);
    expect(toggleHealthAnswer(['joints', 'back'], 'private')).toEqual(['private']);
    expect(toggleHealthAnswer(['back'], 'back')).toEqual([]);
    const health = questions.find(question => question.id === 'health');
    if (!health) throw new Error('Missing health question');
    expect(isValidAnswer(health, ['none', 'back'])).toBe(false);
    expect(isValidAnswer(health, ['back', 'joints'])).toBe(true);
  });
});