import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { goals, validateGender, validateGoal, type GoalId } from "@/lib/goals";
import { goalImages } from "@/lib/goal-images";

export const Route = createFileRoute("/next")({
  validateSearch: (search: Record<string, unknown>) => ({ gender: validateGender(search['gender']), goal: validateGoal(search['goal']) }),
  head: () => ({ meta: [
    { title: "Choose Your Goal — Fitness Journey" },
    { name: "description", content: "Choose your main fitness goal, from building strength and losing weight to flexibility and better posture." },
    { property: "og:title", content: "Choose Your Goal — Fitness Journey" },
    { property: "og:description", content: "Choose a personal goal for your fitness journey." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NextPage,
});

function NextPage() {
  const { gender, goal } = Route.useSearch();
  const [selected, setSelected] = useState<GoalId | undefined>(goal);
  const navigate = useNavigate();
  return (
    <main className="goal-page goal-showcase">
      <header className="goal-header">
        <Button variant="ghost" size="icon" className="goal-back" asChild>
          <Link to="/" aria-label="Go back" title="Go back"><ArrowLeft /></Link>
        </Button>
        <div className="goal-step"><span>01</span> GOAL</div>
        <div className="goal-progress" role="progressbar" aria-label="Your fitness journey" aria-valuemin={0} aria-valuemax={100} aria-valuenow={14}><span /></div>
      </header>
      <div className="goal-intro">
        <h1>What is your main<br />target?</h1>
        <p>Your goal. Your pace. Your next chapter.</p>
      </div>
      <div className="goal-options" role="group" aria-label="Choose your main fitness goal">
        {goals.map((item, index) => (
          <Button key={item.id} variant="goal" size="goal" className={`goal-theme-${item.id}`} aria-label={item.label} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
            <span className="goal-card-heading"><span className="goal-card-eyebrow">YOUR GOAL</span><span className="goal-label">{item.label}</span></span>
            <span className="goal-athlete"><img className="goal-art" src={goalImages[gender][item.id]} alt="" width={384} height={512} loading={index < 3 ? "eager" : "lazy"} /></span>
            <span className="goal-card-message"><span className="goal-card-quote">{goalCopy[item.id].quote}</span><span className="goal-card-description">{goalCopy[item.id].description}</span></span>
            <span className="goal-card-select">{selected === item.id ? 'GOAL SELECTED' : 'SELECT GOAL'}<span>{selected === item.id ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}</span></span>
          </Button>
        ))}
      </div>
      <footer className="goal-footer">
        <Button variant="next" disabled={!selected} onClick={() => {
          if (!selected) return;
          void navigate({ to: "/continue", search: { gender, goal: selected } });
        }}>Next</Button>
      </footer>
    </main>
  );
}

const goalCopy: Record<GoalId, { quote: string; description: string }> = {
  abs: { quote: 'Build a stronger foundation.', description: 'Core strength. Control. Confidence.' },
  'weight-loss': { quote: 'Small steps. Fresh momentum.', description: 'Move forward at your own pace.' },
  'weight-gain': { quote: 'Grow stronger, step by step.', description: 'Focus on strength and healthy weight gain.' },
  strength: { quote: 'Strength for everyday life.', description: 'Put your arms and legs in focus.' },
  'keep-fit': { quote: 'Keep moving. Keep showing up.', description: 'Make an active life your everyday goal.' },
  chest: { quote: 'Show up with strength.', description: 'Build your upper-body confidence.' },
  flexibility: { quote: 'Move freely. Feel the difference.', description: 'Find a more comfortable range of motion.' },
  hiit: { quote: 'Bring your energy.', description: 'Take on a high-intensity challenge.' },
  posture: { quote: 'Stand with confidence.', description: 'Focus on alignment and body awareness.' },
  'v-taper': { quote: 'Shape your strength.', description: 'Bring your shoulders and back into focus.' },
  kegel: { quote: 'Strength starts within.', description: 'Focus on pelvic-floor awareness and control.' },
};