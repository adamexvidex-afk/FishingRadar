import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.18,
};

const AnimatedOutlet = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ willChange: 'transform, opacity' }}
      >
        {outlet && cloneElement(outlet, { key: location.pathname })}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
