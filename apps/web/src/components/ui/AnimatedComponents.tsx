'use client';

import { AnimatePresence, motion } from 'framer-motion';

import * as animations from '@/lib/animations';
import { cn } from '@/lib/utils';

type AnimatedCardProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      variants={animations.cardHover}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type AnimatedButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.button variants={animations.buttonTap} whileTap="tap" className={className} {...props}>
      {children}
    </motion.button>
  );
}

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, duration = 0.3, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type StaggeredListProps = {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
};

export function StaggeredList({ children, className, itemClassName }: StaggeredListProps) {
  return (
    <motion.div
      variants={animations.staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={animations.staggerItem} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

type AnimatedPresenceWrapperProps = {
  children: React.ReactNode;
  show: boolean;
  animation?: 'fade' | 'scale' | 'slideRight' | 'slideLeft';
};

export function AnimatedPresenceWrapper({
  children,
  show,
  animation = 'fade',
}: AnimatedPresenceWrapperProps) {
  const animationVariants = {
    fade: animations.fadeIn,
    scale: animations.scaleIn,
    slideRight: animations.slideInRight,
    slideLeft: animations.slideInLeft,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={animationVariants[animation]}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type PulsingDotProps = {
  className?: string;
  color?: string;
};

export function PulsingDot({ className, color = 'bg-green-500' }: PulsingDotProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <motion.span
        className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', color)}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.75, 0, 0.75],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className={cn('relative inline-flex h-3 w-3 rounded-full', color)} />
    </span>
  );
}

type SuccessCheckmarkProps = {
  size?: number;
  className?: string;
};

export function SuccessCheckmark({ size = 24, className }: SuccessCheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial="initial"
      animate="animate"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={animations.checkmarkPath}
      />
    </motion.svg>
  );
}

type ErrorShakeProps = {
  children: React.ReactNode;
  shake: boolean;
  className?: string;
};

export function ErrorShake({ children, shake, className }: ErrorShakeProps) {
  return (
    <motion.div
      variants={animations.errorShake}
      animate={shake ? 'animate' : 'initial'}
      className={className}
    >
      {children}
    </motion.div>
  );
}
