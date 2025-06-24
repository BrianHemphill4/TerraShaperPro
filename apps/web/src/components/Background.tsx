import { cn } from '@/utils/helpers';

export const Background = (props: { children: React.ReactNode; className?: string }) => (
  <div className={cn('bg-secondary w-full', props.className)}>{props.children}</div>
);
