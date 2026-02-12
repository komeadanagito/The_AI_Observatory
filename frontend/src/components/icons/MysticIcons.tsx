'use client';

import { motion } from 'framer-motion';

interface IconProps {
  /** 图标大小 */
  size?: number | string;
  /** 图标颜色 */
  color?: string;
  /** 额外类名 */
  className?: string;
  /** 是否有动画 */
  animated?: boolean;
}

/**
 * 月相图标组件
 */
export function MoonIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(animated && {
        animate: { rotate: [0, 5, -5, 0] },
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      })}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} fillOpacity="0.2" />
    </Component>
  );
}

/**
 * 新月图标
 */
export function NewMoonIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <circle cx="12" cy="12" r="10" opacity="0.3" />
    </svg>
  );
}

/**
 * 满月图标
 */
export function FullMoonIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/**
 * 六芒星图标（用于加载动画）
 */
export function HexagramIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className={className}
      {...(animated && {
        animate: { rotate: 360 },
        transition: { duration: 3, repeat: Infinity, ease: 'linear' }
      })}
    >
      {/* 上三角 */}
      <path d="M12 2L20 18H4L12 2Z" fill={color} fillOpacity="0.15" />
      {/* 下三角 */}
      <path d="M12 22L4 6H20L12 22Z" fill={color} fillOpacity="0.15" />
    </Component>
  );
}

/**
 * 水晶球图标
 */
export function CrystalBallIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...(animated && {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      })}
    >
      {/* 球体 */}
      <circle cx="12" cy="10" r="8" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
      {/* 高光 */}
      <ellipse cx="9" cy="7" rx="2" ry="1.5" fill={color} fillOpacity="0.3" />
      {/* 底座 */}
      <path d="M6 18h12l-2-4H8l-2 4z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path d="M5 18h14v2H5v-2z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
    </Component>
  );
}

/**
 * 神秘之眼图标
 */
export function MysticEyeIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...(animated && {
        animate: { scale: [1, 1.02, 1] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      })}
    >
      {/* 眼眶 */}
      <path 
        d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7z" 
        stroke={color} 
        strokeWidth="1.5" 
        fill={color} 
        fillOpacity="0.1" 
      />
      {/* 虹膜 */}
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      {/* 瞳孔 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </Component>
  );
}

/**
 * 手掌图标（掌纹占卜）
 */
export function PalmIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      {/* 手掌轮廓 */}
      <path d="M8 22h8l1-5.5c.3-1.5 1-3 1-4.5 0-2-1-3-3-3v-4c0-1.5-1-2-2-2s-2 .5-2 2v3c-1-1-2-1-3 0v-3c0-1.5-1-2-2-2s-2 .5-2 2v7c0 2 1 4 2 5.5L8 22z" fill={color} fillOpacity="0.15" />
      {/* 掌纹 */}
      <path d="M9 14c2-1 4-1 6 0" strokeOpacity="0.5" />
      <path d="M8 16c2.5 0 5 0 7.5 0" strokeOpacity="0.5" />
    </svg>
  );
}

/**
 * 塔罗牌花色 - 权杖
 */
export function WandsIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 2v20" />
      <path d="M8 6l4-4 4 4" fill={color} fillOpacity="0.3" />
      <circle cx="12" cy="8" r="1" fill={color} />
      <circle cx="12" cy="12" r="1" fill={color} />
      <circle cx="12" cy="16" r="1" fill={color} />
    </svg>
  );
}

/**
 * 塔罗牌花色 - 圣杯
 */
export function CupsIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M7 4h10l-1 10c0 2-2 4-4 4s-4-2-4-4L7 4z" fill={color} fillOpacity="0.2" />
      <path d="M10 18v2h4v-2" />
      <path d="M8 22h8" />
    </svg>
  );
}

/**
 * 塔罗牌花色 - 宝剑
 */
export function SwordsIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 2L14 8V16L12 22L10 16V8L12 2Z" fill={color} fillOpacity="0.2" />
      <path d="M8 10h8" />
      <circle cx="12" cy="10" r="2" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

/**
 * 塔罗牌花色 - 星币/金币
 */
export function PentaclesIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.15" />
      {/* 五芒星 */}
      <path 
        d="M12 3l2.5 7.5h8l-6.5 5 2.5 7.5-6.5-5-6.5 5 2.5-7.5-6.5-5h8z" 
        fill={color} 
        fillOpacity="0.25" 
      />
    </svg>
  );
}

/**
 * 星星图标（成功/确认）
 */
export function StarIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      {...(animated && {
        animate: { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      })}
    >
      <path d="M12 2L14 8L20 9L15 14L17 20L12 17L7 20L9 14L4 9L10 8L12 2Z" />
    </Component>
  );
}

/**
 * 洗牌图标
 */
export function ShuffleIcon({ size = 24, color = 'currentColor', className = '', animated = false }: IconProps) {
  const Component = animated ? motion.svg : 'svg';
  return (
    <Component
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className={className}
      {...(animated && {
        animate: { rotate: [0, 10, -10, 0] },
        transition: { duration: 0.5, repeat: Infinity }
      })}
    >
      {/* 三张重叠的牌 */}
      <rect x="3" y="4" width="10" height="14" rx="1" fill={color} fillOpacity="0.1" transform="rotate(-10 8 11)" />
      <rect x="6" y="4" width="10" height="14" rx="1" fill={color} fillOpacity="0.2" />
      <rect x="9" y="4" width="10" height="14" rx="1" fill={color} fillOpacity="0.3" transform="rotate(10 14 11)" />
    </Component>
  );
}

/**
 * 返回箭头（月相风格）
 */
export function BackArrowIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      {/* 新月形状作为返回箭头 */}
      <path d="M15 12c0-4.5-3.5-8-8-8 0 0 4 2 4 8s-4 8-4 8c4.5 0 8-3.5 8-8z" />
    </svg>
  );
}

/**
 * 加载动画图标（旋转六芒星）
 */
export function LoadingIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <HexagramIcon size={size} color={color} />
    </motion.div>
  );
}

/**
 * 炼金术符号 - 火
 */
export function AlchemyFireIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 2L20 20H4L12 2Z" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

/**
 * 炼金术符号 - 水
 */
export function AlchemyWaterIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 22L4 4H20L12 22Z" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

/**
 * 炼金术符号 - 风/气
 */
export function AlchemyAirIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 2L20 20H4L12 2Z" fill={color} fillOpacity="0.2" />
      <path d="M6 14H18" />
    </svg>
  );
}

/**
 * 炼金术符号 - 土
 */
export function AlchemyEarthIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 22L4 4H20L12 22Z" fill={color} fillOpacity="0.2" />
      <path d="M6 10H18" />
    </svg>
  );
}

export default {
  MoonIcon,
  NewMoonIcon,
  FullMoonIcon,
  HexagramIcon,
  CrystalBallIcon,
  MysticEyeIcon,
  PalmIcon,
  WandsIcon,
  CupsIcon,
  SwordsIcon,
  PentaclesIcon,
  StarIcon,
  ShuffleIcon,
  BackArrowIcon,
  LoadingIcon,
  AlchemyFireIcon,
  AlchemyWaterIcon,
  AlchemyAirIcon,
  AlchemyEarthIcon,
};
