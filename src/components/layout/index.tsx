import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Box: Generic container for padding, borders, and backgrounds.
 */
export const Box = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
);
Box.displayName = 'Box';

/**
 * Flex: Horizontal layout primitive.
 */
interface FlexProps extends LayoutProps {
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  gap?: number | string;
  wrap?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, align = 'center', justify = 'start', direction = 'row', gap, wrap, ...props }, ref) => {
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    }[align];

    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    }[justify];

    const directionClass = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    }[direction];

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClass,
          alignClass,
          justifyClass,
          wrap && 'flex-wrap',
          className
        )}
        style={{ gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap }}
        {...props}
      />
    );
  }
);
Flex.displayName = 'Flex';

/**
 * Stack: Vertical layout primitive.
 */
interface StackProps extends LayoutProps {
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  gap?: number | string;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, align = 'stretch', justify = 'start', gap, ...props }, ref) => {
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[align];

    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    }[justify];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          alignClass,
          justifyClass,
          className
        )}
        style={{ gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap }}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

/**
 * Grid: Standard grid container.
 */
interface GridProps extends LayoutProps {
  cols?: number | string;
  gap?: number | string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: typeof cols === 'number' ? `repeat(${cols}, minmax(0, 1fr))` : cols,
        gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
      }}
      {...props}
    />
  )
);
Grid.displayName = 'Grid';

/**
 * Container: Max-width wrapper for page content.
 */
export const Container = ({ className, ...props }: LayoutProps) => (
  <div className={cn('container mx-auto px-6 max-w-6xl', className)} {...props} />
);

/**
 * Section: Semantic vertical block with consistent spacing.
 */
interface SectionProps extends LayoutProps {
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

export const Section = ({ className, spacing = 'md', ...props }: SectionProps) => {
  const spacingClass = {
    sm: 'space-y-4',
    md: 'space-y-8',
    lg: 'space-y-12',
    none: '',
  }[spacing];

  return <section className={cn(spacingClass, className)} {...props} />;
};
