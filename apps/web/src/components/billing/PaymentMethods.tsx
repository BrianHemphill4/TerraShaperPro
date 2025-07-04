'use client';

import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

const cardBrandIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 Amex',
  discover: '💳 Discover',
};

export function PaymentMethods() {
  const [isAddingCard, setIsAddingCard] = useState(false);

  const { data: paymentMethods, isLoading, refetch } = api.billing.getPaymentMethods.useQuery();
  const createPortalMutation = api.billing.createPortalSession.useMutation();

  const handleAddPaymentMethod = async () => {
    // In production, you would integrate Stripe Elements here
    // For now, redirect to Stripe portal
    const result = await createPortalMutation.mutateAsync({
      returnUrl: window.location.href,
    });

    if (result.url) {
      window.location.href = result.url;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <CreditCard className="mr-2 size-5" />
            Payment Methods
          </span>
          <Button size="sm" onClick={handleAddPaymentMethod}>
            <Plus className="mr-2 size-4" />
            Add Card
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods && paymentMethods.length === 0 ? (
          <div className="py-8 text-center">
            <CreditCard className="mx-auto mb-4 size-12 text-gray-400" />
            <p className="mb-4 text-gray-500">No payment methods added yet</p>
            <Button onClick={handleAddPaymentMethod}>
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods?.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="size-8 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {cardBrandIcons[method.brand || ''] || method.brand} •••• {method.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary">
                      <Star className="mr-1 size-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Make default
                      }}
                    >
                      Make Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Remove payment method
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Payment methods are securely stored and processed by Stripe. 
            TerraShaper Pro never stores your complete card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}