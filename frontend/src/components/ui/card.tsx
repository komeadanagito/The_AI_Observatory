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
    default: 'luxury-panel border-ethereal',
    glow: 'luxury-panel shadow-mystic border-ethereal',
    bordered: 'luxury-panel-soft brass-hairline',
    parchment: 'bg-[linear-gradient(180deg,rgba(34,27,20,0.50),rgba(19,17,14,0.66))] backdrop-blur-sm border-ethereal texture-parchment',
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
        ${hover ? 'shadow-mystic-hover cursor-pointer transition-shadow duration-400 card-hover' : ''}
        ${className}
      `}
      style={organicStyle}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
