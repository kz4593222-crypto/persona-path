import { queryOptions, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Answers } from '@/lib/questionnaire';
import type { Gender, GoalId } from '@/lib/goals';
import type { MemberCard } from '@/lib/account';

export type FitnessProfile = { gender: Gender; goal: GoalId; answers: Answers; plan_started_at: string };
export type Account = {
  userId: string;
  email: string | null;
  profile: MemberCard & { name_changed_at: string | null };
  fitness: FitnessProfile | null;
};

export const accountQuery = queryOptions({
  queryKey: ['account'],
  queryFn: async (): Promise<Account> => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Please sign in again.');
    const [profile, fitness] = await Promise.all([
      supabase.from('profiles').select('id, display_name, avatar_url, avatar_path, name_changed_at').eq('id', auth.user.id).maybeSingle(),
      supabase.from('fitness_profiles').select('gender, goal, answers, plan_started_at').eq('user_id', auth.user.id).maybeSingle(),
    ]);
    if (profile.error || fitness.error) throw new Error('Your account could not be loaded.');
    return {
      userId: auth.user.id,
      email: auth.user.email ?? null,
      profile: profile.data ?? { id: auth.user.id, display_name: 'Member', avatar_url: null, avatar_path: null, name_changed_at: null },
      fitness: fitness.data ? { ...fitness.data, answers: (fitness.data.answers ?? {}) as Answers } as FitnessProfile : null,
    };
  },
});

export function useAccount() {
  return useQuery(accountQuery);
}

export function avatarSrc(member: Pick<MemberCard, 'avatar_path' | 'avatar_url'> | null | undefined) {
  if (!member) return null;
  if (member.avatar_path) return supabase.storage.from('avatars').getPublicUrl(member.avatar_path).data.publicUrl;
  return member.avatar_url;
}
