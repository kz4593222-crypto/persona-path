import { createFileRoute, Outlet } from "@tanstack/react-router";
import { validateGender, validateGoal } from "@/lib/goals";
import { QuestionnaireProvider } from '@/components/questionnaire-context';

export const Route = createFileRoute("/continue")({
  validateSearch: (search: Record<string, unknown>) => ({
    gender: validateGender(search['gender']),
    goal: validateGoal(search['goal']) ?? "abs",
  }),
  component: ContinuePage,
});

function ContinuePage() {
  const { gender, goal } = Route.useSearch();
  return <QuestionnaireProvider key={`${gender}-${goal}`}><Outlet /></QuestionnaireProvider>;
}