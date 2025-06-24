import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { badgeVariants } from './badgeVariants';
import { cn } from './utils';

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
