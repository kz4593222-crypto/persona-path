import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuestionnaire } from './questionnaire-context';
import { questions, isValidAnswer } from '@/lib/questionnaire';
import { goals, type Gender, type GoalId } from '@/lib/goals';
import { characterPoses } from '@/lib/character-poses';
import { planLevel } from '@/lib/plan';
import { supabase } from '@/integrations/supabase/client';
import { saveFitnessProfile } from '@/lib/account.functions';
import { clearPendingPlan, stashPendingPlan } from '@/lib/pending-plan';

const preparationSteps = [
  { at: 5, label: 'Checking your health concerns' },
  { at: 22, label: 'Analyzing your height & weight' },
  { at: 38, label: 'Matching your goal' },
  { at: 54, label: 'Balancing your daily activity' },
  { at: 70, label: 'Planning sleep & recovery' },
  { at: 86, label: 'Scheduling your workout time' },
];

export function FitnessPlan({ gender, goal }: { gender: Gender; goal: GoalId }) {
  const { answers } = useQuestionnaire();
  const navigate = useNavigate();
  const save = useServerFn(saveFitnessProfile);
  const complete = questions.every(question => isValidAnswer(question, answers[question.id]));
  const [progress, setProgress] = useState(1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const handedOff = useRef(false);
  useEffect(() => {
    if (!complete) return;
    const interval = window.setInterval(() => setProgress(previous => Math.min(100, previous + 1)), 48);
    const finish = window.setTimeout(() => { window.clearInterval(interval); setReady(true); }, 5400);
    return () => { window.clearInterval(interval); window.clearTimeout(finish); };
  }, [complete]);
  const handOff = async () => {
    if (handedOff.current) return;
    handedOff.current = true;
    setError('');
    const plan = { gender, goal, answers };
    stashPendingPlan(plan);
    const { data } = await supabase.auth.getUser();
    if (!data.user) { await navigate({ to: '/auth' }); return; }
    try {
      await save({ data: plan });
      clearPendingPlan();
      await navigate({ to: '/dashboard', replace: true });
    } catch {
      handedOff.current = false;
      setError('Your plan could not be saved. Please try again.');
    }
  };
  useEffect(() => { if (ready) void handOff(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const selected = goals.find(item => item.id === goal);
  const level = planLevel(answers);
  const startImage = characterPoses[gender].loading;
  const activeStep = preparationSteps.find(step => progress < step.at + 14) ?? preparationSteps.at(-1);

  if (!complete) return <main className="goal-page question-page"><div className="question-complete"><h1>Complete your profile</h1><Button variant="next" asChild><Link to="/continue" search={{ gender, goal }}>Continue<ArrowRight /></Link></Button><Button variant="link" asChild><Link to="/dashboard">Open my dashboard</Link></Button></div></main>;

  return <main className="plan-loading" aria-busy="true">
    <div className="plan-loading-card">
      <div className="plan-loading-hero">
        <img src={startImage} alt="Your fitness coach" width={768} height={1024} />
        <div className="plan-loading-hero-copy">
          <span className="plan-loading-eyebrow"><Loader2 className="plan-loading-spin" aria-hidden="true" />Building your plan</span>
          <h1>Creating your perfect 30-day journey</h1>
          <p>{selected?.label} · {level.label}</p>
        </div>
      </div>
      <div className="plan-loading-meter">
        <div className="plan-loading-number" role="progressbar" aria-label="Preparing your plan" aria-valuemin={1} aria-valuemax={100} aria-valuenow={progress}>{progress}<span>%</span></div>
        <progress className="plan-loading-track" value={progress} max={100} />
      </div>
      <p className="plan-loading-status" role="status">{error || (ready ? 'Your plan is ready' : `${activeStep?.label}…`)}</p>
      {error && <Button variant="next" onClick={() => void handOff()}>Try again</Button>}
      <ul className="plan-loading-checks">
        {preparationSteps.map(step => {
          const done = progress >= step.at + 14;
          const active = !done && step === activeStep;
          return <li key={step.label} className={done ? 'is-done' : active ? 'is-active' : ''}>
            <span className="plan-loading-mark">{done ? <Check /> : active ? <Loader2 className="plan-loading-spin" /> : null}</span>
            {step.label}
          </li>;
        })}
      </ul>
    </div>
  </main>;
}
