export enum TaskType {
  DAILY = 'Daily',
  LIMITED = 'Limited',
  EMERGENCY = 'Emergency',
  RECOVERY = 'Recovery'
}

export enum TaskStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  COMPLETED = 'Completed',
  EXPIRED = 'Expired',
  FAILED = 'Failed'
}

export enum SystemState {
  IDLE = 'Idle',
  TRIGGER = 'Trigger',
  ACCEPT = 'Accept',
  EXECUTE = 'Execute',
  FEEDBACK = 'Feedback',
  MOMENTUM = 'Momentum',
  EXIT_HOOK = 'ExitHook',
  SETTINGS = 'Settings',
  BATTLE_PASS = 'BattlePass',
  STATS = 'Stats'
}

export enum ChestType {
  SMALL = '白银宝箱',
  MEDIUM = '黄金宝箱',
  LARGE = '神奇宝箱'
}

export interface Reward {
  wpDelta: number;
  expDelta: number;
  multiplier: number;
  unlocks?: string[];
}

export interface TaskTypeConfig {
  id: string; 
  name: string; 
  colorTheme: 'blue' | 'red' | 'orange' | 'purple' | 'green';
  baseMultiplier: number;
  defaultTimeSeconds: number;
  actionVerbs: string[];
  // History stats for weighted generation
  usageCount: number;
  successCount: number;
  // Spec 6.1
  failureStrategy: 'standard' | 'punishing';
  uiIntensity: 'normal' | 'strong';
  // Spec: Custom Task Names
  taskTitles: string[];
}

export interface TimeWindow {
  id: string;
  name: string; 
  startHour: number;
  endHour: number;
  multiplier: number;
  allowedTypes: string[]; 
  theme: 'sunrise' | 'day' | 'sunset' | 'midnight';
  description: string;
  // Spec 6.2
  notificationIntensity: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  title: string;
  type: TaskType; 
  typeConfigId?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseReward: Reward;
  timeLimitSeconds?: number;
  status: TaskStatus;
  chainGroupId?: string;
  expiresAt?: number;
}

export interface UserState {
  wp: number;
  level: number;
  exp: number;
  maxExp: number;
  streak: number;
  combo: number;
  fatigue: number;
  isHighRisk: boolean;
  lastActive: number;
}

export interface BattlePassReward {
  level: number;
  freeReward: string;
  premiumReward: string;
  isClaimed: boolean;
}

export interface BattlePass {
  seasonId: string;
  level: number;
  currentExp: number;
  expPerLevel: number;
  seasonEndsAt: number;
  rewards: BattlePassReward[];
}

export interface Chest {
  id: string;
  type: ChestType;
  progress: number;
  required: number;
  isReady: boolean;
}