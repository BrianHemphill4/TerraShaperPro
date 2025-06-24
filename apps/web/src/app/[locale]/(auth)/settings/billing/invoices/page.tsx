import { InvoiceList } from '@/components/billing/InvoiceList';

export default function InvoicesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Billing History</h1>
      <InvoiceList />
    </div>
  );
}
