import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — animates from 0 to `target` over `duration` ms.
 *
 * Usage:
 *   const displayed = useCountUp(user.walletBalance, 600);
 *
 * Re-runs whenever `target` changes (e.g. after data loads).
 * Uses easeOutExpo for a snappy deceleration feel.
 */
export function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const frameRef   = useRef<number>(0);
  const startRef   = useRef<number | null>(null);
  const prevTarget = useRef<number>(0);

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) return;

    const startValue = prevTarget.current;
    prevTarget.current = target;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(startValue + (target - startValue) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}
