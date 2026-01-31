import { TaskTypeConfig, TimeWindow } from './types';

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

// --- NEW ADDICTION ENGINE CONFIGS ---

export const DEFAULT_TASK_TYPES: TaskTypeConfig[] = [
  {
    id: 'startup',
    name: '启动型',
    colorTheme: 'green',
    baseMultiplier: 1.0,
    defaultTimeSeconds: 60,
    actionVerbs: ['立即启动', '瞬间激活', '唤醒状态'],
    usageCount: 0,
    successCount: 0,
    failureStrategy: 'standard',
    uiIntensity: 'normal',
    taskTitles: ['整理桌面', '喝一杯水', '列出今日计划', '深呼吸1分钟']
  },
  {
    id: 'deep_work',
    name: '攻坚型',
    colorTheme: 'blue',
    baseMultiplier: 1.5,
    defaultTimeSeconds: 1500, // 25 min
    actionVerbs: ['潜入心流', '专注执行', '核心爆破'],
    usageCount: 0,
    successCount: 0,
    failureStrategy: 'standard',
    uiIntensity: 'normal',
    taskTitles: ['专注工作25分钟', '阅读专业书籍', '解决一个难题', '写作500字']
  },
  {
    id: 'recovery',
    name: '补救型',
    colorTheme: 'purple',
    baseMultiplier: 0.8, // Lower base, but usually appears in high multiplier windows
    defaultTimeSeconds: 300,
    actionVerbs: ['立即挽回', '止损修复', '重回正轨'],
    usageCount: 0,
    successCount: 0,
    failureStrategy: 'punishing',
    uiIntensity: 'strong',
    taskTitles: ['放下手机', '离开座位活动', '关闭无关网页', '冥想5分钟']
  },
  {
    id: 'health',
    name: '生存型',
    colorTheme: 'orange',
    baseMultiplier: 1.2,
    defaultTimeSeconds: 120,
    actionVerbs: ['补充能量', '生存必须', '立刻执行'],
    usageCount: 0,
    successCount: 0,
    failureStrategy: 'standard',
    uiIntensity: 'normal',
    taskTitles: ['做10个俯卧撑', '吃水果', '远眺窗外', '颈椎操']
  }
];

export const DEFAULT_TIME_WINDOWS: TimeWindow[] = [
  {
    id: 'morning_rush',
    name: '晨间启动',
    startHour: 6,
    endHour: 10,
    multiplier: 1.2,
    allowedTypes: ['startup', 'health'],
    theme: 'sunrise',
    description: '低阻力 · 高唤醒',
    notificationIntensity: 'low'
  },
  {
    id: 'day_focus',
    name: '黄金时段',
    startHour: 10,
    endHour: 18,
    multiplier: 1.5,
    allowedTypes: ['deep_work', 'health'],
    theme: 'day',
    description: '高产出 · 高回报',
    notificationIntensity: 'medium'
  },
  {
    id: 'evening_wind',
    name: '晚间整理',
    startHour: 18,
    endHour: 22,
    multiplier: 1.0,
    allowedTypes: ['health', 'startup'], // Preparing for next day
    theme: 'sunset',
    description: '归档 · 准备',
    notificationIntensity: 'low'
  },
  {
    id: 'midnight_rescue',
    name: '深夜补救',
    startHour: 22,
    endHour: 6, // Crosses midnight handled by logic
    multiplier: 2.0, // High incentive to finish and sleep
    allowedTypes: ['recovery'],
    theme: 'midnight',
    description: '最后机会 · 防止中断',
    notificationIntensity: 'high'
  }
];