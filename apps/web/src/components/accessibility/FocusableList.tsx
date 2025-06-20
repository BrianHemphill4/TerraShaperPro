'use client';

import { useRef } from 'react';
import { useArrowKeyNavigation } from '@/hooks/use-focus-management';
import { cn } from '@/lib/utils';

interface FocusableListProps {
  children: React.ReactNode[];
  orientation?: 'horizontal' | 'vertical' | 'both';
  className?: string;
  onSelect?: (index: number) => void;
}

export function FocusableList({
  children,
  orientation = 'vertical',
  className,
  onSelect,
}: FocusableListProps) {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const { focusedIndex } = useArrowKeyNavigation(itemsRef, {
    orientation,
    loop: true,
    onSelect,
  });

  return (
    <div
      role="list"
      className={cn(
        orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
        className
      )}
    >
      {children.map((child, index) => (
        <div
          key={index}
          role="listitem"
          ref={(el) => {
            itemsRef.current[index] = el;
          }}
          tabIndex={focusedIndex === index ? 0 : -1}
          className={cn(
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            focusedIndex === index && 'ring-2 ring-ring ring-offset-2'
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}