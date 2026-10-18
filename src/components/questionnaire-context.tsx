import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Answers } from '@/lib/questionnaire';

type QuestionnaireState = { answers: Answers; setAnswer: (id: string, value: string | string[]) => void };
const QuestionnaireContext = createContext<QuestionnaireState | undefined>(undefined);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  return <QuestionnaireContext.Provider value={{ answers, setAnswer: (id, value) => setAnswers(previous => ({ ...previous, [id]: value })) }}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) throw new Error('Questionnaire must be inside its provider');
  return context;
}