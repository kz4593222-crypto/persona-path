import type { Answers } from './questionnaire';

export const planDays = Array.from({ length: 30 }, (_, index) => ({
  day: index + 1,
  rest: (index + 1) % 7 === 0,
  stage: Math.floor(index / 7) + 1,
}));

export const planStages = ['Start Strong', 'Find Your Rhythm', 'Build Momentum', 'Keep Going', 'Finish Strong'];

export function planLevel(answers: Answers) {
  if (answers['fitness'] === 'advanced') return { label: 'Advanced', intensity: 3 };
  if (answers['fitness'] === 'intermediate') return { label: 'Intermediate', intensity: 2 };
  return { label: 'Beginner', intensity: 1 };
}