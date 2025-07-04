import '../../styles/global.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import { DemoBadge } from '@/components/DemoBadge';
import { WebVitals } from '@/components/monitoring/WebVitals';
import { Toaster } from '@/components/ui/toaster';
import { TRPCProvider } from '@/providers/TRPCProvider';
import { AllLocales } from '@/utils/AppConfig';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return AllLocales.map(locale => ({ locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  // Using internationalization in Client Components
  const messages = useMessages();

  // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
  // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.
  return (
    <ClerkProvider>
      <html lang={props.params.locale} suppressHydrationWarning>
        <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
          {/* PRO: Dark mode support for Shadcn UI */}
          <NextIntlClientProvider
            locale={props.params.locale}
            messages={messages}
          >
            <TRPCProvider>
              <WebVitals />
              {props.children}

              <DemoBadge />
              <Toaster />
            </TRPCProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
