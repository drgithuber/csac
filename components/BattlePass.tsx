import React from 'react';
import { motion } from 'framer-motion';
import { BattlePass } from '../types';
import { ClashButton } from './ClashButton';
import { X, Lock, Check, Gift, Crown } from 'lucide-react';

interface BattlePassProps {
  data: BattlePass;
  onClose: () => void;
}

export const BattlePassPanel: React.FC<BattlePassProps> = ({ data, onClose }) => {
  const progressPercent = (data.currentExp / data.expPerLevel) * 100;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden shadow-2xl border-l-4 border-slate-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 pt-12 pb-8 shadow-lg relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 p-2 rounded-full text-white transition-colors"
        >
            <X size={24} />
        </button>
        
        <div className="flex items-center gap-2 mb-2">
            <Crown className="text-yellow-300" fill="currentColor" />
            <span className="text-yellow-100 font-bold uppercase tracking-widest text-sm">Season 1</span>
        </div>
        <h2 className="text-4xl font-black text-white italic drop-shadow-md">黄金战令</h2>
        <div className="mt-4 flex items-center justify-between text-white/80 font-bold text-sm">
            <span>21天赛季</span>
            <span>剩余 12 天</span>
        </div>
      </div>

      {/* Track */}
      <div className="flex-1 overflow-y-auto bg-slate-800 p-6 relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-700 -ml-1 z-0"></div>

          <div className="space-y-12 relative z-10">
              {data.rewards.map((reward) => {
                  const isUnlocked = data.level >= reward.level;
                  const isCurrent = data.level === reward.level - 1; // Visualizing next goal

                  return (
                      <div key={reward.level} className="relative flex items-center justify-between group">
                          
                          {/* Free Track (Left) */}
                          <div className={`
                             w-[42%] bg-slate-700 rounded-xl p-3 border-2 transition-all flex flex-col items-center text-center relative
                             ${isUnlocked ? 'border-green-500 bg-slate-600' : 'border-slate-600 opacity-80'}
                          `}>
                              <span className="text-[10px] text-slate-400 uppercase font-black mb-1">免费</span>
                              <Gift size={24} className={isUnlocked ? 'text-green-400' : 'text-slate-500'} />
                              <span className="text-xs font-bold text-white mt-1">{reward.freeReward}</span>
                              {isUnlocked && <div className="absolute -top-2 -left-2 bg-green-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
                          </div>

                          {/* Level Indicator (Center) */}
                          <div className={`
                             w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 z-20
                             ${isUnlocked ? 'bg-yellow-500 border-yellow-300 text-yellow-900' : 'bg-slate-900 border-slate-600 text-slate-500'}
                             ${isCurrent ? 'scale-125 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : ''}
                          `}>
                              {reward.level}
                          </div>

                          {/* Premium Track (Right) */}
                          <div className={`
                             w-[42%] bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 border-2 transition-all flex flex-col items-center text-center relative
                             ${isUnlocked ? 'border-yellow-500 from-yellow-900/50 to-orange-900/50' : 'border-slate-600 opacity-60'}
                          `}>
                              <span className="text-[10px] text-yellow-500 uppercase font-black mb-1 flex items-center gap-1">
                                  <Crown size={10} /> 高级
                              </span>
                              <div className="relative">
                                  <Gift size={24} className={isUnlocked ? 'text-yellow-400' : 'text-slate-500'} />
                                  {!isUnlocked && <Lock size={12} className="absolute -bottom-1 -right-1 text-slate-400" />}
                              </div>
                              <span className="text-xs font-bold text-yellow-100 mt-1">{reward.premiumReward}</span>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>
    </motion.div>
  );
};