'use client';

import { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParchmentTextureProps {
  children: ReactNode;
  /** 纹理变体 */
  variant?: 'worn' | 'clean' | 'aged';
  /** 纹理透明度 (0-1) */
  opacity?: number;
  /** 是否显示边缘磨损效果 */
  showEdgeWear?: boolean;
  /** 是否有轻微动画 */
  animated?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 羊皮纸纹理背景组件
 * 为内容区域添加古籍纸张质感
 */
export function ParchmentTexture({
  children,
  variant = 'worn',
  opacity = 0.03,
  showEdgeWear = true,
  animated = false,
  className = '',
}: ParchmentTextureProps) {
  // 根据变体获取配置
  const config = useMemo(() => {
    switch (variant) {
      case 'clean':
        return {
          baseColor: 'rgba(232, 220, 196, 0.02)',
          noiseFrequency: 0.6,
          grainOpacity: opacity * 0.5,
        };
      case 'aged':
        return {
          baseColor: 'rgba(215, 195, 160, 0.04)',
          noiseFrequency: 1.2,
          grainOpacity: opacity * 1.5,
        };
      case 'worn':
      default:
        return {
          baseColor: 'rgba(232, 220, 196, 0.03)',
          noiseFrequency: 0.9,
          grainOpacity: opacity,
        };
    }
  }, [variant, opacity]);

  return (
    <div className={`relative ${className}`}>
      {/* 基础纸张色调 */}
      <div 
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: `linear-gradient(
            135deg,
            ${config.baseColor} 0%,
            transparent 50%,
            ${config.baseColor} 100%
          )`,
        }}
      />

      {/* 噪点纹理层 - 模拟纸张颗粒 */}
      <div 
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${config.noiseFrequency}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: config.grainOpacity,
          mixBlendMode: 'multiply',
        }}
      />

      {/* 细微纤维纹理 */}
      <div 
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23b8956e' fill-opacity='0.015'%3E%3Cpath d='M0 50 Q25 48 50 50 T100 50' stroke='%23b8956e' stroke-opacity='0.02' fill='none'/%3E%3Cpath d='M0 30 Q30 32 60 30 T100 30' stroke='%23b8956e' stroke-opacity='0.015' fill='none'/%3E%3Cpath d='M0 70 Q20 68 40 70 T100 70' stroke='%23b8956e' stroke-opacity='0.015' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* 边缘磨损效果 */}
      {showEdgeWear && (
        <>
          {/* 顶部渐隐 */}
          <div 
            className="absolute top-0 left-0 right-0 h-8 rounded-t-inherit pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(26, 29, 36, 0.3), transparent)',
            }}
          />
          {/* 底部渐隐 */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-8 rounded-b-inherit pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(26, 29, 36, 0.3), transparent)',
            }}
          />
          {/* 左侧渐隐 */}
          <div 
            className="absolute top-0 bottom-0 left-0 w-4 rounded-l-inherit pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(26, 29, 36, 0.2), transparent)',
            }}
          />
          {/* 右侧渐隐 */}
          <div 
            className="absolute top-0 bottom-0 right-0 w-4 rounded-r-inherit pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(26, 29, 36, 0.2), transparent)',
            }}
          />
        </>
      )}

      {/* 动态光影效果（可选） */}
      {animated && (
        <motion.div 
          className="absolute inset-0 rounded-inherit pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 30%, rgba(184, 149, 110, 0.03) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 70%, rgba(184, 149, 110, 0.03) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 30%, rgba(184, 149, 110, 0.03) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * 内容卡片专用羊皮纸背景
 * 预配置适合解读内容展示的样式
 */
export function ParchmentCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ParchmentTexture
      variant="worn"
      opacity={0.025}
      showEdgeWear={true}
      className={`
        bg-gradient-to-br from-dark-800/60 to-dark-900/80
        rounded-organic
        border-ethereal
        shadow-mystic
        p-6
        ${className}
      `}
    >
      {children}
    </ParchmentTexture>
  );
}

export default ParchmentTexture;
