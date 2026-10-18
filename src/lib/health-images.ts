import type { Gender } from "./goals";
import male_none from "@/assets/health/male-none.png";
import male_joints from "@/assets/health/male-joints.png";
import male_back from "@/assets/health/male-back.png";
import male_heart from "@/assets/health/male-heart.png";
import male_breathing from "@/assets/health/male-breathing.png";
import male_injury from "@/assets/health/male-injury.png";
import male_other from "@/assets/health/male-other.png";
import male_private from "@/assets/health/male-private.png";
import female_none from "@/assets/health/female-none.png";
import female_joints from "@/assets/health/female-joints.png";
import female_back from "@/assets/health/female-back.png";
import female_heart from "@/assets/health/female-heart.png";
import female_breathing from "@/assets/health/female-breathing.png";
import female_injury from "@/assets/health/female-injury.png";
import female_other from "@/assets/health/female-other.png";
import female_private from "@/assets/health/female-private.png";
const healthImages = {
  male: {none: male_none, joints: male_joints, back: male_back, heart: male_heart, breathing: male_breathing, injury: male_injury, other: male_other, private: male_private},
  female: {none: female_none, joints: female_joints, back: female_back, heart: female_heart, breathing: female_breathing, injury: female_injury, other: female_other, private: female_private},
};
export function healthImage(gender: Gender, id: string): string | undefined {
  const images: Record<string, string> = healthImages[gender];
  return images[id];
}
