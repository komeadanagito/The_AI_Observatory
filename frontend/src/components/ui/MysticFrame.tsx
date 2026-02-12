'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MysticFrameProps {
  children: ReactNode;
  /** 边框样式变体 */
  variant?: 'simple' | 'ornate' | 'cosmic';
  /** 是否显示角落装饰 */
  showCorners?: boolean;
  /** 是否有动画光效 */
  animated?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 神秘装饰边框组件
 * 为内容添加神秘风格的装饰边框（做旧复古版）
 */
export function MysticFrame({
  children,
  variant = 'simple',
  showCorners = true,
  animated = true,
  className = '',
}: MysticFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* 外层柔和发光效果 */}
      {animated && (
        <motion.div
          className="absolute -inset-1 rounded-organic bg-gradient-to-r from-primary-500/10 via-gold-500/8 to-primary-500/10"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'blur(12px)' }}
        />
      )}

      {/* 主边框 - 使用渐隐效果 */}
      <div
        className={`
          relative rounded-organic overflow-hidden texture-parchment
          ${variant === 'simple' ? 'border-ethereal' : ''}
          ${variant === 'ornate' ? 'border-brass-antique patina metal-shine' : ''}
          ${variant === 'cosmic' ? 'border-ethereal' : ''}
          bg-dark-900/60 backdrop-blur-sm
        `}
      >
        {/* 内边框装饰 - 做旧效果 */}
        {variant === 'ornate' && (
          <div className="absolute inset-3 border border-gold-600/15 rounded-organic-sm pointer-events-none gold-shimmer" />
        )}

        {/* 角落装饰 */}
        {showCorners && (
          <>
            <CornerDecoration position="top-left" variant={variant} animated={animated} />
            <CornerDecoration position="top-right" variant={variant} animated={animated} />
            <CornerDecoration position="bottom-left" variant={variant} animated={animated} />
            <CornerDecoration position="bottom-right" variant={variant} animated={animated} />
          </>
        )}

        {/* 内容 */}
        <div className="relative z-10 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 角落装饰组件 - 做旧复古版
 */
function CornerDecoration({
  position,
  variant,
  animated = false,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  variant: 'simple' | 'ornate' | 'cosmic';
  animated?: boolean;
}) {
  const positionClasses = {
    'top-left': 'top-1 left-1',
    'top-right': 'top-1 right-1 rotate-90',
    'bottom-left': 'bottom-1 left-1 -rotate-90',
    'bottom-right': 'bottom-1 right-1 rotate-180',
  };

  const color = variant === 'ornate' ? 'text-gold-600/40' : 'text-primary-400/25';

  return (
    <motion.div 
      className={`absolute ${positionClasses[position]} w-5 h-5 ${color} pointer-events-none ${animated ? 'rotate-slow' : ''}`}
      style={{ animationDuration: '120s' }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        {variant === 'cosmic' ? (
          // 简化的星形装饰
          <path d="M12 3L13.5 9L20 9L15 13L17 20L12 16L7 20L9 13L4 9L10.5 9L12 3Z" opacity="0.8" />
        ) : variant === 'ornate' ? (
          // 卷曲边角
          <path d="M2 2 C2 12, 12 22, 22 22 L22 18 C14 18, 6 10, 6 2 Z" />
        ) : (
          // 简约 L 形边角
          <path d="M0 0 L20 0 L20 3 L3 3 L3 20 L0 20 Z" opacity="0.6" />
        )}
      </svg>
    </motion.div>
  );
}

/**
 * 神秘分割线组件 - 做旧复古版
 */
interface MysticDividerProps {
  /** 分割线样式 */
  variant?: 'simple' | 'stars' | 'moons';
  /** 额外类名 */
  className?: string;
}

export function MysticDivider({
  variant = 'simple',
  className = '',
}: MysticDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 py-4 ${className}`}>
      {/* 左侧线条 - 渐隐效果 */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-600/30 to-gold-500/20" />

      {/* 中间装饰 - 带动画 */}
      <div className="flex items-center gap-2 text-gold-500/50">
        {variant === 'simple' && (
          <motion.span 
            className="text-lg symbol-pulse"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✧
          </motion.span>
        )}
        {variant === 'stars' && (
          <>
            <motion.span 
              className="text-xs"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
            >
              ✦
            </motion.span>
            <motion.span 
              className="text-base"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
            >
              ⋆
            </motion.span>
            <motion.span 
              className="text-xs"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
            >
              ✦
            </motion.span>
          </>
        )}
        {variant === 'moons' && (
          <>
            <motion.span 
              className="text-xs"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ☽
            </motion.span>
            <motion.span 
              className="text-sm"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.3 }}
            >
              ◯
            </motion.span>
            <motion.span 
              className="text-xs"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.6 }}
            >
              ☾
            </motion.span>
          </>
        )}
      </div>

      {/* 右侧线条 - 渐隐效果 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold-600/30 to-gold-500/20" />
    </div>
  );
}

/**
 * 月相装饰组件
 */
export function MoonPhases({ className = '' }: { className?: string }) {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      {phases.map((moon, index) => (
        <motion.span
          key={index}
          className="text-xl opacity-60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {moon}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * 星座符号装饰组件
 */
export function ZodiacSymbols({ className = '' }: { className?: string }) {
  const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  return (
    <div className={`flex flex-wrap justify-center items-center gap-3 ${className}`}>
      {symbols.map((symbol, index) => (
        <motion.span
          key={index}
          className="text-lg text-primary-400/40 hover:text-primary-400 transition-colors cursor-default"
          whileHover={{ scale: 1.2, rotate: 10 }}
        >
          {symbol}
        </motion.span>
      ))}
    </div>
  );
}

export default MysticFrame;
