import React from 'react';
import { motion } from 'framer-motion';
import { Task, TaskType } from '../types';
import { Clock, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getCardStyle = () => {
    switch (task.type) {
      case TaskType.EMERGENCY:
        return 'bg-gradient-to-br from-red-100 to-red-50 border-red-400';
      case TaskType.RECOVERY:
        return 'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-400';
      case TaskType.LIMITED:
        return 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-400';
      default:
        return 'bg-white border-slate-300';
    }
  };

  const getIcon = () => {
    switch (task.type) {
      case TaskType.EMERGENCY: return <AlertTriangle className="text-red-500" size={20} />;
      case TaskType.RECOVERY: return <RefreshCw className="text-purple-500" size={20} />;
      case TaskType.LIMITED: return <Clock className="text-orange-500" size={20} />;
      default: return <Zap className="text-blue-500" size={20} />;
    }
  };

  return (
    <motion.div
      layoutId={task.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(task)}
      className={`
        relative p-3 rounded-2xl border-b-4 border-2 shadow-sm cursor-pointer
        flex flex-row items-center gap-3 overflow-hidden
        ${getCardStyle()}
      `}
    >
      {/* Rarity/Type Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10" />

      {/* Icon Badge */}
      <div className="bg-white p-2 rounded-xl border-2 border-slate-200 shadow-sm z-10">
        {getIcon()}
      </div>

      <div className="flex-1 z-10">
        <h3 className="font-bold text-slate-800 leading-tight">{task.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md">
            Lv. {task.difficulty}
          </span>
          <span className="text-xs font-bold text-blue-600">
            +{task.baseReward.wpDelta} WP
          </span>
        </div>
      </div>

      {task.timeLimitSeconds && (
        <div className="absolute right-2 top-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </div>
      )}
    </motion.div>
  );
};