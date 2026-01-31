import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskTypeConfig, TimeWindow } from '../types';
import { ClashButton } from './ClashButton';
import { X, Clock, Zap, Target, Edit3, Shield, Activity, Bell, Plus, Trash2, List } from 'lucide-react';

interface SystemSettingsProps {
  taskTypes: TaskTypeConfig[];
  timeWindows: TimeWindow[];
  onClose: () => void;
  onUpdateTaskType: (id: string, updates: Partial<TaskTypeConfig>) => void;
  onUpdateTimeWindow: (id: string, updates: Partial<TimeWindow>) => void;
  onAddTaskType: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  taskTypes,
  timeWindows,
  onClose,
  onUpdateTaskType,
  onUpdateTimeWindow,
  onAddTaskType
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'windows'>('windows');
  
  // Local state for inputting new task titles
  const [newTaskTitleInput, setNewTaskTitleInput] = useState<{ [key: string]: string }>({});

  // Helper to toggle a task type ID in a time window's allowed list
  const toggleTaskInWindow = (windowId: string, taskTypeId: string) => {
    const window = timeWindows.find(w => w.id === windowId);
    if (!window) return;
    
    const currentTypes = window.allowedTypes || [];
    const isIncluded = currentTypes.includes(taskTypeId);
    
    let newTypes;
    if (isIncluded) {
      newTypes = currentTypes.filter(id => id !== taskTypeId);
      // Prevent removing all types (Spec 6.2 constraint implicit)
      if (newTypes.length === 0) return; 
    } else {
      newTypes = [...currentTypes, taskTypeId];
    }
    
    onUpdateTimeWindow(windowId, { allowedTypes: newTypes });
  };

  const handleAddTaskTitle = (typeId: string) => {
      const title = newTaskTitleInput[typeId]?.trim();
      if (!title) return;
      
      const type = taskTypes.find(t => t.id === typeId);
      if (!type) return;

      const currentTitles = type.taskTitles || [];
      onUpdateTaskType(typeId, { taskTitles: [...currentTitles, title] });
      setNewTaskTitleInput({ ...newTaskTitleInput, [typeId]: '' });
  };

  const handleDeleteTaskTitle = (typeId: string, titleIndex: number) => {
      const type = taskTypes.find(t => t.id === typeId);
      if (!type || !type.taskTitles) return;
      
      const newTitles = [...type.taskTitles];
      newTitles.splice(titleIndex, 1);
      onUpdateTaskType(typeId, { taskTitles: newTitles });
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-slate-950 z-50 flex flex-col pt-4 rounded-t-[32px] overflow-hidden shadow-2xl border-t-4 border-slate-700 font-sans"
    >
      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-white hover:bg-slate-700 transition-colors border border-slate-600">
            <X size={24} />
        </button>
      </div>

      <div className="px-6 pb-4 border-b border-slate-800 bg-slate-900">
        <h2 className="text-3xl font-black text-white italic">系统配置</h2>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setActiveTab('windows')}
            className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2
              ${activeTab === 'windows' ? 'bg-yellow-500 text-slate-900 border-yellow-400 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
          >
            时段规则
          </button>
          <button 
            onClick={() => setActiveTab('types')}
            className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all border-2
              ${activeTab === 'types' ? 'bg-blue-500 text-white border-blue-400 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
          >
            行为模板
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-slate-950">
          
          {/* --- TIME WINDOW EDITOR (Spec 6.2) --- */}
          {activeTab === 'windows' && (
              <div className="space-y-8">
                  {timeWindows.map(window => (
                      <div key={window.id} className="bg-slate-900 rounded-3xl p-5 border border-slate-700 relative shadow-xl">
                          {/* Header */}
                          <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-12 rounded-full ${window.theme === 'sunrise' ? 'bg-orange-500' : window.theme === 'day' ? 'bg-blue-500' : window.theme === 'sunset' ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                                <div>
                                    <h3 className="font-black text-xl text-white tracking-wide">{window.name}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase">{window.description}</p>
                                </div>
                              </div>
                              <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-600 flex flex-col items-center">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">倍率</span>
                                  <span className="text-yellow-400 font-black text-lg">x{window.multiplier}</span>
                              </div>
                          </div>

                          {/* 1. Time Timeline */}
                          <div className="mb-6">
                              <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                  <Clock size={12} /> 生效时段 (0-24h)
                              </label>
                              <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-xl border border-slate-700">
                                  <input 
                                      type="number" min="0" max="23"
                                      value={window.startHour}
                                      onChange={(e) => onUpdateTimeWindow(window.id, { startHour: parseInt(e.target.value) })}
                                      className="bg-slate-900 text-white font-mono font-bold text-center w-16 p-2 rounded-lg border border-slate-600 focus:border-yellow-500 outline-none"
                                  />
                                  <span className="text-slate-500 font-black">TO</span>
                                  <input 
                                      type="number" min="0" max="23"
                                      value={window.endHour}
                                      onChange={(e) => onUpdateTimeWindow(window.id, { endHour: parseInt(e.target.value) })}
                                      className="bg-slate-900 text-white font-mono font-bold text-center w-16 p-2 rounded-lg border border-slate-600 focus:border-yellow-500 outline-none"
                                  />
                              </div>
                          </div>

                          {/* 2. Multiplier & Notification Intensity */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">奖励倍率</label>
                                  <input 
                                    type="range" min="0.5" max="3.0" step="0.1"
                                    value={window.multiplier}
                                    onChange={(e) => onUpdateTimeWindow(window.id, { multiplier: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                      <Bell size={12} /> 通知强度
                                  </label>
                                  <select 
                                      value={window.notificationIntensity || 'medium'}
                                      onChange={(e) => onUpdateTimeWindow(window.id, { notificationIntensity: e.target.value as any })}
                                      className="w-full bg-slate-800 text-white text-sm font-bold p-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                                  >
                                      <option value="low">低 (弱震动)</option>
                                      <option value="medium">中 (标准)</option>
                                      <option value="high">高 (强震动)</option>
                                  </select>
                              </div>
                          </div>

                          {/* 3. Allowed Types (Checkboxes) */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">允许的任务类型</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {taskTypes.map(t => {
                                      const isChecked = window.allowedTypes.includes(t.id);
                                      return (
                                          <button
                                              key={t.id}
                                              onClick={() => toggleTaskInWindow(window.id, t.id)}
                                              className={`
                                                  flex items-center gap-2 p-2 rounded-lg border transition-all
                                                  ${isChecked ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}
                                              `}
                                          >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                                                  {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                                              </div>
                                              <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-500'}`}>{t.name}</span>
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* --- TASK TYPE EDITOR (Spec 6.1 + Custom Tasks) --- */}
          {activeTab === 'types' && (
              <div className="space-y-8">
                  {taskTypes.map(type => (
                      <div key={type.id} className="bg-slate-900 rounded-3xl p-5 border border-slate-700 relative shadow-xl">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-inner
                                    ${type.colorTheme === 'blue' ? 'bg-blue-600' : type.colorTheme === 'red' ? 'bg-red-600' : type.colorTheme === 'green' ? 'bg-green-600' : type.colorTheme === 'purple' ? 'bg-purple-600' : 'bg-orange-600'}`}
                                >
                                    {type.name[0]}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={type.name}
                                        onChange={(e) => onUpdateTaskType(type.id, { name: e.target.value })}
                                        className="bg-transparent text-xl font-black text-white w-full outline-none border-b border-dashed border-slate-600 focus:border-blue-500 pb-1"
                                    />
                                    <p className="text-xs text-slate-500 font-bold mt-1">ID: {type.id}</p>
                                </div>
                          </div>
                          
                          {/* 1. Multiplier & Strategy */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                               <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">基础倍率</label>
                                  <input 
                                      type="range" min="0.5" max="3.0" step="0.1"
                                      value={type.baseMultiplier}
                                      onChange={(e) => onUpdateTaskType(type.id, { baseMultiplier: parseFloat(e.target.value) })}
                                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                  />
                                  <div className="text-right text-xs font-black text-blue-400 mt-1">x{type.baseMultiplier}</div>
                               </div>
                               <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                      <Shield size={12} /> 失败策略
                                  </label>
                                  <select 
                                      value={type.failureStrategy || 'standard'}
                                      onChange={(e) => onUpdateTaskType(type.id, { failureStrategy: e.target.value as any })}
                                      className="w-full bg-slate-800 text-white text-sm font-bold p-2 rounded-lg border border-slate-600 focus:border-red-500 outline-none"
                                  >
                                      <option value="standard">标准 (Standard)</option>
                                      <option value="punishing">惩罚 (Punishing)</option>
                                  </select>
                               </div>
                          </div>

                          {/* 2. UI Intensity */}
                          <div className="mb-6">
                               <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                   <Activity size={12} /> UI 强度
                               </label>
                               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                    {['normal', 'strong'].map((intensity) => (
                                        <button
                                            key={intensity}
                                            onClick={() => onUpdateTaskType(type.id, { uiIntensity: intensity as any })}
                                            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all
                                                ${type.uiIntensity === intensity ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500'}
                                            `}
                                        >
                                            {intensity === 'normal' ? '普通' : '强反馈'}
                                        </button>
                                    ))}
                               </div>
                          </div>

                          {/* 3. Task Pool (Spec: Custom Task Names) */}
                          <div className="mb-6">
                              <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                   <List size={12} /> 任务池 (随机抽取)
                              </label>
                              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2">
                                  {/* List */}
                                  <div className="flex flex-wrap gap-2">
                                      {type.taskTitles && type.taskTitles.map((title, idx) => (
                                          <div key={idx} className="bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-600">
                                              <span className="text-sm text-white font-bold">{title}</span>
                                              <button onClick={() => handleDeleteTaskTitle(type.id, idx)} className="text-slate-400 hover:text-red-400">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                      ))}
                                      {(!type.taskTitles || type.taskTitles.length === 0) && (
                                          <span className="text-xs text-slate-500 italic p-1">暂无任务，将使用默认通用名称</span>
                                      )}
                                  </div>
                                  
                                  {/* Add Input */}
                                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                                      <input 
                                          type="text" 
                                          placeholder="输入新任务名称..." 
                                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                          value={newTaskTitleInput[type.id] || ''}
                                          onChange={(e) => setNewTaskTitleInput({ ...newTaskTitleInput, [type.id]: e.target.value })}
                                          onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleAddTaskTitle(type.id);
                                          }}
                                      />
                                      <button 
                                          onClick={() => handleAddTaskTitle(type.id)}
                                          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                                      >
                                          <Plus size={18} />
                                      </button>
                                  </div>
                              </div>
                          </div>

                          {/* 4. Suitable Time Windows (Checkboxes) */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">适配时段</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {timeWindows.map(window => {
                                      const isIncluded = window.allowedTypes.includes(type.id);
                                      return (
                                          <button
                                              key={window.id}
                                              onClick={() => toggleTaskInWindow(window.id, type.id)}
                                              className={`
                                                  flex items-center gap-2 p-2 rounded-lg border transition-all
                                                  ${isIncluded ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}
                                              `}
                                          >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isIncluded ? 'bg-yellow-500 border-yellow-500' : 'border-slate-500'}`}>
                                                  {isIncluded && <div className="w-2 h-2 bg-slate-900 rounded-sm" />}
                                              </div>
                                              <span className={`text-xs font-bold ${isIncluded ? 'text-white' : 'text-slate-500'}`}>{window.name}</span>
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  ))}

                  {/* Add New Type Button */}
                  <button 
                    onClick={onAddTaskType}
                    className="w-full py-5 border-2 border-dashed border-slate-700 rounded-3xl text-slate-500 font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-400 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Plus size={20} />
                    </div>
                    添加新行为模板
                  </button>
              </div>
          )}
      </div>
      
      <div className="p-6 bg-slate-900 border-t border-slate-800">
          <ClashButton onClick={onClose} className="w-full">
              保存并生效
          </ClashButton>
      </div>
    </motion.div>
  );
};