import { UserState, Task, TaskTypeConfig, TimeWindow, Chest, BattlePass } from '../types';

const STORAGE_KEY = 'habit_battle_state_v1';

interface AppData {
  user: UserState;
  tasks: Task[];
  chests: Chest[];
  taskTypes: TaskTypeConfig[];
  timeWindows: TimeWindow[];
  battlePass: BattlePass;
  timestamp: number;
}

export const StorageService = {
  save: (data: Omit<AppData, 'timestamp'>) => {
    try {
      const payload: AppData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  },

  load: (): AppData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppData;
    } catch (e) {
      console.error("Failed to load state", e);
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};