import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Flame, Moon, Utensils, BedDouble, Info, Footprints } from "lucide-react";
import { useAccount } from "@/components/dashboard/use-account";
import { goals } from "@/lib/goals";
import { bedtimeFor, dailyCalories, macros, mealPlan, needsDoctorNote, sleepGapHours, sleepTargetHours, waterLitres } from "@/lib/recovery";

export const Route = createFileRoute("/_authenticated/dashboard/recovery")({
  head: () => ({ meta: [
    { title: "Recovery — Diet & Sleep Plan" },
    { name: "description", content: "Your daily calories, meals, water and sleep schedule for faster recovery." },
    { property: "og:title", content: "Recovery — Diet & Sleep Plan" },
    { property: "og:description", content: "Personal diet and sleep plan for faster recovery." },
  ] }),
  component: RecoveryTab,
});

const wakeTimes = ["05:30", "06:30", "07:00", "08:00"];
const sleepTips = [
  "Keep the same bedtime every night, even on weekends.",
  "No screens for 30 minutes before bed — read or stretch instead.",
  "Keep your room dark, quiet and cool.",
  "Finish heavy meals and caffeine at least 3 hours before sleep.",
];

const formatHours = (hours: number) => `${Math.floor(hours)}h${hours % 1 ? " 30m" : ""}`;

function RecoveryTab() {
  const { data: account } = useAccount();
  const [wake, setWake] = useState("07:00");
  const fitness = account?.fitness;
  if (!fitness) return null;
  const input = { gender: fitness.gender, goal: fitness.goal, answers: fitness.answers };
  const calories = dailyCalories(input);
  const macro = macros(input);
  const meals = mealPlan(input);
  const target = sleepTargetHours(fitness.answers);
  const gap = sleepGapHours(fitness.answers);
  const goalLabel = goals.find(goal => goal.id === fitness.goal)?.label;

  return <main className="plan-page dash-page recovery-page">
    <p className="plan-eyebrow">Recover faster</p>
    <h1 className="plan-title">Recovery</h1>
    <p className="dash-lead">Built from your age, height, weight, activity and goal: {goalLabel}.</p>

    <section className="recovery-hero" aria-label="Daily nutrition">
      <span className="recovery-hero-icon"><Flame aria-hidden="true" /></span>
      <div><p>Daily calories</p><strong>{calories.target.toLocaleString()} kcal</strong><small>Maintenance {calories.maintenance.toLocaleString()} kcal</small></div>
    </section>
    <div className="recovery-macros">
      <div><strong>{macro.protein}g</strong><span>Protein</span></div>
      <div><strong>{macro.carbs}g</strong><span>Carbs</span></div>
      <div><strong>{macro.fat}g</strong><span>Fat</span></div>
      <div><strong><Droplets aria-hidden="true" />{waterLitres(fitness.answers)}L</strong><span>Water</span></div>
    </div>

    <section className="dash-section" aria-labelledby="meals-title">
      <h2 id="meals-title"><Utensils aria-hidden="true" />Diet plan</h2>
      <ul className="recovery-meals">
        {meals.map(meal => <li key={meal.id}><div><h3>{meal.label}</h3><p>{meal.ideas}</p></div><span>{meal.calories} kcal</span></li>)}
      </ul>
    </section>

    <section className="dash-section" aria-labelledby="sleep-title">
      <h2 id="sleep-title"><Moon aria-hidden="true" />Sleep plan</h2>
      <div className="recovery-sleep">
        <div className="recovery-sleep-target"><BedDouble aria-hidden="true" /><div><strong>{formatHours(target)}</strong><span>sleep every night</span></div></div>
        <p className="recovery-sleep-label">I wake up at</p>
        <div className="recovery-wake" role="radiogroup" aria-label="Wake-up time">
          {wakeTimes.map(time => <button key={time} type="button" role="radio" aria-checked={wake === time} className={wake === time ? "is-active" : ""} onClick={() => setWake(time)}>{time}</button>)}
        </div>
        <p className="recovery-bedtime">Go to bed by <strong>{bedtimeFor(wake, target)}</strong></p>
        {gap > 0 && <p className="recovery-gap">You sleep about {formatHours(gap)} less than your body needs. Move your bedtime earlier by 15 minutes each week.</p>}
      </div>
      <ul className="recovery-tips">{sleepTips.map(tip => <li key={tip}>{tip}</li>)}</ul>
    </section>

    <section className="dash-section" aria-labelledby="rest-title">
      <h2 id="rest-title"><Footprints aria-hidden="true" />On rest days</h2>
      <ul className="recovery-tips">
        <li>Take a 20–30 minute easy walk to keep blood flowing.</li>
        <li>Stretch gently for 10 minutes before bed.</li>
        <li>Keep protein at the same level as workout days.</li>
      </ul>
    </section>

    {needsDoctorNote(fitness.answers) && <p className="recovery-note"><Info aria-hidden="true" />You mentioned a health concern. Please check with your doctor before changing your diet or sleep routine.</p>}
  </main>;
}
