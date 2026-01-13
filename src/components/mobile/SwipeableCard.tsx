import { useState, useRef, ReactNode } from 'react';
import { Check, X, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: ReactNode;
  color: string;
  onAction: () => void;
  label: string;
}

interface SwipeableCardProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  className,
  disabled = false
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const ACTION_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = e.touches[0].clientX;
    let diff = currentX - startX.current;
    
    // Apply resistance
    if (Math.abs(diff) > ACTION_THRESHOLD) {
      diff = Math.sign(diff) * (ACTION_THRESHOLD + (Math.abs(diff) - ACTION_THRESHOLD) * 0.2);
    }
    
    // Limit based on available actions
    if (diff > 0 && !leftAction) diff = 0;
    if (diff < 0 && !rightAction) diff = 0;
    
    setOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);
    
    if (offset > ACTION_THRESHOLD && leftAction) {
      leftAction.onAction();
    } else if (offset < -ACTION_THRESHOLD && rightAction) {
      rightAction.onAction();
    }
    
    setOffset(0);
    startX.current = 0;
  };

  const getActionOpacity = (isLeft: boolean) => {
    const absOffset = Math.abs(offset);
    const direction = isLeft ? offset > 0 : offset < 0;
    if (!direction) return 0;
    return Math.min(absOffset / ACTION_THRESHOLD, 1);
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-[var(--radius-card)]", className)}
    >
      {/* Left action background */}
      {leftAction && (
        <div 
          className="swipe-action left-0 rounded-l-[var(--radius-card)]"
          style={{ 
            backgroundColor: leftAction.color,
            opacity: getActionOpacity(true),
            width: Math.max(0, offset)
          }}
        >
          <div style={{ opacity: offset > ACTION_THRESHOLD * 0.5 ? 1 : 0 }}>
            {leftAction.icon}
          </div>
        </div>
      )}

      {/* Right action background */}
      {rightAction && (
        <div 
          className="swipe-action right-0 rounded-r-[var(--radius-card)]"
          style={{ 
            backgroundColor: rightAction.color,
            opacity: getActionOpacity(false),
            width: Math.max(0, -offset)
          }}
        >
          <div style={{ opacity: -offset > ACTION_THRESHOLD * 0.5 ? 1 : 0 }}>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-card transition-transform"
        style={{ 
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}