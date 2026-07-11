import React from 'react';
import { motion } from 'motion/react';

/**
 * MotionGraphics
 * Subtle per-page structural animation layer.
 * The global glow blobs are handled by AmbientBackground (position:fixed).
 * This component only renders the constellation path + rotating ring so
 * there's no double-rendering of glow effects.
 */
export const MotionGraphics: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Constellation path — desktop only, very faint */}
      <svg
        className="absolute top-[20%] left-[5%] w-[90%] h-[60%] opacity-[0.018] hidden md:block"
        viewBox="0 0 1000 600"
        fill="none"
      >
        <motion.path
          d="M 100 300 L 250 200 L 400 450 L 550 150 L 700 350 L 850 100"
          stroke="url(#constellationGrad)"
          strokeWidth="2"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="constellationGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4F6BFF" />
            <stop offset="50%"  stopColor="#7B8FFF" />
            <stop offset="100%" stopColor="#4F6BFF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Slowly rotating ring — structural accent, very low opacity */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 right-12 w-48 h-48 rounded-full flex items-center justify-center opacity-[0.12]"
        style={{ border: '1px solid rgba(79,107,255,0.1)' }}
      >
        <div
          className="w-24 h-24 rounded-full border-dashed"
          style={{ border: '1px dashed rgba(79,107,255,0.1)' }}
        />
        <div className="absolute w-2 h-2 rounded-full top-0 left-1/2 -ml-1"
             style={{ background: 'rgba(79,107,255,0.25)' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bottom-0 left-1/2"
             style={{ background: 'rgba(79,107,255,0.3)', marginLeft: '-3px' }} />
      </motion.div>
    </div>
  );
};
