import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { readPlanProgress, updatePlanProgress } from '@/lib/plan-progress.functions';

export function usePlanProgress(profile: string) {
  const read = useServerFn(readPlanProgress);
  const update = useServerFn(updatePlanProgress);
  const [days, setDays] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoaded(false); setDays([]); setError('');
    read({ data: { profile } }).then(result => {
      if (active) { setDays(result.days); setLoaded(true); }
    }).catch(() => { if (active) setError('Saved progress could not be loaded. Try again.'); });
    return () => { active = false; };
  }, [profile, read, reload]);
  const toggle = async (day: number) => {
    if (!loaded || saving) return;
    setSaving(true); setError('');
    const completed = !days.includes(day);
    try {
      await update({ data: { profile, day, completed } });
      setDays(previous => completed ? [...previous, day].sort((a, b) => a - b) : previous.filter(value => value !== day));
    } catch { setError('Progress was not saved. Please try again.'); }
    finally { setSaving(false); }
  };
  return { days, loaded, saving, error, toggle, retry: () => setReload(previous => previous + 1) };
}