import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Leaf, Zap, Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuestionnaire } from './questionnaire-context';
import { questions, isValidAnswer } from '@/lib/questionnaire';
import { goals, type Gender, type GoalId } from '@/lib/goals';
import { characterPoses, dayImage, restImage } from '@/lib/character-poses';
import { usePlanProgress } from './use-plan-progress';
import { planDays, planLevel, planStages } from '@/lib/plan';

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
  const complete = questions.every(question => isValidAnswer(question, answers[question.id]));
  const [progress, setProgress] = useState(1);
  const [ready, setReady] = useState(false);
  const saved = usePlanProgress(`${gender}:${goal}`);
  const finished = Math.round(saved.days.length / 30 * 100);
  const currentDay = planDays.find(item => !saved.days.includes(item.day))?.day;
  useEffect(() => {
    if (!complete) return;
    const interval = window.setInterval(() => setProgress(previous => Math.min(100, previous + 1)), 48);
    const finish = window.setTimeout(() => { window.clearInterval(interval); setReady(true); window.scrollTo(0, 0); }, 5400);
    return () => { window.clearInterval(interval); window.clearTimeout(finish); };
  }, [complete]);
  const returning = !complete && saved.loaded && saved.days.length > 0;
  const selected = goals.find(item => item.id === goal);
  const level = planLevel(answers);
  const startImage = characterPoses[gender].loading;
  const activeStep = preparationSteps.find(step => progress < step.at + 14) ?? preparationSteps[preparationSteps.length - 1];

  if (!complete && !saved.loaded && !saved.error) return <main className="plan-loading"><p role="status">Loading saved progress…</p></main>;
  if (!complete && !returning) return <main className="goal-page question-page"><div className="question-complete"><h1>Complete your profile</h1><Button variant="next" asChild><Link to="/continue" search={{ gender, goal }}>Continue<ArrowRight /></Link></Button></div></main>;

  if (!ready && !returning) return <main className="plan-loading" aria-busy="true">
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
      <p className="plan-loading-status" role="status">{activeStep.label}…</p>
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

  return <main className="plan-page">
    <header className="plan-topbar">
      <Button variant="ghost" size="icon" asChild><Link to="/continue/$step" params={{ step: 'time' }} search={{ gender, goal }} aria-label="Review workout time" title="Review workout time"><ArrowLeft /></Link></Button>
      <span className="plan-streak"><Flame aria-hidden="true" />{saved.days.length}</span>
    </header>
    <p className="plan-eyebrow">30 days</p>
    <h1 className="plan-title">{selected?.label}</h1>
    <div className="plan-progress-line">
      <span>{finished}%</span>
      <progress value={saved.days.length} max={30} aria-label="Plan completion" />
    </div>
    <p className="plan-progress-detail">{saved.days.length} / 30 days completed · {level.label} level
      {complete && <span className="plan-intensity" aria-label={`${level.label} fitness level`}>{[1, 2, 3].map(value => <Zap key={value} className={value <= level.intensity ? 'is-active' : ''} />)}</span>}
    </p>
    <div className={`plan-save-status ${saved.error ? 'plan-save-error' : ''}`} role="status">{saved.error || (saved.saving ? 'Saving progress…' : !saved.loaded ? 'Loading saved progress…' : saved.days.length === 30 ? 'All 30 days completed!' : 'Progress saved on this browser')}{saved.error && !saved.loaded && <Button variant="link" onClick={saved.retry}>Try again</Button>}</div>
    {planStages.map((stage, index) => <section className="plan-week" key={stage} aria-label={`Week ${index + 1}`}>
      <h2>Week {index + 1}</h2>
      <p>{stage}</p>
      <div className="plan-days">{planDays.filter(day => day.stage === index + 1).map(({ day, rest }) => {
        const done = saved.days.includes(day);
        const current = day === currentDay;
        const image = rest ? restImage(gender, day) : dayImage(gender, day);
        return <article key={day} className={`plan-day ${current ? 'plan-day-current' : ''} ${rest ? 'plan-day-rest' : ''} ${done ? 'plan-day-done' : ''}`} aria-label={`Day ${day}${rest ? ', rest day' : ''}${done ? ', completed' : ''}`}>
          <span className="plan-day-thumb">{image ? <img src={image} alt="" width={768} height={1024} loading="lazy" /> : <Leaf aria-hidden="true" />}</span>
          <div className="plan-day-copy"><h3>Day {day}</h3><p>{rest ? 'Rest day' : done ? 'Completed' : current ? 'Up next' : 'Workout day'}</p></div>
          <Button variant="outline" className="plan-day-action" aria-label={`${done ? 'Undo completion for' : 'Mark complete'} day ${day}`} aria-pressed={done} disabled={!saved.loaded || saved.saving} onClick={() => void saved.toggle(day)}>{done ? <Check /> : <ArrowRight />}</Button>
        </article>;
      })}</div>
    </section>)}
    <div className="plan-end"><span>Your 30-day journey</span></div>
  </main>;
}
