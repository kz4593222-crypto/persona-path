import { createFileRoute } from '@tanstack/react-router';
import { FitnessQuestion, questionHead } from '@/components/fitness-question';
import { questions } from '@/lib/questionnaire';

export const Route = createFileRoute('/continue/')({ head: () => questionHead(questions[0]), component: EquipmentPage });
function EquipmentPage() {
  const { gender, goal } = Route.useSearch();
  return <FitnessQuestion index={0} gender={gender} goal={goal} />;
}