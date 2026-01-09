import React from 'react';
import { motion } from 'framer-motion';

interface ClashButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  size?: 'normal' | 'large';
}

export const ClashButton: React.FC<ClashButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  size = 'normal'
}) => {
  const getColors = () => {
    if (disabled) return 'bg-gray-600 border-gray-800 shadow-[0_6px_0_rgb(31,41,55)] text-gray-400';
    
    switch (variant) {
      case 'primary': // Addictive Orange/Gold Gradient
        return 'bg-gradient-to-b from-yellow-400 to-orange-500 border-orange-700 shadow-[0_6px_0_rgb(194,65,12)] text-white text-shadow-sm';
      case 'secondary': // Blue Gradient
        return 'bg-gradient-to-b from-blue-400 to-blue-600 border-blue-800 shadow-[0_6px_0_rgb(30,58,138)] text-white';
      case 'danger': // Red Gradient
        return 'bg-gradient-to-b from-red-400 to-red-600 border-red-800 shadow-[0_6px_0_rgb(153,27,27)] text-white';
      case 'success': // Green Gradient
        return 'bg-gradient-to-b from-green-400 to-green-600 border-green-800 shadow-[0_6px_0_rgb(22,101,52)] text-white';
      default:
        return 'bg-gray-200 border-gray-400 shadow-[0_6px_0_rgb(156,163,175)] text-gray-800';
    }
  };

  const isLarge = size === 'large';

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95, y: 6, boxShadow: "0 0px 0 0 transparent" } : {}}
      animate={variant === 'primary' && !disabled ? { scale: [1, 1.02, 1] } : {}}
      transition={variant === 'primary' && !disabled ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative overflow-hidden
        ${isLarge ? 'h-20 text-2xl rounded-[24px]' : 'h-14 text-lg rounded-2xl'}
        font-black uppercase tracking-wider border-b-4 border-r-2 border-l-2 border-t-2
        flex items-center justify-center gap-2 select-none
        ${getColors()} ${className}
      `}
      style={{ fontFamily: 'sans-serif' }}
    >
      {/* Gloss effect */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-[20px] pointer-events-none" />
      {children}
    </motion.button>
  );
};