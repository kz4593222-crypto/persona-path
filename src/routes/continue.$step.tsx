import { createFileRoute, notFound } from '@tanstack/react-router';
import { FitnessQuestion, questionHead } from '@/components/fitness-question';
import { FitnessPlan } from '@/components/fitness-plan';
import { questions } from '@/lib/questionnaire';

export const Route = createFileRoute('/continue/$step')({
  beforeLoad: ({ params }) => { if (params.step !== 'complete' && !questions.some(question => question.id === params.step)) throw notFound(); },
  head: ({ params }) => questionHead(questions.find(question => question.id === params.step)),
  component: QuestionPage,
});
function QuestionPage() {
  const { step } = Route.useParams();
  const { gender, goal } = Route.useSearch();
  if (step === 'complete') return <FitnessPlan gender={gender} goal={goal} />;
  return <FitnessQuestion key={step} index={questions.findIndex(question => question.id === step)} gender={gender} goal={goal} />;
}