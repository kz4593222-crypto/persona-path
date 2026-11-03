import { ArrowRight, Check, Flame, Leaf, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { goals, type Gender, type GoalId } from '@/lib/goals';
import { dayImage, restImage } from '@/lib/character-poses';
import { planDays, planLevel, planStages, planDayColor } from '@/lib/plan';
import type { Answers } from '@/lib/questionnaire';
import { usePlanProgress } from './use-plan-progress';

/** The 30 day boxes with completion progress, shown on the Workout tab. */
export function PlanDays({ gender, goal, answers }: { gender: Gender; goal: GoalId; answers: Answers }) {
  const saved = usePlanProgress(`${gender}:${goal}`);
  const finished = Math.round(saved.days.length / 30 * 100);
  const currentDay = planDays.find(item => !saved.days.includes(item.day))?.day;
  const selected = goals.find(item => item.id === goal);
  const level = planLevel(answers);

  return <>
    <header className="plan-topbar plan-topbar-end">
      <span className="plan-streak"><Flame aria-hidden="true" />{saved.days.length}</span>
    </header>
    <p className="plan-eyebrow">30 days</p>
    <h1 className="plan-title">{selected?.label}</h1>
    <div className="plan-progress-line">
      <span>{finished}%</span>
      <progress value={saved.days.length} max={30} aria-label="Plan completion" />
    </div>
    <p className="plan-progress-detail">{saved.days.length} / 30 days completed · {level.label} level
      <span className="plan-intensity" aria-label={`${level.label} fitness level`}>{[1, 2, 3].map(value => <Zap key={value} className={value <= level.intensity ? 'is-active' : ''} />)}</span>
    </p>
    <div className={`plan-save-status ${saved.error ? 'plan-save-error' : ''}`} role="status">{saved.error || (saved.saving ? 'Saving progress…' : !saved.loaded ? 'Loading saved progress…' : saved.days.length === 30 ? 'All 30 days completed!' : 'Progress saved')}{saved.error && !saved.loaded && <Button variant="link" onClick={saved.retry}>Try again</Button>}</div>
    {planStages.map((stage, index) => <section className="plan-week" key={stage} aria-label={`Week ${index + 1}`}>
      <h2>Week {index + 1}</h2>
      <p>{stage}</p>
      <div className="plan-days">{planDays.filter(day => day.stage === index + 1).map(({ day, rest }) => {
        const done = saved.days.includes(day);
        const current = day === currentDay;
        const image = rest ? restImage(gender, day) : dayImage(gender, day);
        return <article key={day} className={`plan-day plan-tint-${planDayColor(day)} ${current ? 'plan-day-current' : ''} ${rest ? 'plan-day-rest' : ''} ${done ? 'plan-day-done' : ''}`} aria-label={`Day ${day}${rest ? ', rest day' : ''}${done ? ', completed' : ''}`}>
          <span className="plan-day-thumb">{image ? <img src={image} alt="" loading="lazy" className={rest ? 'plan-day-thumb-rest' : 'plan-day-thumb-person'} /> : <Leaf aria-hidden="true" />}</span>
          <div className="plan-day-copy"><h3>Day {day}</h3><p>{rest ? 'Rest day' : done ? 'Completed' : current ? 'Up next' : 'Workout day'}</p></div>
          <Button variant="outline" className="plan-day-action" aria-label={`${done ? 'Undo completion for' : 'Mark complete'} day ${day}`} aria-pressed={done} disabled={!saved.loaded || saved.saving} onClick={() => void saved.toggle(day)}>{done ? <Check /> : <ArrowRight />}</Button>
        </article>;
      })}</div>
    </section>)}
    <div className="plan-end"><span>Your 30-day journey</span></div>
  </>;
}
