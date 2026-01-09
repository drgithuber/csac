// 8. Configuration Requirements - All parameters Configurable

export const CONFIG = {
  // WP Rules
  INITIAL_WP: 100,
  WP_DECAY_DAILY: 10,
  
  // EXP Rules
  EXP_DECAY_DAILY: 50,
  LEVEL_CURVE_MULTIPLIER: 1.5,
  BASE_EXP_REQ: 100,

  // Combo & Streak
  COMBO_THRESHOLD: 5, // 5 tasks for extra reward
  COMBO_TIMEOUT_SECONDS: 600, // 10 mins to keep combo
  
  // Fatigue
  FATIGUE_INCREMENT_ON_FAIL: 5,
  FATIGUE_RECOVERY_PER_HOUR: 2,

  // Multipliers
  RAGE_WINDOW_MULTIPLIER: 2.0,
  RECOVERY_REWARD_BOOST: 1.2,
  NIGHT_RECOVERY_DIFFICULTY_REDUCTION: 0.8,

  // Timers
  RAGE_WINDOW_DURATION_SEC: 300, // 5 mins
  MOMENTUM_WINDOW_SEC: 10, // Time to accept next task in flow

  // Visuals
  ANIMATION_DURATION: 0.3,
};

export const MOCK_TASKS_DATA = [
  { title: "立刻喝水", diff: 1, type: "Daily" },
  { title: "进入深度工作", diff: 5, type: "Daily" },
  { title: "马上拉伸", diff: 2, type: "Limited" },
  { title: "清除紧急邮件", diff: 4, type: "Emergency" },
];