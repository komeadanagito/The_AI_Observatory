'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type TransitionType = 'fade' | 'portal' | 'mist' | 'runes';

interface PageTransitionProps {
  /** 是否显示转场 */
  isActive: boolean;
  /** 转场类型 */
  type?: TransitionType;
  /** 转场持续时间（毫秒） */
  duration?: number;
  /** 转场完成回调 */
  onComplete?: () => void;
}

/**
 * 全屏页面转场组件
 * 提供多种神秘风格的转场动画
 */
export function PageTransition({
  isActive,
  type = 'fade',
  duration = 800,
  onComplete,
}: PageTransitionProps) {
  const [showRunes, setShowRunes] = useState(false);

  useEffect(() => {
    if (isActive && type === 'runes') {
      setShowRunes(true);
      const timer = setTimeout(() => setShowRunes(false), duration * 0.6);
      return () => clearTimeout(timer);
    }
  }, [isActive, type, duration]);

  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  const transitionDuration = duration / 1000;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration * 0.3 }}
        >
          {/* 基础遮罩 */}
          <motion.div 
            className="absolute inset-0 bg-dark-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration * 0.4 }}
          />

          {/* Fade 转场 - 简单渐隐 */}
          {type === 'fade' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transitionDuration }}
            />
          )}

          {/* Portal 转场 - 中心光点扩散 */}
          {type === 'portal' && (
            <>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 20, opacity: [0, 1, 1, 0] }}
                transition={{ 
                  duration: transitionDuration,
                  times: [0, 0.3, 0.7, 1],
                  ease: 'easeInOut'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(184, 149, 110, 0.8) 0%, rgba(122, 107, 145, 0.4) 40%, transparent 70%)',
                    boxShadow: '0 0 60px rgba(184, 149, 110, 0.5), 0 0 120px rgba(122, 107, 145, 0.3)',
                  }}
                />
              </motion.div>
              {/* 中心符号 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-6xl text-gold-400"
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1, 1.2, 2],
                  rotate: [0, 180, 360, 720]
                }}
                transition={{ 
                  duration: transitionDuration,
                  times: [0, 0.2, 0.6, 1]
                }}
              >
                ✧
              </motion.div>
            </>
          )}

          {/* Mist 转场 - 烟雾弥漫 */}
          {type === 'mist' && (
            <>
              {/* 多层烟雾 */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at ${50 + (i - 1) * 20}% ${50 + (i - 1) * 10}%, rgba(56, 47, 69, 0.8) 0%, transparent 60%)`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0, 0.8, 0.8, 0],
                    scale: [0.8, 1.2, 1.4, 1.6],
                    x: [0, (i - 1) * 50, (i - 1) * 100, (i - 1) * 150],
                  }}
                  transition={{ 
                    duration: transitionDuration,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                />
              ))}
              {/* 中心发光 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0.6, 0] }}
                transition={{ duration: transitionDuration }}
              >
                <div 
                  className="w-32 h-32 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(122, 107, 145, 0.4) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                />
              </motion.div>
            </>
          )}

          {/* Runes 转场 - 符文闪烁 */}
          {type === 'runes' && (
            <>
              <motion.div
                className="absolute inset-0 bg-dark-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              {/* 符文环 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 30, 60, 90]
                }}
                transition={{ duration: transitionDuration }}
              >
                <div className="relative w-64 h-64">
                  {['☽', '✦', '☾', '⋆', '✧', '◯'].map((rune, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-2xl text-gold-400/70"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 60}deg) translateY(-120px) rotate(-${i * 60}deg)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: showRunes ? [0, 1, 1, 0] : 0,
                        scale: showRunes ? [0, 1.2, 1, 0] : 0
                      }}
                      transition={{ 
                        duration: transitionDuration * 0.5,
                        delay: i * 0.05
                      }}
                    >
                      {rune}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
              {/* 中心爆发 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 3]
                }}
                transition={{ 
                  duration: transitionDuration * 0.6,
                  delay: transitionDuration * 0.4
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(184, 149, 110, 1) 0%, rgba(122, 107, 145, 0.5) 50%, transparent 70%)',
                  }}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageTransition;
