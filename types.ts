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
  SETTINGS = 'Settings'
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

// New: Configurable Task Type Definition
export interface TaskTypeConfig {
  id: string; // e.g., 'startup', 'deep_work'
  name: string; // e.g., '启动型', '攻坚型'
  colorTheme: 'blue' | 'red' | 'orange' | 'purple' | 'green';
  baseMultiplier: number;
  defaultTimeSeconds: number;
  actionVerbs: string[]; // ["立即启动", "马上执行"]
}

// New: Time Window Definition
export interface TimeWindow {
  id: string;
  name: string; // e.g., '晨间启动', '深夜修补'
  startHour: number; // 0-23
  endHour: number;   // 0-23
  multiplier: number;
  allowedTypes: string[]; // IDs of TaskTypeConfig
  theme: 'sunrise' | 'day' | 'sunset' | 'midnight';
  description: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType; // Keeping original enum for backward compat, but logic uses config
  typeConfigId?: string; // Link to new config
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseReward: Reward;
  timeLimitSeconds?: number;
  status: TaskStatus;
  chainGroupId?: string;
  expiresAt?: number;
}

export interface UserState {
  wp: number; // Will Power
  level: number;
  exp: number;
  maxExp: number;
  streak: number;
  combo: number;
  fatigue: number;
  isHighRisk: boolean;
  lastActive: number;
}

export interface BattlePass {
  seasonId: string;
  level: number;
  seasonEndsAt: number;
}

export interface Chest {
  id: string;
  type: ChestType;
  progress: number;
  required: number;
  isReady: boolean;
}