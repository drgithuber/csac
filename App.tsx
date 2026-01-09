import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  TimeWindow
} from './types';
import { CONFIG, MOCK_TASKS_DATA, DEFAULT_TASK_TYPES, DEFAULT_TIME_WINDOWS } from './constants';
import { SystemService } from './services/systemService';
import { MainActionCard } from './components/MainActionCard';
import { StateOverlays } from './components/StateOverlays';
import { SystemSettings } from './components/SystemSettings';
import { Zap, Settings, Box, Lock } from 'lucide-react';

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

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>(createInitialState());
  const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
  
  // Addiction Engine Configs (Persisted in state for MVP editing)
  const [taskTypes, setTaskTypes] = useState<TaskTypeConfig[]>(DEFAULT_TASK_TYPES);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>(DEFAULT_TIME_WINDOWS);
  const [activeWindow, setActiveWindow] = useState<TimeWindow | undefined>(undefined);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Deliberately stuck progress (9/10)
  const [chests, setChests] = useState<Chest[]>([
    { id: '1', type: ChestType.SMALL, progress: 4, required: 5, isReady: false }, 
    { id: '2', type: ChestType.MEDIUM, progress: 9, required: 10, isReady: false } 
  ]);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [isRageMode, setIsRageMode] = useState(false);
  const rageTimerRef = useRef<number | null>(null);

  // --- Addiction Engine Logic ---

  const checkActiveWindow = useCallback(() => {
      const now = new Date();
      const currentHour = now.getHours();

      const found = timeWindows.find(window => {
          if (window.startHour < window.endHour) {
              // Standard window (e.g., 09:00 - 17:00)
              return currentHour >= window.startHour && currentHour < window.endHour;
          } else {
              // Cross-midnight window (e.g., 22:00 - 06:00)
              return currentHour >= window.startHour || currentHour < window.endHour;
          }
      });
      
      // Visual Feedback if window changed
      if (found && activeWindow?.id !== found.id) {
          // Subtle notification could go here "Entered Deep Work Mode"
          SystemService.updateTitle(0); // Reset title
      }
      setActiveWindow(found);
  }, [timeWindows, activeWindow]);

  const generateContextAwareTask = useCallback((): Task => {
    // 1. Determine allowed types based on active window
    let allowedTypeIds = activeWindow ? activeWindow.allowedTypes : taskTypes.map(t => t.id);
    if (allowedTypeIds.length === 0) allowedTypeIds = taskTypes.map(t => t.id); // Fallback

    // 2. Pick a random allowed type
    const selectedTypeId = allowedTypeIds[Math.floor(Math.random() * allowedTypeIds.length)];
    const selectedConfig = taskTypes.find(t => t.id === selectedTypeId) || taskTypes[0];

    // 3. Pick a random template (Mock data for now, ideally strictly typed to category)
    const template = MOCK_TASKS_DATA[Math.floor(Math.random() * MOCK_TASKS_DATA.length)];

    return {
        id: generateId(),
        title: template.title,
        type: TaskType.DAILY, // Legacy field
        typeConfigId: selectedConfig.id, // New field
        difficulty: template.diff as 1|2|3|4|5,
        baseReward: {
            wpDelta: Math.round(template.diff * 5 * selectedConfig.baseMultiplier),
            expDelta: Math.round(template.diff * 10 * selectedConfig.baseMultiplier),
            multiplier: selectedConfig.baseMultiplier
        },
        timeLimitSeconds: selectedConfig.defaultTimeSeconds,
        status: TaskStatus.PENDING
    };
  }, [activeWindow, taskTypes]);

  // --- Effects ---

  useEffect(() => {
    // Initial Setup
    SystemService.requestPermissions();
    checkActiveWindow();
    
    // Check Time Window every minute
    const timeCheckInterval = setInterval(checkActiveWindow, 60000);

    // Initial Task Population
    if (tasks.length === 0) {
        // Need to wait for checkActiveWindow to run once technically, but it's sync here
        const initialTasks = [generateContextAwareTask(), generateContextAwareTask()];
        setTasks(initialTasks);
        setActiveTask(initialTasks[0]);
    }

    // Rage Mode Loop
    const rageLoop = setInterval(() => {
        if (Math.random() > 0.9 && systemState === SystemState.IDLE) {
            triggerRageMode();
        }
    }, 60000);

    return () => {
        clearInterval(timeCheckInterval);
        clearInterval(rageLoop);
    };
  }, []);

  // Ensure active task always exists and matches context
  useEffect(() => {
    if (tasks.length === 0 && taskTypes.length > 0) {
        const newTask = generateContextAwareTask();
        setTasks([newTask]);
        setActiveTask(newTask);
    }
  }, [tasks, generateContextAwareTask, taskTypes]);


  const triggerRageMode = () => {
    setIsRageMode(true);
    SystemService.notify("狂暴模式", "5分钟内双倍奖励！", "emergency");
    SystemService.vibrate('warning');
    if (rageTimerRef.current) clearTimeout(rageTimerRef.current);
    rageTimerRef.current = window.setTimeout(() => {
      setIsRageMode(false);
    }, CONFIG.RAGE_WINDOW_DURATION_SEC * 1000);
  };

  // --- Actions ---

  const onExecuteClick = () => {
    if (!activeTask) return;
    setSystemState(SystemState.ACCEPT);
    setTimeout(() => {
        setSystemState(SystemState.EXECUTE);
        SystemService.updateTitle(1);
    }, 100); 
  };

  const onCompleteTask = () => {
    if (!activeTask) return;
    
    // Calculate Multipliers
    const rageMult = isRageMode ? CONFIG.RAGE_WINDOW_MULTIPLIER : 1;
    const windowMult = activeWindow ? activeWindow.multiplier : 1.0;
    const totalMult = rageMult * windowMult;

    const finalReward: Reward = {
      wpDelta: Math.round(activeTask.baseReward.wpDelta * totalMult),
      expDelta: Math.round(activeTask.baseReward.expDelta * totalMult),
      multiplier: totalMult
    };
    
    setTimeout(() => {
        setLastReward(finalReward);
        setSystemState(SystemState.FEEDBACK);
        SystemService.vibrate('success');
        
        // Update User
        setUser(prev => ({
            ...prev,
            wp: prev.wp + finalReward.wpDelta,
            exp: prev.exp + finalReward.expDelta,
            level: prev.level + Math.floor((prev.exp + finalReward.expDelta)/prev.maxExp),
            streak: prev.streak + 1,
            combo: prev.combo + 1,
        }));

        // Remove completed task and generate new one immediately
        setTasks(prev => {
            const remaining = prev.filter(t => t.id !== activeTask.id);
            return [...remaining, generateContextAwareTask()]; 
        });
        
        // Auto-select next task happens via effect, but let's be safe
        const nextTask = generateContextAwareTask();
        setActiveTask(nextTask);

        // Update Chests
        setChests(prev => prev.map(c => ({
            ...c,
            progress: Math.min(c.required - 1, c.progress + 1) 
        })));
    }, 300);
  };

  const onMomentumContinue = () => {
     setSystemState(SystemState.IDLE);
  };

  const onCancelExecute = () => {
      setSystemState(SystemState.IDLE);
  };

  // --- Config Updaters ---
  const handleUpdateTaskType = (id: string, updates: Partial<TaskTypeConfig>) => {
      setTaskTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleUpdateTimeWindow = (id: string, updates: Partial<TimeWindow>) => {
      setTimeWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      checkActiveWindow(); // Re-check immediately
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans select-none overflow-hidden flex flex-col text-white">
      
      {/* 1. Dark Header */}
      <header className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 z-20 flex justify-between items-center">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-lg border-2 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                 {user.level}
             </div>
             <div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Experience</div>
                 <div className="w-24 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                     <div className="h-full bg-blue-500" style={{ width: '80%' }}></div>
                 </div>
             </div>
         </div>
         <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                 <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                 <span className="font-black text-xl text-yellow-100">{user.wp}</span>
             </div>
             <button onClick={() => setSystemState(SystemState.SETTINGS)} className="text-slate-400 hover:text-white">
                 <Settings size={24} />
             </button>
         </div>
      </header>

      {/* 2. Main Focus Area (60%+) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {activeTask ? (
             <div className="w-full max-w-md relative z-10">
                 <MainActionCard 
                    task={activeTask} 
                    onExecute={onExecuteClick} 
                    isRageMode={isRageMode}
                    activeWindow={activeWindow}
                    taskTypeConfig={taskTypes.find(t => t.id === activeTask.typeConfigId)}
                 />
             </div>
          ) : (
             <div className="text-slate-500 font-bold animate-pulse">正在匹配当前时段任务...</div>
          )}
      </main>

      {/* 3. "Almost There" Footer */}
      <footer className="bg-slate-900 p-6 pb-8 border-t border-slate-800 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-md mx-auto">
             <div className="flex justify-between items-end mb-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">宝箱进度 (只差一点!)</h3>
                <button onClick={() => setSystemState(SystemState.EXIT_HOOK)} className="text-xs text-slate-600 font-bold hover:text-white transition-colors">休息一下</button>
             </div>
             
             {/* Chests stuck at 90% */}
             <div className="grid grid-cols-2 gap-4">
                 {chests.map(chest => (
                     <div key={chest.id} className="bg-slate-800 rounded-2xl p-3 border border-slate-700 flex items-center gap-3 relative overflow-hidden group">
                         <div className="absolute top-0 left-0 bottom-0 bg-slate-700/50" style={{ width: `${(chest.progress / chest.required) * 100}%` }}></div>
                         
                         <div className="relative z-10 bg-slate-900 p-2 rounded-xl border border-slate-600">
                             <Box className="text-yellow-500" size={20} />
                         </div>
                         <div className="relative z-10 flex-1">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm font-bold text-slate-300">{chest.type}</span>
                                 <Lock size={12} className="text-slate-500" />
                             </div>
                             <div className="text-xs font-black text-white/90">
                                <span className="text-yellow-400">{chest.progress}</span> / {chest.required}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      </footer>

      <StateOverlays 
        state={systemState}
        activeTask={activeTask}
        onConfirm={() => {}} 
        onCancel={onCancelExecute}
        onComplete={onCompleteTask}
        onMomentumContinue={onMomentumContinue}
        onMomentumExit={() => setSystemState(SystemState.IDLE)}
        lastReward={lastReward}
      />

      {systemState === SystemState.SETTINGS && (
          <SystemSettings 
            taskTypes={taskTypes}
            timeWindows={timeWindows}
            onClose={() => setSystemState(SystemState.IDLE)}
            onUpdateTaskType={handleUpdateTaskType}
            onUpdateTimeWindow={handleUpdateTimeWindow}
          />
      )}
    </div>
  );
};

export default App;