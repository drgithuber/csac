import React from 'react';
import { motion } from 'framer-motion';
import { Task, TimeWindow, TaskTypeConfig } from '../types';
import { ClashButton } from './ClashButton';
import { Zap, Flame, Sparkles, SkipForward } from 'lucide-react';

interface MainActionCardProps {
  task: Task;
  onExecute: () => void;
  onPostpone: () => void;
  isRageMode: boolean;
  activeWindow?: TimeWindow;
  taskTypeConfig?: TaskTypeConfig;
}

export const MainActionCard: React.FC<MainActionCardProps> = ({ 
  task, 
  onExecute, 
  onPostpone,
  isRageMode,
  activeWindow,
  taskTypeConfig
}) => {
  
  const getGradient = () => {
    if (activeWindow) {
        switch (activeWindow.theme) {
            case 'sunrise': return 'from-orange-600 via-amber-700 to-slate-900 border-orange-400';
            case 'day': return 'from-blue-600 via-cyan-700 to-slate-900 border-cyan-400';
            case 'sunset': return 'from-purple-600 via-pink-800 to-slate-900 border-pink-400';
            case 'midnight': return 'from-indigo-900 via-slate-800 to-black border-indigo-500';
        }
    }
    return 'from-blue-900 via-slate-800 to-slate-900 border-blue-500';
  };

  return (
    <motion.div 
      layoutId="main-card"
      className={`
        w-full h-full max-w-sm rounded-[32px] p-5 relative overflow-hidden flex flex-col justify-between
        bg-gradient-to-br ${getGradient()}
        border-4 shadow-2xl transition-all duration-500
      `}
    >
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      
      {/* Top Window Info */}
      <div className="relative z-10">
        <div className="flex justify-between items-center px-3 py-1.5 rounded-full bg-black/30 border border-white/10">
            <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-white font-black text-[10px] uppercase tracking-wider">
                    {activeWindow?.name || '常规'}
                </span>
            </div>
            <span className="text-yellow-400 font-black text-xs uppercase">x{activeWindow?.multiplier || '1.0'}</span>
        </div>
      </div>

      {/* Title Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center py-2">
        <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black text-white/70 uppercase tracking-widest border border-white/5 mb-2">
            {taskTypeConfig?.name || '任务'}
        </span>
        <h1 className="text-3xl font-black text-white leading-tight drop-shadow-xl mb-4 line-clamp-2">
            {task.title}
        </h1>
        
        {/* Compact Rewards */}
        <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
            <div className="text-center">
                <div className="text-orange-400 font-black text-lg">+{task.baseReward.wpDelta}</div>
                <div className="text-[8px] text-white/40 font-bold uppercase">WP</div>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="text-center">
                <div className="text-blue-400 font-black text-lg">+{task.baseReward.expDelta}</div>
                <div className="text-[8px] text-white/40 font-bold uppercase">EXP</div>
            </div>
        </div>
      </div>

      {/* Buttons Area */}
      <div className="relative z-10 flex flex-col gap-2">
        <ClashButton onClick={onExecute} variant="primary" size="large" className="w-full h-16 text-xl">
            <Zap size={20} fill="currentColor" />
            立即启动
        </ClashButton>
        <button 
           onClick={onPostpone}
           className="text-white/30 hover:text-white/60 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 py-1"
        >
            <SkipForward size={12} /> 延后 (风险+10%)
        </button>
      </div>
    </motion.div>
  );
};