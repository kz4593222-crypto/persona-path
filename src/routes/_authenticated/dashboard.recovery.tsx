import { useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, BedDouble, Check, Droplet, Footprints, Info, Moon, Salad, StretchHorizontal, Utensils, Beef, Wheat, Droplets } from "lucide-react";
import { useAccount } from "@/components/dashboard/use-account";
import { goals } from "@/lib/goals";
import { recoveryHero, recoverySleep, recoveryWater, mealImages } from "@/lib/recovery-images";
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
  const water = waterLitres(fitness.answers);
  const glasses = Math.round(water / 0.25);
  const macroRows = [
    { id: "protein", label: "Protein", grams: macro.protein, kcal: macro.protein * 4, icon: Beef },
    { id: "carbs", label: "Carbs", grams: macro.carbs, kcal: macro.carbs * 4, icon: Wheat },
    { id: "fat", label: "Fat", grams: macro.fat, kcal: macro.fat * 9, icon: Droplets },
  ];

  return <main className="plan-page dash-page recovery-page">
    <header className="dash-header">
      <p className="plan-eyebrow">Recover faster</p>
      <h1 className="plan-title">Recovery</h1>
    </header>

    <section className="recovery-hero" aria-label="Daily nutrition target">
      <div className="recovery-hero-copy">
        <span className="recovery-chip">{goalLabel}</span>
        <p>Eat every day</p>
        <strong>{calories.target.toLocaleString()}<small> kcal</small></strong>
        <span className="recovery-hero-note">Maintenance {calories.maintenance.toLocaleString()} kcal</span>
      </div>
      <img src={recoveryHero[fitness.gender]} alt="" className="recovery-hero-person" width={491} height={640} />
    </section>

    <div className="recovery-macros" aria-label="Daily macros">
      {macroRows.map(({ id, label, grams, kcal, icon: Icon }) => <div key={id} className={`recovery-macro recovery-macro-${id}`}>
        <span className="recovery-macro-icon"><Icon aria-hidden="true" /></span>
        <strong>{grams}g</strong>
        <span>{label}</span>
        <i style={{ "--share": `${Math.min(100, Math.round(kcal / calories.target * 100))}%` } as CSSProperties} aria-hidden="true" />
      </div>)}
    </div>

    <section className="recovery-water" aria-label="Daily water">
      <img src={recoveryWater} alt="" loading="lazy" width={720} height={480} />
      <div className="recovery-water-copy">
        <p>Drink water</p>
        <strong>{water}<small> L</small></strong>
        <span>about {glasses} glasses a day</span>
        <div className="recovery-glasses" aria-hidden="true">{Array.from({ length: Math.min(glasses, 16) }, (_, index) => <Droplet key={index} />)}</div>
      </div>
    </section>

    <section className="dash-section" aria-labelledby="meals-title">
      <h2 id="meals-title"><span className="dash-h2-icon dash-h2-food"><Utensils aria-hidden="true" /></span>Diet plan</h2>
      <ul className="recovery-meals">
        {meals.map(meal => <li key={meal.id}>
          <img src={mealImages[meal.id]} alt="" loading="lazy" width={420} height={420} />
          <div><h3>{meal.label}</h3><p>{meal.ideas}</p></div>
          <span className="recovery-kcal">{meal.calories}<small>kcal</small></span>
        </li>)}
      </ul>
    </section>

    <section className="dash-section" aria-labelledby="sleep-title">
      <h2 id="sleep-title"><span className="dash-h2-icon dash-h2-sleep"><Moon aria-hidden="true" /></span>Sleep plan</h2>
      <div className="recovery-sleep">
        <img src={recoverySleep[fitness.gender]} alt="" loading="lazy" width={720} height={480} className="recovery-sleep-photo" />
        <div className="recovery-sleep-body">
          <div className="recovery-sleep-target"><BedDouble aria-hidden="true" /><div><strong>{formatHours(target)}</strong><span>sleep every night</span></div></div>
          <p className="recovery-sleep-label"><AlarmClock aria-hidden="true" />I wake up at</p>
          <div className="recovery-wake" role="radiogroup" aria-label="Wake-up time">
            {wakeTimes.map(time => <button key={time} type="button" role="radio" aria-checked={wake === time} className={wake === time ? "is-active" : ""} onClick={() => setWake(time)}>{time}</button>)}
          </div>
          <p className="recovery-bedtime">Go to bed by <strong>{bedtimeFor(wake, target)}</strong></p>
          {gap > 0 && <p className="recovery-gap">You sleep about {formatHours(gap)} less than your body needs. Move your bedtime earlier by 15 minutes each week.</p>}
        </div>
      </div>
      <ul className="recovery-tips">{sleepTips.map(tip => <li key={tip}><Check aria-hidden="true" />{tip}</li>)}</ul>
    </section>

    <section className="dash-section" aria-labelledby="rest-title">
      <h2 id="rest-title"><span className="dash-h2-icon dash-h2-rest"><Footprints aria-hidden="true" /></span>On rest days</h2>
      <ul className="recovery-rest">
        <li><span className="recovery-rest-icon"><Footprints aria-hidden="true" /></span><div><strong>Easy walk</strong><p>20–30 minutes to keep blood flowing.</p></div></li>
        <li><span className="recovery-rest-icon"><StretchHorizontal aria-hidden="true" /></span><div><strong>Gentle stretch</strong><p>10 minutes before bed.</p></div></li>
        <li><span className="recovery-rest-icon"><Salad aria-hidden="true" /></span><div><strong>Same protein</strong><p>Keep protein at the workout-day level.</p></div></li>
      </ul>
    </section>

    {needsDoctorNote(fitness.answers) && <p className="recovery-note"><Info aria-hidden="true" />You mentioned a health concern. Please check with your doctor before changing your diet or sleep routine.</p>}
  </main>;
}
