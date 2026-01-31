import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, SystemState, Reward } from '../types';
import { ClashButton } from './ClashButton';
import { Clock, CheckCircle, Flame, ShieldAlert } from 'lucide-react';

interface OverlayProps {
  state: SystemState;
  activeTask: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onMomentumContinue: () => void;
  onMomentumExit: () => void;
  lastReward: Reward | null;
}

export const StateOverlays: React.FC<OverlayProps> = ({
  state,
  activeTask,
  onConfirm,
  onCancel,
  onComplete,
  onMomentumContinue,
  onMomentumExit,
  lastReward
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (state === SystemState.EXECUTE && activeTask?.timeLimitSeconds) {
      setTimeLeft(activeTask.timeLimitSeconds);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state, activeTask]);

  // Backdrop
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modal = {
    hidden: { scale: 0.8, opacity: 0, y: 50 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.5 } },
    exit: { scale: 0.8, opacity: 0, y: 50 }
  };

  if (state === SystemState.IDLE) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      >
        {/* EXECUTE STATE */}
        {state === SystemState.EXECUTE && activeTask && (
          <motion.div variants={modal} className="bg-slate-900 w-full max-w-md rounded-[32px] p-8 border-4 border-slate-700 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500 animate-progress"></div>
            
            <div className="text-center mb-10 mt-4">
              <div className="animate-pulse mb-6 flex justify-center">
                <Clock size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">正在执行...</h2>
              <p className="text-slate-400 font-bold text-xl">{activeTask.title}</p>
              
              {timeLeft > 0 && (
                <div className="mt-8 text-7xl font-mono font-black text-red-500 tracking-tighter drop-shadow-lg">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
            
            <ClashButton variant="success" size="large" onClick={onComplete} className="w-full text-xl shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              立刻完成
            </ClashButton>
            <div className="mt-6 text-center">
                {/* Changed from 'Abandon' to 'Buffer' logic visual */}
                <button onClick={onCancel} className="text-slate-600 font-bold text-sm hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2 w-full">
                    <span>太难了? 降低难度 (Buffer)</span>
                </button>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK STATE - EXPLOSION */}
        {state === SystemState.FEEDBACK && lastReward && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md text-center relative"
          >
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }} className="w-64 h-64 rounded-full bg-yellow-500/30 blur-xl"></motion.div>
             </div>

             <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1 }}
                className="mb-8"
             >
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-sm italic transform -skew-x-6">
                    VICTORY!
                </h2>
             </motion.div>

             <div className="flex justify-center gap-6 mb-10">
                <div className="flex flex-col items-center">
                    <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ type: 'spring', delay: 0.2 }}
                        className="text-6xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
                    >
                        +{lastReward.wpDelta}
                    </motion.span>
                    <span className="text-orange-400 font-bold uppercase tracking-widest text-sm mt-2">Will Power</span>
                </div>
                <div className="flex flex-col items-center">
                    <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1.2 }} transition={{ type: 'spring', delay: 0.3 }}
                        className="text-4xl font-black text-blue-300 drop-shadow-[0_4px_0_rgba(0,0,0,1)] mt-3"
                    >
                        +{lastReward.expDelta}
                    </motion.span>
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mt-2">EXP</span>
                </div>
             </div>

             <ClashButton variant="primary" size="large" onClick={onMomentumContinue} className="w-full animate-bounce-slow">
               继续收割
             </ClashButton>
          </motion.div>
        )}

        {/* MOMENTUM STATE / EXIT HOOK */}
        {(state === SystemState.MOMENTUM || state === SystemState.EXIT_HOOK) && (
          <motion.div variants={modal} className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-md rounded-[32px] p-8 border-4 border-slate-600 shadow-2xl text-center text-white">
            <div className="mb-6 flex justify-center">
                <div className="bg-slate-700 p-4 rounded-full border-4 border-slate-500">
                    <ShieldAlert size={48} className="text-red-400" />
                </div>
            </div>
            
            <h2 className="text-3xl font-black mb-4">稍等一下!</h2>
            <p className="text-slate-300 mb-8 font-medium text-lg leading-relaxed">
              再完成 <span className="text-yellow-400 font-black text-xl">1个任务</span> 就能开启宝箱获得奖励！
            </p>
            
            <div className="flex flex-col gap-4">
               <ClashButton variant="primary" size="large" onClick={onMomentumContinue} className="w-full">
                 继续 (高亮)
               </ClashButton>
               <button onClick={onMomentumExit} className="text-slate-500 font-bold py-3 hover:text-white transition-colors">
                 稍后
               </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};