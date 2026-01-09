import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskTypeConfig, TimeWindow } from '../types';
import { ClashButton } from './ClashButton';
import { X, Clock, Zap, Target, Edit3 } from 'lucide-react';

interface SystemSettingsProps {
  taskTypes: TaskTypeConfig[];
  timeWindows: TimeWindow[];
  onClose: () => void;
  onUpdateTaskType: (id: string, updates: Partial<TaskTypeConfig>) => void;
  onUpdateTimeWindow: (id: string, updates: Partial<TimeWindow>) => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  taskTypes,
  timeWindows,
  onClose,
  onUpdateTaskType,
  onUpdateTimeWindow
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'windows'>('windows');

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col pt-12 rounded-t-[32px] overflow-hidden shadow-2xl border-t-4 border-slate-700"
    >
      <div className="absolute top-4 right-4">
        <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700 transition-colors">
            <X size={24} />
        </button>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-3xl font-black text-white italic">系统引擎配置</h2>
        <p className="text-slate-400 text-sm font-medium mt-1">定制你的行为成瘾模型</p>
      </div>

      {/* Tabs */}
      <div className="flex px-6 gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('windows')}
            className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all
              ${activeTab === 'windows' ? 'bg-yellow-500 text-slate-900 shadow-lg scale-105' : 'bg-slate-800 text-slate-400'}`}
          >
            时段规则 (技能)
          </button>
          <button 
            onClick={() => setActiveTab('types')}
            className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all
              ${activeTab === 'types' ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-slate-800 text-slate-400'}`}
          >
            行为类型 (兵种)
          </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-4">
          {activeTab === 'windows' && (
              <div className="space-y-4">
                  {timeWindows.map(window => (
                      <div key={window.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 relative overflow-hidden group">
                          {/* Visual Indicator of Theme */}
                          <div className={`absolute left-0 top-0 bottom-0 w-2 
                             ${window.theme === 'sunrise' ? 'bg-orange-400' : 
                               window.theme === 'day' ? 'bg-blue-400' :
                               window.theme === 'sunset' ? 'bg-purple-400' : 'bg-indigo-900'
                             }`} 
                          />
                          
                          <div className="flex justify-between items-start mb-2 pl-4">
                              <div>
                                  <h3 className="font-black text-white text-lg">{window.name}</h3>
                                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mt-1">
                                      <Clock size={12} />
                                      {window.startHour}:00 - {window.endHour}:00
                                  </div>
                              </div>
                              <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                                  <span className="text-yellow-400 font-black">x{window.multiplier}</span>
                              </div>
                          </div>

                          <p className="pl-4 text-slate-500 text-sm font-medium mb-4">{window.description}</p>

                          {/* Simplified Editors (Sliders for MVP) */}
                          <div className="pl-4 space-y-3">
                              <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-500 flex justify-between">
                                      <span>奖励倍率</span>
                                      <span className="text-white">{window.multiplier}x</span>
                                  </label>
                                  <input 
                                    type="range" 
                                    min="0.5" max="5.0" step="0.1"
                                    value={window.multiplier}
                                    onChange={(e) => onUpdateTimeWindow(window.id, { multiplier: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
                                  />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'types' && (
              <div className="space-y-4">
                  {taskTypes.map(type => (
                      <div key={type.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 pl-4">
                          <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm
                                      ${type.colorTheme === 'blue' ? 'bg-blue-600' : 
                                        type.colorTheme === 'red' ? 'bg-red-600' : 
                                        type.colorTheme === 'green' ? 'bg-green-600' : 
                                        type.colorTheme === 'purple' ? 'bg-purple-600' : 'bg-orange-600'}`}
                                  >
                                      {type.name[0]}
                                  </div>
                                  <div>
                                      <h3 className="font-black text-white">{type.name}</h3>
                                      <span className="text-slate-500 text-xs font-bold uppercase">默认耗时: {Math.floor(type.defaultTimeSeconds / 60)}m</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                               <label className="text-[10px] uppercase font-bold text-slate-500 flex justify-between">
                                      <span>基础收益</span>
                                      <span className="text-white">x{type.baseMultiplier}</span>
                               </label>
                               <input 
                                    type="range" 
                                    min="0.5" max="3.0" step="0.1"
                                    value={type.baseMultiplier}
                                    onChange={(e) => onUpdateTaskType(type.id, { baseMultiplier: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                               />
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
      
      <div className="p-6 bg-slate-900 border-t border-slate-800">
          <ClashButton onClick={onClose} className="w-full">
              保存配置
          </ClashButton>
      </div>
    </motion.div>
  );
};