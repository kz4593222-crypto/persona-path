// Browser-safe illustration mapping for the Recovery section only.
import heroMale from "@/assets/recovery/hero-male.webp";
import heroFemale from "@/assets/recovery/hero-female.webp";
import sleepMale from "@/assets/recovery/sleep-male.webp";
import sleepFemale from "@/assets/recovery/sleep-female.webp";
import water from "@/assets/recovery/water-photo.webp";
import breakfast from "@/assets/recovery/meal-breakfast.webp";
import lunch from "@/assets/recovery/meal-lunch.webp";
import snack from "@/assets/recovery/meal-snack.webp";
import dinner from "@/assets/recovery/meal-dinner.webp";
import type { Gender } from "@/lib/goals";

export const recoveryHero: Record<Gender, string> = { male: heroMale, female: heroFemale };
export const recoverySleep: Record<Gender, string> = { male: sleepMale, female: sleepFemale };
export const recoveryWater = water;
export const mealImages: Record<string, string> = { breakfast, lunch, snack, dinner };
