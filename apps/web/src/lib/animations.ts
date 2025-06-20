import { Variants } from 'framer-motion';

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  exit: { opacity: 0, scale: 0.8 },
};

// Slide animations
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

// Stagger children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Card hover effect
export const cardHover: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  tap: { scale: 0.98 },
};

// Button tap effect
export const buttonTap: Variants = {
  tap: { scale: 0.95 },
};

// Tooltip animation
export const tooltipAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 5 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 5,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

// Modal/Dialog animation
export const modalAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

// Drawer animations
export const drawerSlideIn: Variants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: { 
    x: '100%',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Loading spinner
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Success checkmark
export const checkmarkPath: Variants = {
  initial: { pathLength: 0 },
  animate: { 
    pathLength: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Error shake
export const errorShake: Variants = {
  initial: { x: 0 },
  animate: { 
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Pulse animation for attention
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};