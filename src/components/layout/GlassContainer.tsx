import React from 'react';
import { cn } from '@/lib/utils';
import { Box } from './index';

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  border?: boolean;
  hoverGlow?: boolean;
}

export const GlassContainer = ({ 
  children, 
  className, 
  intensity = 'medium', 
  border = true,
  hoverGlow = false,
  ...props 
}: GlassContainerProps) => {
  const intensityClass = {
    low: 'bg-background/20 backdrop-blur-sm',
    medium: 'bg-card/30 backdrop-blur-md',
    high: 'bg-card/50 backdrop-blur-xl',
  }[intensity];

  return (
    <Box
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        intensityClass,
        border && 'border border-border/40',
        hoverGlow && 'hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]',
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
};
