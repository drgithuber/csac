
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Task, 
  TaskType, 
  TaskStatus, 
  UserState, 
  SystemState, 
  Chest, 
  ChestType, 
  Reward,
  TaskTypeConfig,
  TimeWindow,
  BattlePass
} from './types';
import { CONFIG, DEFAULT_TASK_TYPES, DEFAULT_TIME_WINDOWS } from './constants';
import { SystemService } from './services/systemService';
import { StorageService } from './services/storageService';
import { MainActionCard } from './components/MainActionCard';
import { StateOverlays } from './components/StateOverlays';
import { SystemSettings } from './components/SystemSettings';
import { BattlePassPanel } from './components/BattlePass';
import { StatsPanel } from './components/StatsPanel';
import { Zap, Settings, Box, Trophy, Activity, Shield, Calendar, Clock, BarChart3, Menu, RefreshCw } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialState = (): UserState => ({
  wp: CONFIG.INITIAL_WP,
  level: 1,
  exp: 0,
  maxExp: CONFIG.BASE_EXP_REQ,
  streak: 0,
  combo: 0,
  fatigue: 0,
  isHighRisk: false,
  lastActive: Date.now(),
});

const createInitialBattlePass = (): BattlePass => ({
    seasonId: 's1',
    level: 1,
    currentExp: 20,
    expPerLevel: 100,
    seasonEndsAt: Date.now() + 1000 * 60 * 60 * 24 * 12,
    rewards: Array.from({length: 21}, (_, i) => ({
        level: i + 1,
        freeReward: `${(i+1)*10} WP`,
        premiumReward: '皮肤碎片',
        isClaimed: false
    }))
});

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>(createInitialState());
  const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
  const [taskTypes, setTaskTypes] = useState<TaskTypeConfig[]>(DEFAULT_TASK_TYPES);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>(DEFAULT_TIME_WINDOWS);
  const [activeWindow, setActiveWindow] = useState<TimeWindow | undefined>(undefined);
  const [battlePass, setBattlePass] = useState<BattlePass>(createInitialBattlePass());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialStatsTab, setInitialStatsTab] = useState<'overview' | 'types'>('overview');
  const [chests, setChests] = useState<Chest[]>([
    { id: '1', type: ChestType.SMALL, progress: 8, required: 10, isReady: false }, 
    { id: '2', type: ChestType.MEDIUM, progress: 18, required: 20, isReady: false },
    { id: '3', type: ChestType.SMALL, progress: 0, required: 10, isReady: true },
    { id: '4', type: ChestType.LARGE, progress: 0, required: 50, isReady: false },
  ]);
  const [lastReward, setLastReward] = useState<Reward | null>(null);

  // Define openStats to fix line 170 error (intended navigation to stats with specific tab)
  const openStats = (tab: 'overview' | 'types') => {
    setInitialStatsTab(tab);
    setSystemState(SystemState.STATS);
  };

  useEffect(() => {
    const savedData = StorageService.load();
    if (savedData) {
        setUser(savedData.user);
        setTasks(savedData.tasks);
        setChests(savedData.chests);
        setTaskTypes(savedData.taskTypes);
        setTimeWindows(savedData.timeWindows);
        setBattlePass(savedData.battlePass);
        const pending = savedData.tasks.find(t => t.status === TaskStatus.PENDING);
        if (pending) setActiveTask(pending);
    }
    SystemService.requestPermissions();
    checkActiveWindow();
  }, []);

  useEffect(() => {
      StorageService.save({ user, tasks, chests, taskTypes, timeWindows, battlePass });
  }, [user, tasks, chests, taskTypes, timeWindows, battlePass]);

  const checkActiveWindow = useCallback(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const found = timeWindows.find(window => {
          if (window.startHour < window.endHour) {
              return currentHour >= window.startHour && currentHour < window.endHour;
          } else {
              return currentHour >= window.startHour || currentHour < window.endHour;
          }
      });
      setActiveWindow(found);
  }, [timeWindows]);

  const generateContextAwareTask = useCallback((): Task => {
    let forcedType: string | null = null;
    if (user.fatigue > 80) forcedType = 'recovery';
    let allowedTypeIds = activeWindow ? activeWindow.allowedTypes : taskTypes.map(t => t.id);
    if (allowedTypeIds.length === 0) allowedTypeIds = taskTypes.map(t => t.id);
    const candidates = taskTypes.filter(t => allowedTypeIds.includes(t.id));
    const selectedConfig = candidates[Math.floor(Math.random() * candidates.length)] || taskTypes[0];
    const availableTitles = selectedConfig.taskTitles || ['通用行动'];
    const title = availableTitles[Math.floor(Math.random() * availableTitles.length)];
    let difficulty = Math.floor(Math.random() * 3) + 1;
    if (user.fatigue > 50) difficulty = Math.max(1, difficulty - 1);
    return {
        id: generateId(), title, type: TaskType.DAILY, typeConfigId: selectedConfig.id,
        difficulty: difficulty as any,
        baseReward: { wpDelta: Math.round(difficulty * 5 * selectedConfig.baseMultiplier), expDelta: Math.round(difficulty * 10 * selectedConfig.baseMultiplier), multiplier: selectedConfig.baseMultiplier },
        timeLimitSeconds: selectedConfig.defaultTimeSeconds, status: TaskStatus.PENDING
    };
  }, [activeWindow, taskTypes, user.fatigue]);

  useEffect(() => {
    if (!tasks.some(t => t.status === TaskStatus.PENDING) && taskTypes.length > 0) {
        const newTask = generateContextAwareTask();
        setTasks([newTask]); setActiveTask(newTask);
    }
  }, [tasks, generateContextAwareTask, taskTypes]);

  const onExecuteClick = () => {
    if (!activeTask) return;
    setSystemState(SystemState.ACCEPT);
    setTimeout(() => {
        setSystemState(SystemState.EXECUTE);
        SystemService.updateTitle(1);
    }, 150);
  };

  const onPostponeClick = () => {
      setUser(prev => ({ ...prev, fatigue: Math.min(100, prev.fatigue + 10) }));
      setTasks([]); setActiveTask(null);
      SystemService.notify("任务已延后", "难度已动态调整", "system");
  };

  const onCompleteTask = () => {
    if (!activeTask) return;
    const finalReward = {
      wpDelta: Math.round(activeTask.baseReward.wpDelta * (activeWindow?.multiplier || 1.0)),
      expDelta: Math.round(activeTask.baseReward.expDelta * (activeWindow?.multiplier || 1.0)),
      multiplier: activeWindow?.multiplier || 1.0
    };
    setTimeout(() => {
        setLastReward(finalReward);
        setSystemState(SystemState.FEEDBACK);
        setUser(prev => ({
            ...prev, wp: prev.wp + finalReward.wpDelta, exp: prev.exp + finalReward.expDelta,
            streak: prev.streak + 1, combo: prev.combo + 1, fatigue: Math.max(0, prev.fatigue - 5) 
        }));
        setTasks([]); setActiveTask(null);
        setChests(prev => prev.map(c => c.isReady ? c : { ...c, progress: Math.min(c.required, c.progress + 1) }));
        setBattlePass(prev => ({ ...prev, currentExp: prev.currentExp + finalReward.expDelta }));
    }, 300);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 font-sans select-none overflow-hidden flex flex-col text-white">
      
      {/* HEADER (10%) - SLIM */}
      <header className="h-[10vh] bg-slate-900/90 flex items-center px-4 gap-3 border-b border-slate-800 shadow-md shrink-0">
          <div className="relative shrink-0" onClick={() => openStats('overview')}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 border-2 border-blue-400 flex items-center justify-center font-black text-lg shadow-lg">
                  {user.level}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 text-[8px] font-black px-1 rounded-full border border-slate-900 flex items-center gap-0.5">
                <Zap size={6} fill="currentColor" /> {user.wp}
              </div>
          </div>
          <div className="flex-1" onClick={() => setSystemState(SystemState.BATTLE_PASS)}>
              <div className="flex justify-between items-end mb-0.5 px-1">
                 <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Season 1</span>
                 <span className="text-[8px] text-yellow-500 font-black flex items-center gap-1">Tier {battlePass.level}</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                  <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300" 
                       style={{ width: `${(battlePass.currentExp / battlePass.expPerLevel) * 100}%` }}></div>
              </div>
          </div>
      </header>

      {/* MAIN CARD (55%) - CENTERED ACTION */}
      <main className="h-[55vh] flex items-center justify-center p-4 shrink-0">
          {activeTask ? (
              <MainActionCard 
                  task={activeTask} 
                  onExecute={onExecuteClick} 
                  onPostpone={onPostponeClick}
                  isRageMode={false}
                  activeWindow={activeWindow}
                  taskTypeConfig={taskTypes.find(t => t.id === activeTask.typeConfigId)}
              />
          ) : (
              <div className="text-slate-500 font-bold animate-pulse text-sm">正在调度最优行为...</div>
          )}
      </main>

      {/* STATUS BLOCK (25%) - COMPACT PROGRESS */}
      <section className="h-[25vh] px-4 flex flex-col justify-center gap-3 shrink-0">
          {/* Combo & Risk Row */}
          <div className="bg-slate-900/50 rounded-2xl p-2.5 border border-slate-800/50 flex items-center gap-3">
               <div className="bg-orange-500/10 p-1.5 rounded-lg shrink-0">
                   <Activity size={18} className="text-orange-500" />
               </div>
               <div className="flex-1">
                   <div className="flex justify-between text-[10px] font-black mb-1 px-1">
                       <span className="text-slate-500 uppercase">连击奖励 x{user.combo}</span>
                       <span className={user.fatigue > 70 ? 'text-red-500' : 'text-green-500'}>RISK: {user.fatigue}%</span>
                   </div>
                   <div className="h-2 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 transition-all duration-500" style={{ width: `${(user.combo % 5) * 20}%` }}></div>
                   </div>
               </div>
          </div>

          {/* Chests Slots */}
          <div className="grid grid-cols-4 gap-2 h-16">
              {chests.map((chest) => (
                  <div 
                     key={chest.id} 
                     className={`relative rounded-xl border-2 flex flex-col items-center justify-center transition-all
                        ${chest.progress >= chest.required ? 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-slate-900 border-slate-800'}`}
                  >
                      {chest.progress >= chest.required ? (
                          <Box className="text-yellow-500 animate-bounce" size={20} />
                      ) : (
                          <Box className="text-slate-800" size={18} />
                      )}
                      {chest.progress < chest.required && chest.progress > 0 && (
                          <div className="absolute bottom-1 left-2 right-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${(chest.progress/chest.required)*100}%` }}></div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </section>

      {/* FOOTER (10%) - FIXED TABS */}
      <footer className="h-[10vh] bg-slate-900 border-t border-slate-800 px-2 shrink-0">
          <div className="h-full flex justify-around items-center">
              {[
                { id: 'logs', icon: Calendar, label: '日志', action: () => openStats('types') },
                { id: 'stats', icon: BarChart3, label: '数据', action: () => openStats('overview') },
                { id: 'recovery', icon: RefreshCw, label: '恢复', active: user.fatigue > 50 },
                { id: 'settings', icon: Menu, label: '设置', action: () => setSystemState(SystemState.SETTINGS) },
              ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => { tab.action ? tab.action() : null; }}
                    className="flex flex-col items-center p-2 text-slate-500 active:scale-90 transition-transform"
                  >
                      <tab.icon size={20} className={tab.active ? 'text-red-400 animate-pulse' : ''} />
                      <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{tab.label}</span>
                  </button>
              ))}
          </div>
      </footer>

      <StateOverlays state={systemState} activeTask={activeTask} onConfirm={() => {}} 
        onCancel={() => { setSystemState(SystemState.IDLE); onPostponeClick(); }}
        onComplete={onCompleteTask} onMomentumContinue={() => setSystemState(SystemState.IDLE)}
        onMomentumExit={() => setSystemState(SystemState.IDLE)} lastReward={lastReward}
      />
      {systemState === SystemState.SETTINGS && <SystemSettings taskTypes={taskTypes} timeWindows={timeWindows} onClose={() => setSystemState(SystemState.IDLE)} onUpdateTaskType={(id, up) => setTaskTypes(t => t.map(x => x.id === id ? {...x,...up}:x))} onUpdateTimeWindow={(id, up) => setTimeWindows(w => w.map(x => x.id === id ? {...x,...up}:x))} onAddTaskType={() => {}} />}
      {systemState === SystemState.BATTLE_PASS && <BattlePassPanel data={battlePass} onClose={() => setSystemState(SystemState.IDLE)} />}
      {systemState === SystemState.STATS && <StatsPanel user={user} taskTypes={taskTypes} initialTab={initialStatsTab} onClose={() => setSystemState(SystemState.IDLE)} />}
    </div>
  );
};

export default App;
