import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../AppContext';

/**
 * RouteProgressBar
 *
 * A 2px accent-blue progress bar at the top of the *content area*
 * (inside <main>, not over the sidebar). Triggers on every activeView change.
 *
 * Drop this as the very first child inside <main> in App.tsx:
 *   <main className="... relative">
 *     <RouteProgressBar />
 *     ...
 *   </main>
 *
 * The bar uses `position: sticky; top: 0` so it remains visible
 * at the top of the content viewport regardless of scroll position.
 */
export const RouteProgressBar: React.FC = () => {
  const { activeView } = useApp();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any in-flight timers from a previous navigation
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPhase('loading');

    const t1 = setTimeout(() => setPhase('done'), 450);
    const t2 = setTimeout(() => setPhase('idle'), 750);

    timersRef.current = [t1, t2];
    return () => timersRef.current.forEach(clearTimeout);
  }, [activeView]);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden
      style={{
        position:  'sticky',
        top:       0,
        left:      0,
        right:     0,
        height:    2,
        zIndex:    9000,
        overflow:  'hidden',
        // Reserve height so layout doesn't shift
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height:     '100%',
          background: 'var(--color-trado-accent)',
          boxShadow:  '0 0 8px var(--color-trado-accent)',
          transformOrigin: 'left center',
          animation:
            phase === 'loading'
              ? 'progressSweep 450ms cubic-bezier(0.4,0,0.2,1) forwards'
              : 'none',
          width:   phase === 'done' ? '100%' : undefined,
          opacity: phase === 'done' ? 0 : 1,
          transition: phase === 'done' ? 'opacity 200ms ease' : undefined,
        }}
      />
    </div>
  );
};
