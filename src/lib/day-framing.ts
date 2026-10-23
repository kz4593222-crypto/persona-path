// Per-portrait frames contain the entire silhouette in the unchanged day picture slot.
export type DayFrame = { w: number; x: number; y: number; fade: boolean };
const frames: Record<string, DayFrame> = {
  "male-01.webp": {
    "w": 80.89,
    "x": 9.55,
    "y": 1.92,
    "fade": true
  },
  "male-02.webp": {
    "w": 60.38,
    "x": 19.81,
    "y": 1.92,
    "fade": true
  },
  "male-03.webp": {
    "w": 67.87,
    "x": 16.06,
    "y": 1.92,
    "fade": true
  },
  "male-04.webp": {
    "w": 84.8,
    "x": 7.6,
    "y": 1.92,
    "fade": true
  },
  "male-05.webp": {
    "w": 61.69,
    "x": 19.16,
    "y": 1.92,
    "fade": true
  },
  "male-06.webp": {
    "w": 68.2,
    "x": 15.9,
    "y": 1.92,
    "fade": true
  },
  "male-07.webp": {
    "w": 63.8,
    "x": 18.1,
    "y": 1.92,
    "fade": true
  },
  "male-08.webp": {
    "w": 78.94,
    "x": 10.53,
    "y": 1.92,
    "fade": true
  },
  "male-09.webp": {
    "w": 95.21,
    "x": 2.39,
    "y": 1.92,
    "fade": true
  },
  "male-10.webp": {
    "w": 97.01,
    "x": 1.5,
    "y": 1.92,
    "fade": true
  },
  "male-11.webp": {
    "w": 74.71,
    "x": 12.65,
    "y": 1.92,
    "fade": true
  },
  "male-12.webp": {
    "w": 83.66,
    "x": 8.17,
    "y": 1.92,
    "fade": true
  },
  "male-13.webp": {
    "w": 86.43,
    "x": 6.79,
    "y": 1.92,
    "fade": true
  },
  "male-14.webp": {
    "w": 76.5,
    "x": 11.75,
    "y": 1.92,
    "fade": true
  },
  "male-15.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 2.51,
    "fade": true
  },
  "male-16.webp": {
    "w": 68.68,
    "x": 15.66,
    "y": 1.92,
    "fade": true
  },
  "male-17.webp": {
    "w": 66.08,
    "x": 16.96,
    "y": 1.92,
    "fade": true
  },
  "male-18.webp": {
    "w": 71.45,
    "x": 14.27,
    "y": 1.92,
    "fade": true
  },
  "male-19.webp": {
    "w": 71.94,
    "x": 14.03,
    "y": 1.92,
    "fade": true
  },
  "male-20.webp": {
    "w": 86.43,
    "x": 6.79,
    "y": 1.92,
    "fade": true
  },
  "male-21.webp": {
    "w": 89.61,
    "x": 5.19,
    "y": 1.92,
    "fade": true
  },
  "male-22.webp": {
    "w": 95.75,
    "x": 2.12,
    "y": 1.92,
    "fade": true
  },
  "male-23.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 16.89,
    "fade": true
  },
  "male-24.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 4.21,
    "fade": true
  },
  "male-25.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 5.29,
    "fade": true
  },
  "male-26.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 3.91,
    "fade": true
  },
  "female-01.webp": {
    "w": 80.97,
    "x": 9.52,
    "y": 1.92,
    "fade": true
  },
  "female-02.webp": {
    "w": 85.81,
    "x": 7.09,
    "y": 1.92,
    "fade": true
  },
  "female-03.webp": {
    "w": 88.51,
    "x": 5.75,
    "y": 1.92,
    "fade": true
  },
  "female-04.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 11.11,
    "fade": true
  },
  "female-05.webp": {
    "w": 80.79,
    "x": 9.6,
    "y": 1.92,
    "fade": true
  },
  "female-06.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 6.05,
    "fade": true
  },
  "female-07.webp": {
    "w": 91.78,
    "x": 4.11,
    "y": 1.92,
    "fade": true
  },
  "female-08.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 6.1,
    "fade": true
  },
  "female-09.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 13.17,
    "fade": true
  },
  "female-10.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 11.41,
    "fade": true
  },
  "female-11.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 3.52,
    "fade": true
  },
  "female-12.webp": {
    "w": 89.75,
    "x": 5.12,
    "y": 1.92,
    "fade": true
  },
  "female-13.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 12.44,
    "fade": true
  },
  "female-14.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 11.54,
    "fade": true
  },
  "female-15.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 18.65,
    "fade": true
  },
  "female-16.webp": {
    "w": 97.56,
    "x": 1.22,
    "y": 1.92,
    "fade": true
  },
  "female-17.webp": {
    "w": 89.41,
    "x": 5.3,
    "y": 1.92,
    "fade": true
  },
  "female-18.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 7.55,
    "fade": true
  },
  "female-19.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 12.26,
    "fade": true
  },
  "female-20.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 14.72,
    "fade": true
  },
  "female-21.webp": {
    "w": 82.41,
    "x": 8.79,
    "y": 1.92,
    "fade": true
  },
  "female-22.webp": {
    "w": 91.61,
    "x": 4.19,
    "y": 1.92,
    "fade": true
  },
  "female-23.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 18.01,
    "fade": true
  },
  "female-24.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 8.38,
    "fade": true
  },
  "female-25.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 4.62,
    "fade": true
  },
  "female-26.webp": {
    "w": 97.92,
    "x": 1.04,
    "y": 7.01,
    "fade": true
  }
};
export function dayFrame(src: string): DayFrame | undefined { return frames[src.split("/").pop()?.split("?")[0] ?? ""]; }
