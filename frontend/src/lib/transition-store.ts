'use client';

import { startTransition } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { create } from 'zustand';

export type TransitionType = 'fade' | 'portal' | 'mist' | 'runes';

interface TransitionState {
  isTransitioning: boolean;
  transitionType: TransitionType;
  duration: number;
  startTransition: (type?: TransitionType, duration?: number) => void;
  completeTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  transitionType: 'fade',
  duration: 800,
  startTransition: (type = 'fade', duration = 800) => {
    set({
      isTransitioning: true,
      transitionType: type,
      duration,
    });
  },
  completeTransition: () => {
    set({ isTransitioning: false });
  },
}));

export function usePageTransition() {
  const begin = useTransitionStore((state) => state.startTransition);

  const navigateWithTransition = (
    router: AppRouterInstance,
    href: string,
    type: TransitionType = 'fade',
    duration = 800,
  ) => {
    begin(type, duration);

    window.setTimeout(() => {
      startTransition(() => {
        router.push(href);
      });
    }, Math.min(120, Math.floor(duration * 0.2)));
  };

  return { navigateWithTransition };
}
