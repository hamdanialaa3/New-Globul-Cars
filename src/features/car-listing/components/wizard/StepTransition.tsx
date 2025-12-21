// Step Transition Component with Framer Motion
// مكون الانتقال بين الخطوات مع Framer Motion
import { motion, Variants } from 'framer-motion';
import React from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  direction?: 'forward' | 'backward';
}

const slideVariants: Variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

const transition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  direction = 'forward',
}) => {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

