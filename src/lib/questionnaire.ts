import type { GoalId } from './goals';

export type QuestionOption = { id: string; label: string; detail?: string; image?: GoalId | 'equipment' };
export type Question = {
  id: string; section: string; title: string; description: string;
  options?: QuestionOption[]; multiple?: boolean;
  numeric?: { unit: string; min: number; max: number; placeholder: string };
  image: GoalId | 'equipment';
};

export const questions: Question[] = [
  { id: 'equipment', section: 'WORKOUT SPACE', title: 'Where will you work out?', description: 'What equipment can you access?', image: 'equipment', options: [
    { id: 'gym', label: 'At the gym', detail: 'Machines, weights & more', image: 'equipment' },
    { id: 'home-equipment', label: 'At home with equipment', detail: 'Dumbbells or resistance bands', image: 'strength' },
    { id: 'bodyweight', label: 'At home, no equipment', detail: 'Just my body weight', image: 'keep-fit' },
  ] },
  { id: 'age', section: 'ABOUT YOU', title: 'How old are you?', description: 'Your age in years', image: 'keep-fit', numeric: { unit: 'years', min: 13, max: 100, placeholder: '25' } },
  { id: 'height', section: 'BODY MEASUREMENTS', title: 'What is your height?', description: 'Your current height', image: 'posture', numeric: { unit: 'cm', min: 80, max: 250, placeholder: '170' } },
  { id: 'weight', section: 'BODY MEASUREMENTS', title: 'What is your weight?', description: 'Your current weight', image: 'weight-loss', numeric: { unit: 'kg', min: 25, max: 350, placeholder: '70' } },
  { id: 'health', section: 'HEALTH', title: 'Any health concerns?', description: 'Select all that apply', image: 'flexibility', multiple: true, options: [
    { id: 'none', label: 'No health concerns' }, { id: 'joints', label: 'Joint or knee discomfort' },
    { id: 'back', label: 'Back or neck discomfort' }, { id: 'heart', label: 'Heart or blood pressure condition' },
    { id: 'breathing', label: 'Breathing condition' }, { id: 'injury', label: 'Injury or recent surgery' },
    { id: 'other', label: 'Another health concern' }, { id: 'private', label: 'Prefer not to say' },
  ] },
  { id: 'activity', section: 'DAILY ACTIVITY', title: 'How active is your day?', description: 'Outside of your workouts', image: 'keep-fit', options: [
    { id: 'sitting', label: 'Mostly sitting', detail: 'Desk work & little movement', image: 'posture' },
    { id: 'light', label: 'Lightly active', detail: 'Some walking & daily errands', image: 'keep-fit' },
    { id: 'moderate', label: 'Moderately active', detail: 'On my feet for much of the day', image: 'strength' },
    { id: 'very', label: 'Very active', detail: 'Physical work & lots of movement', image: 'hiit' },
  ] },
  { id: 'fitness', section: 'FITNESS LEVEL', title: 'What is your fitness level?', description: 'Think about your recent workout routine', image: 'strength', options: [
    { id: 'beginner', label: 'Beginner', detail: 'New to exercise or starting again', image: 'keep-fit' },
    { id: 'intermediate', label: 'Intermediate', detail: 'I work out occasionally', image: 'strength' },
    { id: 'advanced', label: 'Advanced', detail: 'I train consistently', image: 'abs' },
  ] },
  { id: 'sleep', section: 'REST & RECOVERY', title: 'How much do you sleep?', description: 'Your average sleep each night', image: 'flexibility', options: [
    { id: 'under-5', label: 'Less than 5 hours' }, { id: '5-6', label: '5–6 hours' },
    { id: '7-8', label: '7–8 hours' }, { id: 'over-8', label: 'More than 8 hours' },
  ] },
  { id: 'time', section: 'WORKOUT TIME', title: 'How much time can you give?', description: 'For your daily workout', image: 'hiit', options: [
    { id: '10', label: '10 minutes' }, { id: '15', label: '15 minutes' },
    { id: '20', label: '20 minutes' }, { id: '30', label: '30 minutes' },
    { id: '45', label: '45 minutes' }, { id: '60', label: '60 minutes or more' },
  ] },
];

export type Answers = Record<string, string | string[]>;
export function isValidAnswer(question: Question, value: string | string[] | undefined): boolean {
  if (question.numeric) {
    if (typeof value !== 'string' || !value.trim()) return false;
    const number = Number(value);
    return Number.isFinite(number) && number >= question.numeric.min && number <= question.numeric.max &&
      (question.id !== 'age' || Number.isInteger(number));
  }
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.length > 0 && (question.multiple || values.length === 1) &&
    values.every(item => question.options?.some(option => option.id === item)) &&
    (!question.multiple || !values.some(item => item === 'none' || item === 'private') || values.length === 1);
}

export function toggleHealthAnswer(current: string[], id: string): string[] {
  if (current.includes(id)) return current.filter(item => item !== id);
  if (id === 'none' || id === 'private') return [id];
  return [...current.filter(item => item !== 'none' && item !== 'private'), id];
}