'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShuffleAnimationProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 动画完成回调 */
  onComplete: () => void;
  /** 跳过动画回调 */
  onSkip: () => void;
  /** 动画持续时间（毫秒），默认 4000 */
  duration?: number;
  /** 是否允许跳过 */
  canSkip?: boolean;
}

interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// 动画阶段
type AnimationPhase = 'scatter' | 'swirl' | 'gather' | 'stack' | 'cut' | 'complete';

/**
 * 洗牌动画组件
 * 实现沉浸式的洗牌效果：散开 → 漩涡 → 汇聚 → 堆叠 → 切牌
 */
export function ShuffleAnimation({
  isPlaying,
  onComplete,
  onSkip,
  duration = 4000,
  canSkip = true,
}: ShuffleAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>('scatter');
  const [progress, setProgress] = useState(0);
  const cardCount = 15; // 显示的卡牌数量

  // 生成初始卡牌位置
  const generateCardPositions = useCallback((phase: AnimationPhase): CardPosition[] => {
    const positions: CardPosition[] = [];
    
    for (let i = 0; i < cardCount; i++) {
      switch (phase) {
        case 'scatter':
          // 散开漂浮
          positions.push({
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 360 - 180,
            scale: 0.6 + Math.random() * 0.3,
          });
          break;
        case 'swirl':
          // 漩涡旋转
          const angle = (i / cardCount) * Math.PI * 2 + progress * Math.PI * 4;
          const radius = 80 + Math.sin(progress * Math.PI * 2) * 40;
          positions.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            rotation: angle * 57.3 + progress * 720, // 转换为度数
            scale: 0.7,
          });
          break;
        case 'gather':
          // 汇聚到中心
          positions.push({
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 30,
            rotation: Math.random() * 20 - 10,
            scale: 0.8,
          });
          break;
        case 'stack':
          // 堆叠
          positions.push({
            x: i * 0.5 - cardCount * 0.25,
            y: i * -0.3,
            rotation: Math.random() * 2 - 1,
            scale: 0.9,
          });
          break;
        case 'cut':
          // 切牌
          const isTopHalf = i >= cardCount / 2;
          positions.push({
            x: isTopHalf ? 40 : -40,
            y: (i % (cardCount / 2)) * -0.5,
            rotation: isTopHalf ? 3 : -3,
            scale: 0.9,
          });
          break;
        default:
          positions.push({ x: 0, y: 0, rotation: 0, scale: 0.9 });
      }
    }
    
    return positions;
  }, [progress]);

  // 动画计时器
  useEffect(() => {
    if (!isPlaying) return;

    const phasesDuration = {
      scatter: duration * 0.2,
      swirl: duration * 0.35,
      gather: duration * 0.15,
      stack: duration * 0.15,
      cut: duration * 0.15,
    };

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 50;
      setProgress(elapsed / duration);

      // 判断当前阶段
      let accumulated = 0;
      for (const [phaseName, phaseDuration] of Object.entries(phasesDuration)) {
        accumulated += phaseDuration;
        if (elapsed < accumulated) {
          setPhase(phaseName as AnimationPhase);
          break;
        }
      }

      if (elapsed >= duration) {
        setPhase('complete');
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, duration, onComplete]);

  const cardPositions = generateCardPositions(phase);

  if (!isPlaying) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/95 backdrop-blur-md">
      {/* 背景光效 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 卡牌动画区域 */}
      <div className="relative w-80 h-52">
        <AnimatePresence>
          {cardPositions.map((pos, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 w-24 h-36 -ml-12 -mt-18"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                x: pos.x,
                y: pos.y,
                rotate: pos.rotation,
                scale: pos.scale,
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.02,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
            >
              {/* 卡牌背面 */}
              <div 
                className="w-full h-full rounded-lg overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #312e81 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)',
                }}
              >
                {/* 装饰边框 */}
                <div className="absolute inset-1 border border-gold-500/30 rounded-md" />
                <div className="absolute inset-2 border border-gold-500/20 rounded" />
                
                {/* 中心图案 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl opacity-60">🔮</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 提示文字 */}
      <motion.div
        className="absolute bottom-32 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-lg text-primary-300 font-mystic mb-2">
          {phase === 'scatter' && '卡牌散开...'}
          {phase === 'swirl' && '命运的漩涡...'}
          {phase === 'gather' && '能量汇聚...'}
          {phase === 'stack' && '牌组整理...'}
          {phase === 'cut' && '切牌完成'}
          {phase === 'complete' && '请选择你的牌'}
        </p>
        <p className="text-sm text-gray-500">
          专注于你的问题，让直觉指引你
        </p>
      </motion.div>

      {/* 进度条 */}
      <div className="absolute bottom-20 w-64">
        <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-mystic-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* 跳过按钮 */}
      {canSkip && (
        <motion.button
          className="absolute bottom-8 text-gray-500 hover:text-white text-sm transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onSkip}
        >
          跳过动画 →
        </motion.button>
      )}
    </div>
  );
}

export default ShuffleAnimation;
