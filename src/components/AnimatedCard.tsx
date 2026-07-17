import React from 'react';

interface AnimatedCardProps {
  /** Entrance stagger delay in milliseconds (e.g. index * 80) */
  delay?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Set to false to disable the hover-lift effect (e.g. for non-interactive cards) */
  hoverLift?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * AnimatedCard
 *
 * Shared wrapper for all inner-page cards. Provides:
 *  - Fade-up entrance animation staggered by `delay` prop (once per mount)
 *  - translateY(-2px) lift + accent-blue border glow on hover
 *
 * Usage:
 *   <AnimatedCard delay={idx * 80} className="glassmorphism p-5 rounded-2xl">
 *     ...content...
 *   </AnimatedCard>
 *
 * Teammates: do NOT re-implement these animations inline — import this instead.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  delay = 0,
  children,
  className = '',
  style,
  onClick,
  hoverLift = true,
  as: Tag = 'div',
}) => {
  const entranceStyle: React.CSSProperties = {
    opacity:   0,
    animation: `fadeUp 350ms ${delay}ms ease-out both`,
  };

  return (
    <Tag
      className={`${hoverLift ? 'card-lift' : ''} ${className}`}
      style={{ ...entranceStyle, ...style }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
};
