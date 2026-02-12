'use client';

import { motion } from 'framer-motion';

interface DividerProps {
  /** 分割线样式 */
  variant?: 'line' | 'gradient' | 'dots' | 'mystic';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 颜色主题 */
  color?: 'primary' | 'gold' | 'mystic';
  /** 是否有动画 */
  animated?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 通用分割线组件
 */
export function Divider({
  variant = 'line',
  size = 'md',
  color = 'primary',
  animated = false,
  className = '',
}: DividerProps) {
  const sizeClasses = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-8',
  };

  const colorClasses = {
    primary: 'border-primary-500/30',
    gold: 'border-gold-500/30',
    mystic: 'border-mystic-500/30',
  };

  const gradientColors = {
    primary: 'from-transparent via-primary-500/50 to-transparent',
    gold: 'from-transparent via-gold-500/50 to-transparent',
    mystic: 'from-transparent via-mystic-500/50 to-transparent',
  };

  if (variant === 'line') {
    return (
      <hr className={`border-0 border-t ${colorClasses[color]} ${sizeClasses[size]} ${className}`} />
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className={`h-px bg-gradient-to-r ${gradientColors[color]}`} />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex justify-center items-center gap-2 ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-${color}-500/50`}
            initial={animated ? { scale: 0 } : undefined}
            animate={animated ? { scale: 1 } : undefined}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
    );
  }

  // variant === 'mystic'
  return (
    <div className={`flex items-center justify-center gap-4 ${sizeClasses[size]} ${className} group`}>
      {/* 左侧装饰线 - 渐变 */}
      <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${color}-600/20 to-${color}-500/40`} />
      
      {/* 中间神秘符号 - 浮动 + 悬浮发光 */}
      <motion.div
        className={`text-${color}-400/60 transition-all duration-300 group-hover:text-${color}-400 group-hover:drop-shadow-[0_0_8px_currentColor]`}
        animate={animated ? { 
          y: [0, -3, 0],
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        } : undefined}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" />
        </svg>
      </motion.div>

      {/* 右侧装饰线 - 渐变 */}
      <div className={`flex-1 h-px bg-gradient-to-l from-transparent via-${color}-600/20 to-${color}-500/40`} />
    </div>
  );
}

/**
 * 装饰性标题分割线
 */
interface TitleDividerProps {
  title: string;
  /** 额外类名 */
  className?: string;
}

export function TitleDivider({ title, className = '' }: TitleDividerProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-primary-500/50" />
      <span className="text-primary-400 text-sm font-medium tracking-wider uppercase">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary-500/30 to-primary-500/50" />
    </div>
  );
}

export default Divider;
