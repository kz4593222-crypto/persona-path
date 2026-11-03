import { createFileRoute } from "@tanstack/react-router";
import { PlanDays } from "@/components/plan-days";
import { useAccount } from "@/components/dashboard/use-account";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [
    { title: "Workout — Your 30-Day Fitness Plan" },
    { name: "description", content: "All 30 days of your plan with progress tracking." },
    { property: "og:title", content: "Workout — Your 30-Day Fitness Plan" },
    { property: "og:description", content: "All 30 days of your plan with progress tracking." },
  ] }),
  component: WorkoutTab,
});

function WorkoutTab() {
  const { data: account } = useAccount();
  const fitness = account?.fitness;
  if (!fitness) return null;
  return <main className="plan-page dash-page"><PlanDays gender={fitness.gender} goal={fitness.goal} answers={fitness.answers} /></main>;
}
