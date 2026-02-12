'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface StarfieldCanvasProps {
  /** 星星数量，默认 100 */
  starCount?: number;
  /** 流星出现概率（每帧），默认 0.0005 */
  shootingStarProbability?: number;
  /** 是否启用流星，默认 true */
  enableShootingStars?: boolean;
  /** 目标帧率，默认 24fps（背景动画不需要 60fps） */
  targetFps?: number;
  /** 类名 */
  className?: string;
}

/**
 * 动态星空背景组件
 * 使用 Canvas 实现星星闪烁和流星效果
 * 优化：降低帧率、简化渲染、使用 offscreen canvas 缓存
 */
export function StarfieldCanvas({
  starCount = 100,
  shootingStarProbability = 0.0005,
  enableShootingStars = true,
  targetFps = 24,
  className = '',
}: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFps;

  // 初始化星星
  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, [starCount]);

  // 创建流星
  const createShootingStar = useCallback((width: number, height: number): ShootingStar => {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // 大约 45 度角
    return {
      x: Math.random() * width * 0.7,
      y: Math.random() * height * 0.3,
      length: Math.random() * 80 + 60,
      speed: Math.random() * 8 + 12,
      angle,
      opacity: 1,
      active: true,
    };
  }, []);

  // 绘制星星（简化版，避免每帧创建渐变）
  const drawStar = useCallback((
    ctx: CanvasRenderingContext2D,
    star: Star,
    time: number
  ) => {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    const currentBrightness = star.brightness + twinkle * 0.2;
    const alpha = Math.max(0.1, Math.min(1, currentBrightness));

    // 简化渲染：只绘制核心点，省去昂贵的渐变
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
    
    // 较大的星星添加柔和光晕
    if (star.size > 1.2) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 255, ${alpha * 0.3})`;
      ctx.fill();
    }
  }, []);

  // 绘制流星
  const drawShootingStar = useCallback((
    ctx: CanvasRenderingContext2D,
    star: ShootingStar
  ) => {
    if (!star.active) return;

    const endX = star.x + Math.cos(star.angle) * star.length;
    const endY = star.y + Math.sin(star.angle) * star.length;

    // 流星渐变
    const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    gradient.addColorStop(0.3, `rgba(200, 180, 255, ${star.opacity * 0.8})`);
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    // 绘制流星轨迹
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 流星头部发光
    const headGradient = ctx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, 4
    );
    headGradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = headGradient;
    ctx.fill();
  }, []);

  // 更新流星位置
  const updateShootingStar = useCallback((star: ShootingStar) => {
    if (!star.active) return;

    star.x += Math.cos(star.angle) * star.speed;
    star.y += Math.sin(star.angle) * star.speed;
    star.opacity -= 0.01;

    if (star.opacity <= 0) {
      star.active = false;
    }
  }, []);

  // 动画循环（带帧率限制）
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 帧率限制
    const elapsed = time - lastTimeRef.current;
    if (elapsed < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTimeRef.current = time - (elapsed % frameInterval);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制星星
    const stars = starsRef.current;
    for (let i = 0; i < stars.length; i++) {
      drawStar(ctx, stars[i], time);
    }

    // 处理流星
    if (enableShootingStars) {
      // 可能生成新流星
      if (Math.random() < shootingStarProbability) {
        shootingStarsRef.current.push(createShootingStar(canvas.width, canvas.height));
      }

      // 更新和绘制流星
      shootingStarsRef.current = shootingStarsRef.current.filter(star => star.active);
      shootingStarsRef.current.forEach(star => {
        updateShootingStar(star);
        drawShootingStar(ctx, star);
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [drawStar, drawShootingStar, updateShootingStar, createShootingStar, enableShootingStars, shootingStarProbability, frameInterval]);

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // 重新初始化星星位置
    initStars(rect.width, rect.height);
  }, [initStars]);

  useEffect(() => {
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 启动动画
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        zIndex: 0,
        willChange: 'contents',
      }}
    />
  );
}

export default StarfieldCanvas;
