import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Leaf, ListChecks, Zap, Circle, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuestionnaire } from './questionnaire-context';
import { questions, isValidAnswer } from '@/lib/questionnaire';
import { goals, type Gender, type GoalId } from '@/lib/goals';
import { characterPoses, dayImage } from '@/lib/character-poses';
import { usePlanProgress } from './use-plan-progress';
import { planDays, planLevel, planStages } from '@/lib/plan';

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
    const interval = window.setInterval(() => setProgress(previous => Math.min(100, previous + 1)), 45);
    const finish = window.setTimeout(() => { window.clearInterval(interval); setReady(true); window.scrollTo(0, 0); }, 4900);
    return () => { window.clearInterval(interval); window.clearTimeout(finish); };
  }, [complete]);
  const returning = !complete && saved.loaded && saved.days.length > 0;
  const selected = goals.find(item => item.id === goal);
  const level = planLevel(answers);
  const startImage = characterPoses[gender].loading;

  if (!complete && !saved.loaded && !saved.error) return <main className="plan-loading"><p role="status">Loading saved progress…</p></main>;
  if (!complete && !returning) return <main className="goal-page question-page"><div className="question-complete"><h1>Complete your profile</h1><Button variant="next" asChild><Link to="/continue" search={{ gender, goal }}>Continue<ArrowRight /></Link></Button></div></main>;

  if (!ready && !returning) return <main className="plan-loading" aria-busy="true">
    <img src={startImage} alt="Your fitness coach" width={768} height={1024} />
    <h1>Preparing your journey</h1><p>{selected?.label} · {level.label}</p>
    <div className="plan-loading-number" role="progressbar" aria-label="Preparing your plan" aria-valuemin={1} aria-valuemax={100} aria-valuenow={progress}>{progress}<span>%</span></div>
    <progress className="plan-loading-track" value={progress} max={100} />
    <div className="plan-loading-checks"><span><Check />Fitness profile</span><span>{progress > 40 ? <Check /> : <span className="plan-loading-dot" />}Activity & recovery</span><span>{progress > 75 ? <Check /> : <span className="plan-loading-dot" />}30-day calendar</span></div>
  </main>;

  return <main className="plan-page">
    <header className="plan-heading"><Button variant="ghost" size="icon" asChild><Link to="/continue/$step" params={{ step: 'time' }} search={{ gender, goal }} aria-label="Review workout time" title="Review workout time"><ArrowLeft /></Link></Button><span>YOUR FITNESS JOURNEY</span></header>
    <h1>{selected?.label}<span>30-day plan</span></h1>
    <section className="plan-summary" aria-label="Your plan overview">
      <div className="plan-summary-copy">{complete && <div className="plan-intensity" aria-label={`${level.label} fitness level`}>{[1, 2, 3].map(value => <Zap key={value} className={value <= level.intensity ? 'is-active' : ''} />)}</div>}<h2>{complete ? level.label : 'Your progress'}</h2><div className="plan-finished"><span>{finished}% Finished</span><progress value={saved.days.length} max={30} aria-label="Plan completion" /></div><p className="plan-progress-detail">{saved.days.length} / 30 days completed</p></div>
      <img src={characterPoses[gender].summary} alt={`${selected?.label} fitness character`} width={384} height={512} />
    </section>
    <div className="plan-progress-grid" aria-label="30-day progress">{planDays.map(({ day }) => <span key={day} className={saved.days.includes(day) ? 'is-done' : ''} aria-label={`Day ${day}: ${saved.days.includes(day) ? 'completed' : 'not completed'}`}>{day}</span>)}</div>
    <div className={`plan-save-status ${saved.error ? 'plan-save-error' : ''}`} role="status">{saved.error || (saved.saving ? 'Saving progress…' : !saved.loaded ? 'Loading saved progress…' : saved.days.length === 30 ? 'All 30 days completed!' : 'Progress saved on this browser')}{saved.error && !saved.loaded && <Button variant="link" onClick={saved.retry}>Try again</Button>}</div>
    {planStages.map((stage, index) => <section className="plan-stage" key={stage} aria-label={`Stage ${index + 1}`}><h2>Stage {index + 1}<span>{stage}</span></h2>
      <ol className="plan-timeline">{planDays.filter(day => day.stage === index + 1).map(({ day, rest }) => <li className={`plan-day-row ${day === currentDay ? 'is-current' : ''}`} key={day}>
        <span className="plan-timeline-dot" aria-hidden="true" />
        <article className={`plan-day ${day === currentDay ? 'plan-day-current' : ''} ${rest ? 'plan-day-rest' : ''} ${saved.days.includes(day) ? 'plan-day-done' : ''}`} aria-label={`Day ${day}${rest ? ', rest day' : ''}`}>
          <div className="plan-day-copy"><h3>Day {day}</h3><p>{rest ? 'Rest & recharge' : day === 1 ? 'Let’s get started' : 'Workout day'}</p>{rest && <Leaf className="plan-rest-leaf" aria-hidden="true" />}</div>
          {!rest && <img src={dayImage(gender, day)} alt="" width={768} height={1024} loading="lazy" />}
          <Button variant="outline" className="plan-complete-button" aria-label={`${saved.days.includes(day) ? 'Undo completion for' : 'Mark complete'} day ${day}`} aria-pressed={saved.days.includes(day)} disabled={!saved.loaded || saved.saving} onClick={() => void saved.toggle(day)}>{saved.days.includes(day) ? <Undo2 /> : <Circle />}{saved.days.includes(day) ? 'Completed' : rest ? 'Rest day complete' : 'Mark complete'}{saved.days.includes(day) && <Check />}</Button>
        </article>
      </li>)}</ol>
    </section>)}
    <div className="plan-end"><ListChecks /><span>Your 30-day journey</span></div>
  </main>;
}