import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { goals } from './goals';
import { questions, isValidAnswer } from './questionnaire';

const planInput = z.object({
  gender: z.enum(['male', 'female']),
  goal: z.string().refine(value => goals.some(goal => goal.id === value)),
  answers: z.record(z.string(), z.union([z.string().max(20), z.array(z.string().max(20)).max(10)])),
}).refine(plan => questions.every(question => isValidAnswer(question, plan.answers[question.id])), 'Please answer every question.');

// Saves the finished questionnaire to the signed-in member. A new goal or profile
// restarts the 30-day plan date; re-saving the same plan keeps the original start.
export const saveFitnessProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(planInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const answers = Object.fromEntries(questions.map(question => [question.id, data.answers[question.id]!]));
    const { data: existing, error: readError } = await supabase.from('fitness_profiles').select('gender, goal').eq('user_id', userId).maybeSingle();
    if (readError) throw new Error('Your plan could not be saved. Please try again.');
    const restart = !existing || existing.gender !== data.gender || existing.goal !== data.goal;
    const row = { user_id: userId, gender: data.gender, goal: data.goal, answers, updated_at: new Date().toISOString(), ...(restart ? { plan_started_at: new Date().toISOString() } : {}) };
    const { error } = await supabase.from('fitness_profiles').upsert(row, { onConflict: 'user_id' });
    if (error) throw new Error('Your plan could not be saved. Please try again.');
    return { saved: true };
  });
