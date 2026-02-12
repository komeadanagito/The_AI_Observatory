'use client';

import { useRef, useEffect, useCallback } from 'react';

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  depth: number; // 0-1，用于模拟深度（近大远小）
}

interface DustParticlesProps {
  /** 粒子数量 */
  particleCount?: number;
  /** 粒子颜色 */
  color?: string;
  /** 最大粒子大小 */
  maxSize?: number;
  /** 运动速度系数 */
  speedFactor?: number;
  /** 是否启用 */
  enabled?: boolean;
  /** 目标帧率 */
  targetFps?: number;
  /** 额外类名 */
  className?: string;
}

/**
 * 漂浮尘埃粒子效果
 * 营造古老空间的氛围
 * 优化：降低帧率、简化渲染
 */
export function DustParticles({
  particleCount = 20,
  color = 'rgba(184, 149, 110, 0.4)',
  maxSize = 3,
  speedFactor = 0.3,
  enabled = true,
  targetFps = 20,
  className = '',
}: DustParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFps;

  // 初始化粒子
  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * maxSize + 0.5,
      speedX: (Math.random() - 0.5) * speedFactor,
      speedY: (Math.random() - 0.5) * speedFactor - 0.1, // 轻微向上飘
      opacity: Math.random() * 0.5 + 0.2,
      depth: Math.random(),
    }));
  }, [particleCount, maxSize, speedFactor]);

  // 绘制单个粒子（简化版，避免创建渐变）
  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: DustParticle
  ) => {
    const actualSize = particle.size * (0.5 + particle.depth * 0.5);
    const actualOpacity = particle.opacity * (0.3 + particle.depth * 0.7);
    
    // 简化渲染：直接绘制圆形，不使用渐变
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, actualSize, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(/[\d.]+\)$/, `${actualOpacity})`);
    ctx.fill();
  }, [color]);

  // 更新粒子位置
  const updateParticle = useCallback((
    particle: DustParticle,
    width: number,
    height: number
  ) => {
    // 缓慢移动
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    // 轻微的随机漂移
    particle.speedX += (Math.random() - 0.5) * 0.02;
    particle.speedY += (Math.random() - 0.5) * 0.02;
    
    // 限制速度
    particle.speedX = Math.max(-speedFactor, Math.min(speedFactor, particle.speedX));
    particle.speedY = Math.max(-speedFactor, Math.min(speedFactor, particle.speedY));
    
    // 边界处理 - 从另一侧重新进入
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = height + 10;
    if (particle.y > height + 10) particle.y = -10;
    
    // 轻微的透明度变化
    particle.opacity += (Math.random() - 0.5) * 0.01;
    particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
  }, [speedFactor]);

  // 动画循环（带帧率限制）
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    
    // 帧率限制
    const elapsed = time - lastTimeRef.current;
    if (elapsed < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTimeRef.current = time - (elapsed % frameInterval);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 更新和绘制粒子
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      updateParticle(particles[i], width, height);
      drawParticle(ctx, particles[i]);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, updateParticle, drawParticle, frameInterval]);

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);
  }, [initParticles]);

  useEffect(() => {
    if (!enabled) return;
    
    handleResize();
    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, handleResize, animate]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 1,
        mixBlendMode: 'screen',
        willChange: 'contents',
      }}
    />
  );
}

/**
 * 底部烟雾效果
 * 使用 CSS 实现的静态烟雾层
 */
export function MysticSmoke({
  enabled = true,
  className = '',
}: {
  enabled?: boolean;
  className?: string;
}) {
  if (!enabled) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 h-48 pointer-events-none ${className}`}
      style={{
        background: `
          linear-gradient(to top,
            rgba(26, 29, 36, 0.8) 0%,
            rgba(26, 29, 36, 0.4) 30%,
            rgba(56, 47, 69, 0.2) 60%,
            transparent 100%
          )
        `,
        zIndex: 2,
      }}
    >
      {/* 流动的烟雾层 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='smoke'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' seed='1'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='30'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23smoke)' fill='rgba(56, 47, 69, 0.1)'/%3E%3C/svg%3E")`,
          animation: 'smoke-drift 20s ease-in-out infinite',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export default DustParticles;
