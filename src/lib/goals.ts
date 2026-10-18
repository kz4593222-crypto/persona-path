export const goals = [
  { id: "abs", label: "Build abs" },
  { id: "weight-loss", label: "Lose weight" },
  { id: "weight-gain", label: "Gain weight" },
  { id: "strength", label: "Strengthen arms & legs" },
  { id: "keep-fit", label: "Keep fit" },
  { id: "chest", label: "Build chest" },
  { id: "flexibility", label: "Improve flexibility" },
  { id: "hiit", label: "HIIT training" },
  { id: "posture", label: "Improve posture" },
  { id: "v-taper", label: "Build a V-taper" },
  { id: "kegel", label: "Kegel strength" },
] as const;

export type GoalId = typeof goals[number]["id"];
export type Gender = "male" | "female";

export function validateGender(value: unknown): Gender {
  return value === "female" ? "female" : "male";
}

export function validateGoal(value: unknown): GoalId | undefined {
  return goals.find(goal => goal.id === value)?.id;
}