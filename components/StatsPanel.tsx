import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserState, TaskTypeConfig } from '../types';
import { ClashButton } from './ClashButton';
import { X, Activity, TrendingUp, Skull, Crosshair, BarChart2 } from 'lucide-react';

interface StatsPanelProps {
  user: UserState;
  taskTypes: TaskTypeConfig[];
  initialTab: 'overview' | 'types';
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ user, taskTypes, initialTab, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'types'>(initialTab);

  // Mock Heatmap Data (Activity Density)
  const heatmapData = Array.from({ length: 28 }, (_, i) => ({
    day: i,
    intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
  }));

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-800';
      case 1: return 'bg-green-900/50';
      case 2: return 'bg-green-700/60';
      case 3: return 'bg-green-500/80';
      case 4: return 'bg-green-400';
      default: return 'bg-slate-800';
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-slate-950 z-50 flex flex-col pt-safe rounded-t-[32px] overflow-hidden shadow-2xl border-t-4 border-slate-700 font-sans"
    >
      {/* Header */}
      <div className="bg-slate-900 p-6 border-b border-slate-800 flex justify-between items-center relative z-10">
        <div>
            <h2 className="text-3xl font-black text-white italic">数据中心</h2>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">SYSTEM ANALYTICS</p>
        </div>
        <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700 border border-slate-600">
            <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 px-6 pb-4 gap-2 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2
            ${activeTab === 'overview' ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
        >
          综合概览
        </button>
        <button 
          onClick={() => setActiveTab('types')}
          className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2
            ${activeTab === 'types' ? 'bg-blue-500 text-white border-blue-400 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
        >
          行为分类
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 1. Global Status Cards */}
            <div className="grid grid-cols-2 gap-4">
               {/* Fatigue */}
               <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 text-red-400">
                      <Skull size={18} />
                      <span className="text-xs font-black uppercase">疲劳指数</span>
                  </div>
                  <div className="text-3xl font-black text-white">{user.fatigue}%</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${user.fatigue > 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${user.fatigue}%`}}></div>
                  </div>
               </div>
               
               {/* Streak Stability */}
               <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                      <Activity size={18} />
                      <span className="text-xs font-black uppercase">连击稳定度</span>
                  </div>
                  <div className="text-3xl font-black text-white">{(user.streak * 1.5).toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-500 font-bold mt-1">当前连击: {user.combo}</div>
               </div>
            </div>

            {/* 2. Activity Heatmap */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-400"/>
                        行为密度 (近28天)
                    </h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {heatmapData.map((d, i) => (
                        <div 
                            key={i} 
                            className={`aspect-square rounded-md ${getIntensityColor(d.intensity)}`}
                        ></div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold uppercase">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>

            {/* 3. System Analysis Text */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                <h4 className="text-indigo-300 font-bold text-sm mb-2 uppercase flex items-center gap-2">
                    <Crosshair size={14} /> 系统评估
                </h4>
                <p className="text-indigo-100 text-sm leading-relaxed">
                    目前行为模式处于<span className="text-white font-bold">高频触发期</span>。虽然疲劳值有所上升，但连击奖励带来的多巴胺正反馈足以抵消阻力。建议保持当前的节奏，但要在22:00后注意切换至恢复模式。
                </p>
            </div>
          </div>
        )}

        {/* --- TYPE STATS TAB --- */}
        {activeTab === 'types' && (
          <div className="space-y-4">
             {taskTypes.map(type => {
                 const total = type.usageCount || 0;
                 const success = type.successCount || 0;
                 const rate = total > 0 ? Math.round((success / total) * 100) : 0;
                 
                 return (
                     <div key={type.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl
                             ${type.colorTheme === 'blue' ? 'bg-blue-600' : type.colorTheme === 'red' ? 'bg-red-600' : type.colorTheme === 'green' ? 'bg-green-600' : type.colorTheme === 'purple' ? 'bg-purple-600' : 'bg-orange-600'}
                         `}>
                             {type.name[0]}
                         </div>
                         
                         <div className="flex-1">
                             <div className="flex justify-between items-end mb-1">
                                 <h3 className="font-bold text-white">{type.name}</h3>
                                 <span className="text-xs font-black text-slate-400">Lv.{total}</span>
                             </div>
                             
                             {/* Mini Progress Bar for Win Rate */}
                             <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                 <div className="h-full bg-slate-700 absolute w-full"></div>
                                 <div 
                                    className={`h-full ${rate > 80 ? 'bg-green-500' : rate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{ width: `${rate}%` }}
                                 ></div>
                             </div>
                             
                             <div className="flex justify-between mt-1.5">
                                 <span className="text-[10px] text-slate-500 font-bold uppercase">完成率</span>
                                 <span className={`text-xs font-black ${rate > 80 ? 'text-green-400' : 'text-slate-400'}`}>{rate}%</span>
                             </div>
                         </div>
                     </div>
                 )
             })}
          </div>
        )}
      </div>
    </motion.div>
  );
};