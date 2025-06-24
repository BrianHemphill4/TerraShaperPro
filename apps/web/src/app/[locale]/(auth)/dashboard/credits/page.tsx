import { getTranslations } from 'next-intl/server';

import { CreditUsageDashboard } from '@/components/credits/CreditUsageDashboard';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('Credits.meta_title'),
    description: t('Credits.meta_description'),
  };
}

export default function CreditsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Credits & Usage</h1>
        <p className="text-muted-foreground">Monitor your credit balance and usage history</p>
      </div>

      <CreditUsageDashboard />
    </div>
  );
}
