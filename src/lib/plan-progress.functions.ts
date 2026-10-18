import { createServerFn } from '@tanstack/react-start';
import { getCookie, getRequest, setCookie, setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { goals } from './goals';

const profile = z.string().max(64).refine(value => {
  const [gender, goal] = value.split(':');
  return (gender === 'male' || gender === 'female') && goals.some(item => item.id === goal) && value === `${gender}:${goal}`;
});

async function deviceHash(create: boolean) {
  setResponseHeader('Cache-Control', 'no-store');
  let token = getCookie('fitness_device');
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) throw new Error('Please reload your plan before saving.');
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join('');
    setCookie('fitness_device', token, { httpOnly: true, secure: new URL(getRequest().url).protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 31536000 });
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
}

export const readPlanProgress = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ profile }))
  .handler(async ({ data }) => {
    const hash = await deviceHash(true);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: rows, error } = await supabaseAdmin.from('plan_progress').select('day').eq('device_hash', hash).eq('profile_key', data.profile).order('day');
    if (error) throw new Error('Your saved progress could not be loaded.');
    return { days: (rows ?? []).map(row => row.day) };
  });

export const updatePlanProgress = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ profile, day: z.number().int().min(1).max(30), completed: z.boolean() }))
  .handler(async ({ data }) => {
    // The unguessable HttpOnly cookie is the ownership capability; never accept an owner from input.
    const hash = await deviceHash(false);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = data.completed
      ? await supabaseAdmin.from('plan_progress').upsert({ device_hash: hash, profile_key: data.profile, day: data.day }, { onConflict: 'device_hash,profile_key,day' })
      : await supabaseAdmin.from('plan_progress').delete().eq('device_hash', hash).eq('profile_key', data.profile).eq('day', data.day);
    if (result.error) throw new Error('Your progress could not be saved. Please try again.');
    return { saved: true };
  });