import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuestionnaire } from './questionnaire-context';
import { isValidAnswer, questions, toggleHealthAnswer, type Question } from '@/lib/questionnaire';
import { goals, type Gender, type GoalId } from '@/lib/goals';
import { questionImage } from '@/lib/character-poses';
import { healthImage } from '@/lib/health-images';

export function questionHead(question?: Question) {
  const title = `${question?.title ?? 'Your 30-Day Plan'} — Fitness Journey`;
  const description = question ? `${question.title} ${question.description}.` : 'Your goal-focused 30-day fitness calendar with weekly rest days.';
  return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}

export function FitnessQuestion({ index, gender, goal }: { index: number; gender: Gender; goal: GoalId }) {
  const question = questions[index];
  const { answers, setAnswer } = useQuestionnaire();
  const navigate = useNavigate();
  const [unit, setUnit] = useState('metric');
  if (!question) return null;
  const value = answers[question.id];
  const valid = isValidAnswer(question, value);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const progress = Math.round(((index + 2) / 11) * 100);
  const back = () => {
    if (index === 0) { void navigate({ to: '/next', search: { gender, goal } }); return; }
    if (index === 1) { void navigate({ to: '/continue', search: { gender, goal } }); return; }
    void navigate({ to: '/continue/$step', params: { step: questions[index - 1]?.id ?? 'equipment' }, search: { gender, goal } });
  };
  const numeric = question.numeric;
  const imperial = unit === 'imperial';
  const multiplier = question.id === 'height' ? 2.54 : 0.45359237;
  const displayValue = typeof value === 'string' ? (imperial && value ? String(Math.round(Number(value) / multiplier * 10) / 10) : value) : '';
  return <main className={`goal-page question-page question-${question.id}`}>
    <header className="goal-header">
      <Button variant="ghost" size="icon" className="goal-back" aria-label="Go back" title="Go back" onClick={back}><ArrowLeft /></Button>
      <div className="question-step"><span>{String(index + 1).padStart(2, '0')}</span> / 09 <span className="question-section">{question.section}</span></div>
      <div className={`goal-progress question-progress progress-${index}`} role="progressbar" aria-label="Your fitness journey" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span /></div>
    </header>
    <div className="goal-intro question-intro"><h1>{question.title}</h1><p>{question.description}</p></div>
    <div className="question-body">
      {numeric ? <>
        <img className="question-portrait" src={questionImage(gender, question.id)} alt={`${gender === 'male' ? 'Male' : 'Female'} fitness character`} width={384} height={512} />
        <div className="measurement-panel">
          {question.id !== 'age' && <div className="question-units" role="group" aria-label="Measurement unit">
            <Button variant="unit" aria-pressed={!imperial} onClick={() => setUnit('metric')}>{numeric.unit}</Button>
            <Button variant="unit" aria-pressed={imperial} onClick={() => setUnit('imperial')}>{question.id === 'height' ? 'in' : 'lb'}</Button>
          </div>}
          <label className="measurement-label" htmlFor={question.id}>{question.id === 'age' ? 'Age' : question.id === 'height' ? 'Height' : 'Weight'}</label>
          <div className="measurement-value"><Input id={question.id} type="number" inputMode={question.id === 'age' ? 'numeric' : 'decimal'} min={imperial ? Math.ceil(numeric.min / multiplier) : numeric.min} max={imperial ? Math.floor(numeric.max / multiplier) : numeric.max} step={question.id === 'age' ? 1 : 'any'} value={displayValue} placeholder={imperial ? String(Math.round(Number(numeric.placeholder) / multiplier)) : numeric.placeholder} onChange={event => {
            const next = event.target.value;
            setAnswer(question.id, imperial && next ? String(Math.round(Number(next) * multiplier * 100) / 100) : next);
          }} aria-invalid={!!value && !valid} aria-describedby={`${question.id}-range`} /><span>{imperial ? (question.id === 'height' ? 'in' : 'lb') : numeric.unit}</span></div>
          <p id={`${question.id}-range`} className={`measurement-hint ${value && !valid ? 'text-destructive' : ''}`}>{numeric.min}–{numeric.max} {numeric.unit}{question.id === 'age' ? ', whole years' : ''}</p>
        </div>
      </> : <>
        {question.id !== 'health' && !question.options?.some(option => option.image) && <img className="question-banner" src={questionImage(gender, question.id)} alt={`${gender === 'male' ? 'Male' : 'Female'} fitness character`} width={384} height={512} />}
        <div className="question-options" role="group" aria-label={question.title}>
          {question.options?.map(option => <Button key={option.id} variant="answer" aria-pressed={selected.includes(option.id)} className={question.id === 'health' ? 'health-choice' : option.image ? 'question-choice-illustrated' : ''} onClick={() => setAnswer(question.id, question.multiple ? toggleHealthAnswer(Array.isArray(value) ? value : [], option.id) : option.id)}>
            {question.id === 'time' && <Clock3 className="question-time-icon" aria-hidden="true" />}
            <span className="question-choice-copy"><span className="question-choice-label">{option.label}</span>{option.detail && <span className="question-choice-detail">{option.detail}</span>}</span>
            {option.image && <img className="question-choice-art" src={questionImage(gender, question.id, option.id)} alt="" width={384} height={512} />}
            {question.id === 'health' && <img className="health-choice-art" src={healthImage(gender, option.id)} alt="" width={300} height={400} />}
            <span className={`question-check ${question.multiple ? 'question-check-square' : ''}`}>{selected.includes(option.id) && <Check aria-hidden="true" />}</span>
          </Button>)}
        </div>
        {question.id === 'health' && <p className="health-note"><ShieldCheck aria-hidden="true" />For a medical condition or injury, consult a qualified healthcare professional before exercising.</p>}
      </>}
    </div>
    <footer className="goal-footer question-footer"><Button variant="next" disabled={!valid} onClick={() => {
      if (!valid) return;
      const next = questions[index + 1];
      void navigate({ to: '/continue/$step', params: { step: next?.id ?? 'complete' }, search: { gender, goal } });
    }}>Next<ArrowRight aria-hidden="true" /></Button></footer>
  </main>;
}

export function QuestionnaireComplete({ gender, goal }: { gender: Gender; goal: GoalId }) {
  const { answers } = useQuestionnaire();
  const complete = questions.every(question => isValidAnswer(question, answers[question.id]));
  const selected = goals.find(item => item.id === goal);
  return <main className="goal-page question-page">
    <header className="goal-header"><Button variant="ghost" size="icon" className="goal-back" asChild><Link to="/continue/$step" params={{ step: 'time' }} search={{ gender, goal }} aria-label="Go back" title="Go back"><ArrowLeft /></Link></Button><div className="question-step">YOUR FITNESS PROFILE</div></header>
    <div className="question-complete"><span className="question-complete-check"><Check /></span><h1>{complete ? 'All questions answered' : 'Complete your profile'}</h1><img src={questionImage(gender, 'complete')} alt="Fitness character" width={384} height={512} /><h2>{selected?.label}</h2>
      {complete ? <><p className="question-complete-detail">{answers['time']} {answers['time'] === '60' ? 'minutes or more' : 'minutes'} a day</p><Button variant="outline" asChild><Link to="/continue" search={{ gender, goal }}>Review answers</Link></Button></> : <Button variant="next" asChild><Link to="/continue" search={{ gender, goal }}>Continue</Link></Button>}
    </div>
  </main>;
}