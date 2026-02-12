'use client';

import { ReactNode, useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { organicBorderRadius, randomDelay } from '@/lib/organic-utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'bordered' | 'parchment';
  hover?: boolean;
  /** 用于生成有机圆角的索引，不传则使用默认圆角 */
  organicIndex?: number;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  organicIndex,
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-dark-800/40 backdrop-blur-sm border-ethereal texture-parchment',
    glow: 'bg-dark-800/40 backdrop-blur-sm shadow-mystic glow-breathe border-ethereal',
    bordered: 'bg-dark-800/30 backdrop-blur-sm border-brass',
    parchment: 'bg-gradient-to-br from-parchment-300/5 to-parchment-400/3 backdrop-blur-sm border-ethereal texture-parchment',
  };

  // 生成有机样式
  const organicStyle = useMemo(() => {
    if (organicIndex === undefined) return {};
    return {
      borderRadius: organicBorderRadius(organicIndex, 14, 5),
      animationDelay: `${randomDelay(organicIndex, 0.15)}s`,
    };
  }, [organicIndex]);

  return (
    <motion.div
      className={`
        rounded-organic p-6
        ${variants[variant]}
        ${hover ? 'shadow-mystic-hover cursor-pointer transition-shadow duration-400' : ''}
        ${className}
      `}
      style={organicStyle}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
