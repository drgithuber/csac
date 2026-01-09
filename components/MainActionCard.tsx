import React from 'react';
import { motion } from 'framer-motion';
import { Task, TimeWindow, TaskTypeConfig } from '../types';
import { ClashButton } from './ClashButton';
import { Zap, Flame, Clock, Sparkles } from 'lucide-react';

interface MainActionCardProps {
  task: Task;
  onExecute: () => void;
  isRageMode: boolean;
  activeWindow?: TimeWindow;
  taskTypeConfig?: TaskTypeConfig;
}

export const MainActionCard: React.FC<MainActionCardProps> = ({ 
  task, 
  onExecute, 
  isRageMode,
  activeWindow,
  taskTypeConfig
}) => {
  
  const getGradient = () => {
    // Priority: Rage Mode -> Active Window Theme -> Default Task Color
    if (isRageMode) return 'from-red-900 via-red-800 to-slate-900 border-red-500';
    
    if (activeWindow) {
        switch (activeWindow.theme) {
            case 'sunrise': return 'from-orange-600 via-amber-700 to-slate-900 border-orange-400';
            case 'day': return 'from-blue-600 via-cyan-700 to-slate-900 border-cyan-400';
            case 'sunset': return 'from-purple-600 via-pink-800 to-slate-900 border-pink-400';
            case 'midnight': return 'from-indigo-900 via-slate-800 to-black border-indigo-500';
        }
    }
    
    // Fallback based on config color
    if (taskTypeConfig) {
        switch(taskTypeConfig.colorTheme) {
            case 'green': return 'from-green-800 via-emerald-900 to-slate-900 border-green-500';
            case 'purple': return 'from-purple-900 via-indigo-900 to-slate-900 border-purple-500';
            case 'orange': return 'from-orange-800 via-amber-900 to-slate-900 border-orange-500';
            default: return 'from-blue-900 via-slate-800 to-slate-900 border-blue-500';
        }
    }

    return 'from-blue-900 via-slate-800 to-slate-900 border-blue-500';
  };

  const getActionVerb = () => {
    if (taskTypeConfig?.actionVerbs && taskTypeConfig.actionVerbs.length > 0) {
        return taskTypeConfig.actionVerbs[Math.floor(Math.random() * taskTypeConfig.actionVerbs.length)];
    }
    return "立即执行";
  };

  const getWindowLabel = () => {
      if (isRageMode) return "狂暴模式";
      if (activeWindow) return activeWindow.name;
      return "常规时段";
  };

  return (
    <motion.div 
      layoutId="main-card"
      className={`
        w-full h-[60vh] rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between
        bg-gradient-to-br ${getGradient()}
        border-4 shadow-[0_0_40px_rgba(0,0,0,0.5)]
        transition-colors duration-500
      `}
    >
      {/* Background Particles/Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      
      {/* Top Section: Status Bar (Time Window) */}
      <div className="relative z-10 w-full">
        <div className={`
           flex justify-between items-center px-4 py-2 rounded-full border border-white/10 backdrop-blur-md
           ${isRageMode ? 'bg-red-900/50' : 'bg-black/30'}
        `}>
            <div className="flex items-center gap-2">
                {isRageMode ? <Flame size={18} className="text-yellow-400 animate-pulse" /> : <Sparkles size={18} className="text-yellow-400" />}
                <span className="text-white font-bold text-sm tracking-wide uppercase shadow-sm">
                    {getWindowLabel()}
                </span>
            </div>
            <div className="flex items-center gap-1">
                 <span className="text-xs text-white/60 font-bold uppercase mr-1">收益</span>
                 <span className="text-yellow-400 font-black text-lg">
                    x{isRageMode ? '2.0' : (activeWindow?.multiplier || 1.0)}
                 </span>
            </div>
        </div>
      </div>

      {/* Middle Section: Massive Title */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        <div className="mb-2">
             <span className={`
                px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-white/20
                ${taskTypeConfig ? 'bg-white/10 text-white' : 'bg-slate-700 text-slate-400'}
             `}>
                {taskTypeConfig ? taskTypeConfig.name : '普通任务'}
             </span>
        </div>
        <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl mb-6"
        >
            {task.title}
        </motion.h1>
        
        {/* Reward Pill */}
        <div className="inline-flex items-center gap-3 bg-black/40 px-6 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <span className="text-orange-400 font-black text-3xl animate-pulse">
                    +{Math.round(task.baseReward.wpDelta * (isRageMode ? 2 : (activeWindow?.multiplier || 1)))}
                </span>
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">WP 奖励</span>
            </div>
             <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
                 <span className="text-blue-400 font-black text-3xl">
                    +{Math.round(task.baseReward.expDelta * (isRageMode ? 2 : (activeWindow?.multiplier || 1)))}
                 </span>
                 <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">EXP</span>
            </div>
        </div>
      </div>

      {/* Bottom Section: The ONE Button */}
      <div className="relative z-10 w-full mb-2">
        <ClashButton 
            onClick={onExecute} 
            variant="primary" 
            size="large" 
            className="w-full shadow-[0_0_20px_rgba(234,88,12,0.4)]"
        >
            <Zap className="mr-2" fill="currentColor" />
            {getActionVerb()}
        </ClashButton>
        <p className="text-center text-white/30 text-xs mt-3 font-medium">
            完成以保持连击 | 当前时段加成生效中
        </p>
      </div>
    </motion.div>
  );
};