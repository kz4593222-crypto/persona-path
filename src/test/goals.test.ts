import { describe, expect, it } from "vitest";
import { goals, validateGender, validateGoal } from "@/lib/goals";

describe("Fitness goal selections", () => {
  it("contains all eleven requested goals with unique identifiers", () => {
    expect(goals).toHaveLength(11);
    expect(new Set(goals.map(goal => goal.id)).size).toBe(11);
    expect(goals.at(-1)?.id).toBe("kegel");
  });
  it("accepts only supported gender values", () => {
    expect(validateGender("female")).toBe("female");
    expect(validateGender("male")).toBe("male");
    expect(validateGender("invalid")).toBe("male");
  });
  it("accepts supported goals and rejects invalid search values", () => {
    for (const goal of goals) expect(validateGoal(goal.id)).toBe(goal.id);
    expect(validateGoal("unknown")).toBeUndefined();
    expect(validateGoal(["abs"])).toBeUndefined();
    expect(validateGoal(undefined)).toBeUndefined();
  });
});