'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-organic-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-mystic tracking-[0.02em]';
    
    const variants = {
      primary: 'bg-[linear-gradient(180deg,rgba(184,149,110,0.28),rgba(104,75,39,0.92))] text-[#f4eadb] border border-[#b8956e]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.28)] hover:border-[#d6ba8b]/50 hover:text-white',
      secondary: 'bg-[linear-gradient(180deg,rgba(31,36,52,0.92),rgba(15,18,28,0.92))] text-parchment-200 border border-white/8 hover:border-[#b8956e]/28 hover:bg-[linear-gradient(180deg,rgba(38,44,64,0.95),rgba(16,19,29,0.95))]',
      outline: 'border border-[#b8956e]/35 text-[#d6c0a0] bg-black/10 hover:bg-[#b8956e]/8 hover:border-[#d2b387]/50 backdrop-blur-sm',
      ghost: 'text-parchment-300 hover:bg-white/5 hover:text-parchment-200',
    };

    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-5 py-2.5 text-[15px]',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.015, y: disabled || isLoading ? 0 : -1 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            加载中...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
