'use client';

import { AlertCircle, Building2, Check, CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export function PaymentMethodsManager() {
  const { toast } = useToast();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const { data: paymentMethods, refetch } = api.billing.getPaymentMethods.useQuery();
  const setDefaultMutation = api.billing.setDefaultPaymentMethod.useMutation();
  const deletePaymentMethodMutation = api.billing.deletePaymentMethod.useMutation();
  const attachPaymentMethodMutation = api.billing.attachPaymentMethod.useMutation();

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultMutation.mutateAsync({ paymentMethodId });
      toast({
        title: 'Default payment method updated',
        description: 'Your default payment method has been changed.',
      });
      refetch();
    } catch (_error) {
      toast({
        title: 'Failed to set default payment method',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setDeletingCardId(paymentMethodId);
      await deletePaymentMethodMutation.mutateAsync({ paymentMethodId });
      toast({
        title: 'Payment method removed',
        description: 'The payment method has been removed from your account.',
      });
      refetch();
    } catch (_error) {
      toast({
        title: 'Failed to remove payment method',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setIsAddingCard(true);
      // This would typically open Stripe's payment element or redirect to a setup page
      const setupUrl = '/billing/setup'; // Placeholder - would integrate with Stripe
      window.location.href = setupUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start payment method setup.',
        variant: 'destructive',
      });
      setIsAddingCard(false);
    }
  };

  const getCardIcon = (brand: string) => {
    // In a real app, you'd have specific icons for each card brand
    return <CreditCard className="size-8" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground">
            Manage your payment methods and billing information
          </p>
        </div>
        <Button onClick={handleAddPaymentMethod} disabled={isAddingCard}>
          <Plus className="mr-2 size-4" />
          Add Payment Method
        </Button>
      </div>

      {/* No Payment Methods Alert */}
      {paymentMethods?.length === 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            You don't have any payment methods on file. Add one to ensure uninterrupted service.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Methods List */}
      <div className="grid gap-4">
        {paymentMethods?.map((method) => (
          <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-muted rounded-lg p-2">{getCardIcon(method.card.brand)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">
                        {method.card.brand} •••• {method.card.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="size-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Expires {method.card.exp_month}/{method.card.exp_year}
                    </p>
                    {method.billing_details?.name && (
                      <p className="text-muted-foreground text-sm">{method.billing_details.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                      <Check className="mr-2 size-4" />
                      Set as Default
                    </Button>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={method.isDefault || deletingCardId === method.id}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Payment Method</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove this payment method? This action cannot be
                          undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Your billing address and tax information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Billing Address</p>
              {paymentMethods?.[0]?.billing_details?.address ? (
                <div className="text-muted-foreground text-sm">
                  <p>{paymentMethods[0].billing_details.address.line1}</p>
                  {paymentMethods[0].billing_details.address.line2 && (
                    <p>{paymentMethods[0].billing_details.address.line2}</p>
                  )}
                  <p>
                    {paymentMethods[0].billing_details.address.city},{' '}
                    {paymentMethods[0].billing_details.address.state}{' '}
                    {paymentMethods[0].billing_details.address.postal_code}
                  </p>
                  <p>{paymentMethods[0].billing_details.address.country}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No billing address on file</p>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">Tax Information</p>
              <p className="text-muted-foreground mb-4 text-sm">
                Add your tax ID to ensure proper invoicing
              </p>
              <Button variant="outline" size="sm">
                <Building2 className="mr-2 size-4" />
                Add Tax ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="text-muted-foreground text-sm">
              <p className="mb-1 font-medium">Secure Payment Processing</p>
              <p>
                All payment information is securely processed and stored by Stripe. We never have
                access to your full card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
