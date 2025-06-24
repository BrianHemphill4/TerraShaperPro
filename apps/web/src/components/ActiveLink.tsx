'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/helpers';

export const ActiveLink = (props: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <Link
      href={props.href}
      className={cn(
        'px-3 py-2',
        pathname.endsWith(props.href) && 'bg-primary text-primary-foreground rounded-md'
      )}
    >
      {props.children}
    </Link>
  );
};
