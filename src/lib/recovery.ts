import type { Answers } from './questionnaire';
import type { Gender, GoalId } from './goals';

// Fixed-formula recovery guidance (no AI): Mifflin–St Jeor energy needs,
// goal-based calorie adjustment, protein/water targets and age-based sleep.

const activityFactors: Record<string, number> = { sitting: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
const muscleGoals: GoalId[] = ['abs', 'weight-gain', 'strength', 'chest', 'v-taper', 'hiit'];

export type RecoveryInput = { gender: Gender; goal: GoalId; answers: Answers };

function num(answers: Answers, id: string) {
  const value = Number(answers[id]);
  return Number.isFinite(value) ? value : 0;
}

const round10 = (value: number) => Math.round(value / 10) * 10;

export function bmr(gender: Gender, weightKg: number, heightCm: number, age: number) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
}

export function dailyCalories({ gender, goal, answers }: RecoveryInput) {
  const age = num(answers, 'age');
  const base = bmr(gender, num(answers, 'weight'), num(answers, 'height'), age);
  const maintenance = base * (activityFactors[String(answers['activity'])] ?? 1.375);
  // Teens keep maintenance calories: no deficit or surplus targets under 18.
  let target = maintenance;
  if (age >= 18 && goal === 'weight-loss') target = Math.max(maintenance - 450, gender === 'male' ? 1500 : 1200);
  if (age >= 18 && goal === 'weight-gain') target = maintenance + 350;
  return { maintenance: round10(maintenance), target: round10(target) };
}

export function macros(input: RecoveryInput) {
  const { target } = dailyCalories(input);
  const weight = num(input.answers, 'weight');
  const protein = Math.round(weight * (muscleGoals.includes(input.goal) || input.goal === 'weight-loss' ? 1.8 : 1.5));
  const fat = Math.round(target * 0.27 / 9);
  const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

export function waterLitres(answers: Answers) {
  return Math.round((num(answers, 'weight') * 0.035 + 0.5) * 10) / 10;
}

export function bmi(answers: Answers) {
  const metres = num(answers, 'height') / 100;
  if (!metres) return 0;
  return Math.round(num(answers, 'weight') / (metres * metres) * 10) / 10;
}

export function mealPlan(input: RecoveryInput) {
  const { target } = dailyCalories(input);
  const gain = input.goal === 'weight-gain';
  const lose = input.goal === 'weight-loss';
  return [
    { id: 'breakfast', label: 'Breakfast', share: 0.25, ideas: gain ? 'Oats cooked in milk, banana, peanut butter, 2 eggs' : lose ? 'Vegetable omelette, 1 whole-grain toast, green tea' : 'Eggs or Greek yogurt, oats, seasonal fruit' },
    { id: 'lunch', label: 'Lunch', share: 0.3, ideas: gain ? 'Rice, chicken or lentil curry, salad, yogurt' : lose ? 'Grilled chicken or chickpeas, big salad, 1 small roti' : 'Roti or rice, daal or chicken, mixed vegetables' },
    { id: 'snack', label: 'After workout', share: 0.15, ideas: gain ? 'Milk shake with dates and nuts' : lose ? 'Greek yogurt or a boiled egg with fruit' : 'Yogurt with fruit or a handful of nuts' },
    { id: 'dinner', label: 'Dinner', share: 0.3, ideas: gain ? 'Fish or beef, potatoes, vegetables, raita' : lose ? 'Fish or paneer, sautéed vegetables, soup' : 'Lean protein, vegetables, a small portion of rice' },
  ].map(meal => ({ ...meal, calories: round10(target * meal.share) }));
}

export function sleepTargetHours(answers: Answers) {
  const age = num(answers, 'age');
  if (age < 18) return 9;
  if (age >= 65) return 7.5;
  return answers['fitness'] === 'advanced' ? 8.5 : 8;
}

const currentSleep: Record<string, number> = { 'under-5': 4.5, '5-6': 5.5, '7-8': 7.5, 'over-8': 8.5 };

export function sleepGapHours(answers: Answers) {
  const current = currentSleep[String(answers['sleep'])] ?? 7.5;
  return Math.max(0, sleepTargetHours(answers) - current);
}

/** Bedtime for a wake time ("HH:MM"), leaving 15 minutes to fall asleep. */
export function bedtimeFor(wake: string, targetHours: number) {
  const [hours, minutes] = wake.split(':').map(Number);
  const total = ((hours ?? 0) * 60 + (minutes ?? 0) - targetHours * 60 - 15 + 1440 * 2) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(Math.round(total % 60)).padStart(2, '0')}`;
}

export function needsDoctorNote(answers: Answers) {
  const health = Array.isArray(answers['health']) ? answers['health'] : [];
  return health.some(item => item !== 'none' && item !== 'private');
}
