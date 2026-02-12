'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface CardRevealParticlesProps {
  /** 是否激活粒子效果 */
  active: boolean;
  /** 粒子容器宽度 */
  width: number;
  /** 粒子容器高度 */
  height: number;
  /** 粒子颜色模式：正位为紫色，逆位为金色 */
  variant?: 'normal' | 'reversed';
  /** 粒子数量 */
  particleCount?: number;
}

/**
 * 翻牌粒子爆发效果组件
 */
export function CardRevealParticles({
  active,
  width,
  height,
  variant = 'normal',
  particleCount = 30,
}: CardRevealParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // 粒子颜色配置
  const colors = variant === 'normal'
    ? ['#a78bfa', '#c084fc', '#8b5cf6', '#6366f1', '#ffffff']
    : ['#fbbf24', '#f59e0b', '#fcd34d', '#d97706', '#ffffff'];

  // 创建粒子
  const createParticles = useCallback(() => {
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = Math.random() * 4 + 2;
      const life = Math.random() * 30 + 30;

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
      });
    }

    particlesRef.current = particles;
  }, [width, height, particleCount, colors]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制粒子
    let hasActiveParticles = false;
    particlesRef.current.forEach(particle => {
      if (particle.life <= 0) return;

      hasActiveParticles = true;

      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // 重力
      particle.life -= 1;

      // 计算透明度
      const alpha = particle.life / particle.maxLife;

      // 绘制粒子光晕
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 绘制粒子核心
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.globalAlpha = 1;
    });

    if (hasActiveParticles) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // 当激活时启动效果
  useEffect(() => {
    if (active) {
      createParticles();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, createParticles, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}

/**
 * 简化版的翻牌光效组件（CSS 实现）
 */
export function CardRevealGlow({
  active,
  variant = 'normal',
}: {
  active: boolean;
  variant?: 'normal' | 'reversed';
}) {
  const glowColor = variant === 'normal'
    ? 'rgba(139, 92, 246, 0.6)'
    : 'rgba(251, 191, 36, 0.6)';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default CardRevealParticles;
