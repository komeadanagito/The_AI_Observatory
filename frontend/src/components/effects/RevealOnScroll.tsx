'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

type RevealEffect = 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'blur';

interface RevealOnScrollProps {
  children: ReactNode;
  /** 入场效果类型 */
  effect?: RevealEffect;
  /** 动画持续时间（秒） */
  duration?: number;
  /** 动画延迟（秒） */
  delay?: number;
  /** 触发阈值（0-1，元素可见比例） */
  threshold?: number;
  /** 是否只触发一次 */
  once?: boolean;
  /** 额外类名 */
  className?: string;
}

// 预定义动画变体
const effectVariants: Record<RevealEffect, Variants> = {
  fadeUp: {
    hidden: { 
      opacity: 0, 
      y: 30,
      filter: 'blur(4px)',
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
    },
  },
  fadeIn: {
    hidden: { 
      opacity: 0,
      filter: 'blur(2px)',
    },
    visible: { 
      opacity: 1,
      filter: 'blur(0px)',
    },
  },
  scaleIn: {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      filter: 'blur(4px)',
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
    },
  },
  slideLeft: {
    hidden: { 
      opacity: 0, 
      x: 40,
    },
    visible: { 
      opacity: 1, 
      x: 0,
    },
  },
  slideRight: {
    hidden: { 
      opacity: 0, 
      x: -40,
    },
    visible: { 
      opacity: 1, 
      x: 0,
    },
  },
  blur: {
    hidden: { 
      opacity: 0,
      filter: 'blur(12px)',
    },
    visible: { 
      opacity: 1,
      filter: 'blur(0px)',
    },
  },
};

/**
 * 滚动入场动画组件
 * 当元素进入视口时触发动画
 */
export function RevealOnScroll({
  children,
  effect = 'fadeUp',
  duration = 0.6,
  delay = 0,
  threshold = 0.2,
  once = true,
  className = '',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once,
    amount: threshold,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={effectVariants[effect]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // 自定义缓动
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 子元素依次入场组件
 */
interface StaggeredRevealProps {
  children: ReactNode[];
  /** 入场效果类型 */
  effect?: RevealEffect;
  /** 单个元素动画持续时间（秒） */
  duration?: number;
  /** 元素之间的间隔时间（秒） */
  staggerDelay?: number;
  /** 初始延迟（秒） */
  initialDelay?: number;
  /** 触发阈值 */
  threshold?: number;
  /** 是否只触发一次 */
  once?: boolean;
  /** 容器类名 */
  className?: string;
  /** 子元素包装器类名 */
  itemClassName?: string;
}

export function StaggeredReveal({
  children,
  effect = 'fadeUp',
  duration = 0.5,
  staggerDelay = 0.1,
  initialDelay = 0,
  threshold = 0.1,
  once = true,
  className = '',
  itemClassName = '',
}: StaggeredRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once,
    amount: threshold,
  });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children) && children.map((child, index) => (
        <motion.div
          key={index}
          variants={effectVariants[effect]}
          transition={{
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * 文本逐行显示组件
 */
interface TextRevealProps {
  text: string;
  /** 是否按段落分割（双换行） */
  byParagraph?: boolean;
  /** 单行动画持续时间 */
  duration?: number;
  /** 行之间的间隔 */
  staggerDelay?: number;
  /** 触发阈值 */
  threshold?: number;
  /** 文本类名 */
  className?: string;
  /** 是否只触发一次 */
  once?: boolean;
}

export function TextReveal({
  text,
  byParagraph = false,
  duration = 0.4,
  staggerDelay = 0.08,
  threshold = 0.2,
  className = '',
  once = true,
}: TextRevealProps) {
  const lines = byParagraph 
    ? text.split(/\n\n+/).filter(Boolean)
    : text.split(/\n/).filter(Boolean);

  return (
    <StaggeredReveal
      effect="fadeUp"
      duration={duration}
      staggerDelay={staggerDelay}
      threshold={threshold}
      once={once}
      className={className}
      itemClassName={byParagraph ? 'mb-4' : 'mb-1'}
    >
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </StaggeredReveal>
  );
}

export default RevealOnScroll;
