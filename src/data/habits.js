export const HABITS = {
  GYM: { target: 6, acceptable: 4, bad_threshold: 2, unit: "days/week", tier1_target: 3 },
  SKIN_MORNING: { daily: true, steps: ["cleanser", "niacinamide", "moisturizer", "SPF"] },
  SKIN_EVENING: { daily: true, steps: ["cleanser", "moisturizer"], weekly_extra: { day: "Sunday", step: "adapalene 0.1%" } },
  HAIR_OIL: { day: "Thursday", weekly: true },
  B12: { time: "07:30", daily: true, note: "before breakfast, empty stomach" },
  CALCIUM_MAG_ZINC_D3: { times: ["13:30", "19:00"], with_food: true, note: "prevents acid reflux" },
  PROTEIN_SHAKE: { on_gym_days: true, timing: "post workout" },
  FRUIT: { daily: true },
  BREAKFAST: { optional: true, target_time: "10:00", meal_prep: true },
  LUNCH: { target_time: "13:30", meal_prep: true },
  DINNER: { after_gym: true, meal_prep: true },
  WATER: { target_glasses: 8 },
  COLD_OUTREACH: { target: 1, unit: "per day" },
  JOB_APPLICATIONS: { tier1: 2, tier2: 5, tier3: 10, unit: "per day" },
  SLEEP: { target_wake: "08:30", target_sleep: "23:00" },
  WORK_PREP: { flexible: true }
};

export const USER_PROFILE = {
  name: "Meet",
  weight_kg: 56,
  target_weight_kg: 60,
  height_cm: 165,
  diet: "vegetarian",
  daily_protein_target_g: 70,
  current_tier: 1
};
