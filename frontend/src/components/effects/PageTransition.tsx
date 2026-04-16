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
  const accentMap: Record<TransitionType, string> = {
    fade: 'rgba(122, 107, 145, 0.18)',
    portal: 'rgba(184, 149, 110, 0.22)',
    mist: 'rgba(100, 115, 164, 0.18)',
    runes: 'rgba(170, 150, 94, 0.18)',
  };
  const symbolMap: Record<TransitionType, string> = {
    fade: '✦',
    portal: '◌',
    mist: '☾',
    runes: 'ᚠ',
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration * 0.22 }}
        >
          <motion.div 
            className="absolute inset-0 bg-dark-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration * 0.28 }}
          />

          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration * 0.5 }}
            style={{
              background: `radial-gradient(circle at center, ${accentMap[type]} 0%, transparent 48%)`,
            }}
          />

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: [0, 0.8, 0], y: [10, 0, -6], scale: [0.96, 1, 1.04] }}
            transition={{ duration: transitionDuration * 0.75, times: [0, 0.35, 1], ease: 'easeOut' }}
          >
            <div
              className="rounded-full border border-white/10"
              style={{
                width: type === 'portal' ? 180 : 140,
                height: type === 'portal' ? 180 : 140,
                boxShadow: `0 0 36px ${accentMap[type]}`,
              }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center text-gold-300/70"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 0], y: [8, 0, -4] }}
            transition={{ duration: transitionDuration * 0.62, times: [0, 0.3, 1] }}
          >
            <span className={`font-mystic ${type === 'runes' ? 'text-5xl' : 'text-4xl'}`}>
              {type === 'runes' && showRunes ? 'ᚠ ᚢ ᚱ' : symbolMap[type]}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageTransition;
