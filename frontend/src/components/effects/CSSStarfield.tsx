'use client';

import { useMemo } from 'react';

interface CSSStarfieldProps {
  /** 星星数量 */
  starCount?: number;
  /** 是否启用流星 */
  enableShootingStars?: boolean;
  /** 类名 */
  className?: string;
}

/**
 * CSS 实现的星空背景
 * 使用 CSS 动画实现星星闪烁，GPU 加速，性能极佳
 */
export function CSSStarfield({
  starCount = 80,
  enableShootingStars = true,
  className = '',
}: CSSStarfieldProps) {
  // 生成星星数据（只在初始化时计算一次）
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      brightness: Math.random() * 0.5 + 0.5,
    }));
  }, [starCount]);

  // 生成流星数据
  const shootingStars = useMemo(() => {
    if (!enableShootingStars) return [];
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      delay: i * 8 + Math.random() * 5,
      duration: 1.5 + Math.random(),
      startX: Math.random() * 70,
      startY: Math.random() * 30,
    }));
  }, [enableShootingStars]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      {/* 星星层 */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: `rgba(255, 255, 255, ${star.brightness})`,
            boxShadow: star.size > 1.5 
              ? `0 0 ${star.size * 2}px rgba(200, 180, 255, 0.5)` 
              : 'none',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* 流星层 */}
      {shootingStars.map((meteor) => (
        <div
          key={`meteor-${meteor.id}`}
          className="absolute"
          style={{
            left: `${meteor.startX}%`,
            top: `${meteor.startY}%`,
            width: '100px',
            height: '2px',
            background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(200,180,255,0.5), transparent)',
            borderRadius: '50%',
            transform: 'rotate(45deg)',
            animation: `shootingStar ${meteor.duration}s ease-out ${meteor.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes shootingStar {
          0% {
            opacity: 0;
            transform: rotate(45deg) translateX(0);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(45deg) translateX(300px);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * CSS 实现的漂浮尘埃
 * 使用 CSS 动画，GPU 加速
 */
export function CSSParticles({
  particleCount = 15,
  className = '',
}: {
  particleCount?: number;
  className?: string;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 10,
      duration: Math.random() * 20 + 15,
      opacity: Math.random() * 0.3 + 0.1,
      driftX: (Math.random() - 0.5) * 100,
      driftY: (Math.random() - 0.5) * 80 - 30, // 轻微向上飘
    }));
  }, [particleCount]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `rgba(184, 149, 110, ${p.opacity})`,
            animation: `float-${p.id} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      <style jsx>{`
        ${particles.map(p => `
          @keyframes float-${p.id} {
            0%, 100% {
              transform: translate(0, 0);
              opacity: ${p.opacity};
            }
            50% {
              transform: translate(${p.driftX}px, ${p.driftY}px);
              opacity: ${p.opacity * 1.5};
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

export default CSSStarfield;
