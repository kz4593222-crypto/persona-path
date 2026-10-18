import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { characterPoses } from "@/lib/character-poses";
const male = characterPoses.male.questions.gender;
const female = characterPoses.female.questions.gender;
import robot from "@/assets/robot.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Choose Your Gender — Fitness Journey" },
    { name: "description", content: "Start your personal fitness journey by choosing your gender." },
    { property: "og:title", content: "Choose Your Gender — Fitness Journey" },
    { property: "og:description", content: "Start your personal fitness journey." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return (
    <main className="onboarding-page">
      <div className="onboarding-progress" role="progressbar" aria-label="Your fitness journey" aria-valuemin={0} aria-valuemax={100} aria-valuenow={8}><span /></div>
      <h1 className="onboarding-title">What's your gender?</h1>
      <aside className="coach-note">
        <img src={robot} width={816} height={816} alt="" className="coach-robot" />
        <p>Knowing your gender can help us tailor the intensity for you based on different metabolic rates.</p>
      </aside>
      <div className="gender-options">
        {([{ label: "Male", gender: "male", image: male }, { label: "Female", gender: "female", image: female }] as const).map(option => (
          <Button key={option.gender} variant="character" size="character" asChild>
            <Link to="/next" search={{ gender: option.gender, goal: undefined }} aria-label={option.label}>
              <span className="character-image"><img src={option.image} width={768} height={1024} alt={`${option.label} fitness athlete`} /></span>
              <span className="character-label">{option.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </main>
  );
}
