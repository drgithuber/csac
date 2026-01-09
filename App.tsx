import React, { useState, useEffect, useRef } from 'react';
import { 
  Task, 
  TaskType, 
  TaskStatus, 
  UserState, 
  SystemState, 
  Chest, 
  ChestType, 
  Reward 
} from './types';
import { CONFIG, MOCK_TASKS_DATA } from './constants';
import { SystemService } from './services/systemService';
import { MainActionCard } from './components/MainActionCard';
import { StateOverlays } from './components/StateOverlays';
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

const generateTask = (type: TaskType = TaskType.DAILY): Task => {
  const template = MOCK_TASKS_DATA[Math.floor(Math.random() * MOCK_TASKS_DATA.length)];
  const isRecovery = type === TaskType.RECOVERY;
  return {
    id: generateId(),
    title: isRecovery ? `补救: ${template.title}` : template.title,
    type: type,
    difficulty: template.diff as 1|2|3|4|5,
    baseReward: {
      wpDelta: (template.diff * 5) * (isRecovery ? CONFIG.RECOVERY_REWARD_BOOST : 1),
      expDelta: template.diff * 10,
      multiplier: 1,
    },
    status: TaskStatus.PENDING,
    timeLimitSeconds: type === TaskType.EMERGENCY ? 300 : undefined,
  };
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>(createInitialState());
  const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
  const [tasks, setTasks] = useState<Task[]>([]);
  // We use activeTask to determine what is shown on the Main Card
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Deliberately stuck progress (9/10)
  const [chests, setChests] = useState<Chest[]>([
    { id: '1', type: ChestType.SMALL, progress: 4, required: 5, isReady: false }, // Stuck at 80%
    { id: '2', type: ChestType.MEDIUM, progress: 9, required: 10, isReady: false } // Stuck at 90%
  ]);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [isRageMode, setIsRageMode] = useState(false);
  const rageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial Population
    replenishTasks();
    SystemService.requestPermissions();
    
    // Simulate Daily Decay / Check
    const now = Date.now();
    if (new Date(now).getDate() !== new Date(user.lastActive).getDate()) {
       handleDailyDecay();
    }

    // Rage Mode Loop
    const rageLoop = setInterval(() => {
        if (Math.random() > 0.9 && systemState === SystemState.IDLE) {
            triggerRageMode();
        }
    }, 60000);

    return () => clearInterval(rageLoop);
  }, []);

  // Ensure we always have tasks, and select the most important one
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Priority Sort: Emergency > Limited > Recovery > Daily
    const sorted = [...tasks].sort((a, b) => {
        const priority = { [TaskType.EMERGENCY]: 4, [TaskType.LIMITED]: 3, [TaskType.RECOVERY]: 2, [TaskType.DAILY]: 1 };
        return priority[b.type] - priority[a.type];
    });
    
    // Auto-select top task if none is active or if we are in IDLE
    if (systemState === SystemState.IDLE) {
        setActiveTask(sorted[0]);
    }
  }, [tasks, systemState]);

  const replenishTasks = () => {
    setTasks(prev => {
        if (prev.length > 2) return prev;
        return [...prev, generateTask(), generateTask()];
    });
  };

  const handleDailyDecay = () => {
    // Logic as before...
    setUser(prev => ({ ...prev, wp: Math.max(1, prev.wp - CONFIG.WP_DECAY_DAILY), lastActive: Date.now() }));
    // Convert old tasks
    setTasks(prev => prev.map(t => ({...t, type: TaskType.RECOVERY, title: `补救: ${t.title}`})));
    SystemService.notify("新的一天", "状态已更新。补救任务已生成。", "system");
  };

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
    // Instant transition to execute for "Addictive" feel - skip confirm dialog
    setTimeout(() => {
        setSystemState(SystemState.EXECUTE);
        SystemService.updateTitle(1);
    }, 100); 
  };

  const onCompleteTask = () => {
    if (!activeTask) return;
    const rageMult = isRageMode ? CONFIG.RAGE_WINDOW_MULTIPLIER : 1;
    const finalReward: Reward = {
      wpDelta: Math.round(activeTask.baseReward.wpDelta * rageMult),
      expDelta: Math.round(activeTask.baseReward.expDelta * rageMult),
      multiplier: rageMult
    };
    
    // Pause for 300ms before showing reward (Addictive Formula)
    setTimeout(() => {
        setLastReward(finalReward);
        setSystemState(SystemState.FEEDBACK);
        SystemService.vibrate('success');
        
        // Update User
        setUser(prev => ({
            ...prev,
            wp: prev.wp + finalReward.wpDelta,
            exp: prev.exp + finalReward.expDelta,
            level: prev.level + Math.floor((prev.exp + finalReward.expDelta)/prev.maxExp), // Simple level up
            streak: prev.streak + 1,
            combo: prev.combo + 1,
        }));

        // Remove completed task
        setTasks(prev => prev.filter(t => t.id !== activeTask.id));
        
        // Update Chests (Fake progress stuck at end)
        setChests(prev => prev.map(c => ({
            ...c,
            // Stick at required - 1 to force "Just one more" feeling unless we want to let them open
            progress: Math.min(c.required - 1, c.progress + 1) 
        })));
    }, 300);
  };

  const onMomentumContinue = () => {
     setSystemState(SystemState.IDLE);
     replenishTasks();
  };

  const onRequestRest = () => {
      // Trigger the Exit Hook UI
      setSystemState(SystemState.EXIT_HOOK);
  };

  const onRealExit = () => {
      setSystemState(SystemState.IDLE);
      // In a real app, this might minimize or do nothing.
  };

  const onCancelExecute = () => {
      setSystemState(SystemState.IDLE);
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
         <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
             <Zap size={16} className="text-yellow-400 fill-yellow-400" />
             <span className="font-black text-xl text-yellow-100">{user.wp}</span>
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
                 />
             </div>
          ) : (
             <div className="text-slate-500 font-bold animate-pulse">正在生成新任务...</div>
          )}

          {/* Secondary Task Preview (Blurred / Background) */}
          <div className="absolute bottom-4 w-full max-w-md opacity-30 scale-90 translate-y-1/2 blur-[2px] pointer-events-none">
             <div className="bg-slate-800 h-32 rounded-3xl border-2 border-slate-700"></div>
          </div>
      </main>

      {/* 3. "Almost There" Footer */}
      <footer className="bg-slate-900 p-6 pb-8 border-t border-slate-800 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-md mx-auto">
             <div className="flex justify-between items-end mb-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">宝箱进度 (只差一点!)</h3>
                <button onClick={onRequestRest} className="text-xs text-slate-600 font-bold hover:text-white transition-colors">休息一下</button>
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
        onConfirm={() => {}} // Not used in this flow
        onCancel={onCancelExecute}
        onComplete={onCompleteTask}
        onMomentumContinue={onMomentumContinue}
        onMomentumExit={onRealExit}
        lastReward={lastReward}
      />
    </div>
  );
};

export default App;