import React from 'react';
import { motion } from 'framer-motion';
import { Task, TaskType } from '../types';
import { ClashButton } from './ClashButton';
import { Clock, Zap, AlertTriangle, Flame } from 'lucide-react';

interface MainActionCardProps {
  task: Task;
  onExecute: () => void;
  isRageMode: boolean;
}

export const MainActionCard: React.FC<MainActionCardProps> = ({ task, onExecute, isRageMode }) => {
  const getGradient = () => {
    switch (task.type) {
      case TaskType.EMERGENCY:
        return 'from-red-900 via-red-800 to-slate-900 border-red-500';
      case TaskType.LIMITED:
        return 'from-orange-900 via-amber-800 to-slate-900 border-orange-500';
      case TaskType.RECOVERY:
        return 'from-purple-900 via-indigo-900 to-slate-900 border-purple-500';
      default: // Daily
        return 'from-blue-900 via-slate-800 to-slate-900 border-blue-500';
    }
  };

  const getActionVerb = () => {
    switch (task.type) {
        case TaskType.EMERGENCY: return "马上灭火";
        case TaskType.RECOVERY: return "立即补救";
        case TaskType.LIMITED: return "即刻夺取";
        default: return "立即执行";
    }
  };

  return (
    <motion.div 
      layoutId="main-card"
      className={`
        w-full h-[60vh] rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between
        bg-gradient-to-br ${getGradient()}
        border-4 shadow-[0_0_40px_rgba(0,0,0,0.5)]
      `}
    >
      {/* Background Particles/Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      
      {/* Top Section: Status */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${task.type === TaskType.EMERGENCY ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
            <span className="text-white/80 font-bold text-sm tracking-wider uppercase">{task.type === TaskType.DAILY ? '日常任务' : task.type}</span>
        </div>
        {isRageMode && (
            <div className="flex items-center gap-1 text-yellow-400 animate-pulse font-black">
                <Flame size={20} fill="currentColor" />
                <span>狂暴中 x2</span>
            </div>
        )}
      </div>

      {/* Middle Section: Massive Title */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl mb-4"
        >
            {task.title}
        </motion.h1>
        
        {/* Blinking Reward/Timer */}
        <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-col items-center">
                <span className="text-orange-400 font-black text-3xl animate-pulse">+{task.baseReward.wpDelta * (isRageMode ? 2 : 1)}</span>
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">WP 奖励</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col items-center">
                 <span className="text-red-400 font-black text-3xl">Lv.{task.difficulty}</span>
                 <span className="text-white/50 text-xs font-bold uppercase tracking-widest">难度</span>
            </div>
        </div>
      </div>

      {/* Bottom Section: The ONE Button */}
      <div className="relative z-10 w-full mb-4">
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
            完成此任务以保持 {task.baseReward.expDelta} EXP 连击
        </p>
      </div>
    </motion.div>
  );
};