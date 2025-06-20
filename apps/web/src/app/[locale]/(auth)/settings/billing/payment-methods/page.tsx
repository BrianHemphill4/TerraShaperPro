import { PaymentMethods } from '~/components/billing/PaymentMethods';

export default function PaymentMethodsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Payment Methods</h1>
      <PaymentMethods />
    </div>
  );
}