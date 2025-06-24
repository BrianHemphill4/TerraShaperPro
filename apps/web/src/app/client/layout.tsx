import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal - TerraShaper Pro',
  description: 'View and provide feedback on your landscape design project',
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
