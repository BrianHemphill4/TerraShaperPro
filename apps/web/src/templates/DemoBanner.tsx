import Link from 'next/link';

import { StickyBanner } from '@/features/landing/StickyBanner';

export const DemoBanner = () => (
  <StickyBanner>
    Welcome to TerraShaper Pro -
    {' '}
    <Link href="/sign-up">Start Your Free Trial</Link>
  </StickyBanner>
);
