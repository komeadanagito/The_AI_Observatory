'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PageTransition } from './PageTransition';
import { useTransitionStore } from '@/lib/transition-store';

/**
 * 全局转场遮罩层
 * 监听路由变化并触发转场动画
 */
export function TransitionOverlay() {
  const pathname = usePathname();
  const { 
    isTransitioning, 
    transitionType, 
    duration, 
    completeTransition 
  } = useTransitionStore();

  // 监听路由变化 - 当转场完成后清理状态
  useEffect(() => {
    if (isTransitioning) {
      // 转场结束后执行回调
      const timer = setTimeout(() => {
        completeTransition();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, duration, completeTransition]);

  return (
    <PageTransition
      isActive={isTransitioning}
      type={transitionType}
      duration={duration}
    />
  );
}

export default TransitionOverlay;
