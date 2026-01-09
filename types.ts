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
  EXIT_HOOK = 'ExitHook'
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

export interface Task {
  id: string;
  title: string;
  type: TaskType;
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