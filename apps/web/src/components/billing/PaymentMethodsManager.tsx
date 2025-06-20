'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star,
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default payment method.',
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove payment method.',
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
      const { setupUrl } = await api.billing.createSetupIntent.query();
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
    return <CreditCard className="h-8 w-8" />;
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
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* No Payment Methods Alert */}
      {paymentMethods?.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
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
                  <div className="p-2 bg-muted rounded-lg">
                    {getCardIcon(method.card.brand)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">
                        {method.card.brand} •••• {method.card.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Expires {method.card.exp_month}/{method.card.exp_year}
                    </p>
                    {method.billing_details?.name && (
                      <p className="text-sm text-muted-foreground">
                        {method.billing_details.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
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
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Payment Method</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove this payment method? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
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
          <CardDescription>
            Your billing address and tax information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Billing Address</p>
              {paymentMethods?.[0]?.billing_details?.address ? (
                <div className="text-sm text-muted-foreground">
                  <p>{paymentMethods[0].billing_details.address.line1}</p>
                  {paymentMethods[0].billing_details.address.line2 && (
                    <p>{paymentMethods[0].billing_details.address.line2}</p>
                  )}
                  <p>
                    {paymentMethods[0].billing_details.address.city}, {paymentMethods[0].billing_details.address.state} {paymentMethods[0].billing_details.address.postal_code}
                  </p>
                  <p>{paymentMethods[0].billing_details.address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No billing address on file</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Tax Information</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your tax ID to ensure proper invoicing
              </p>
              <Button variant="outline" size="sm">
                <Building2 className="h-4 w-4 mr-2" />
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
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Secure Payment Processing</p>
              <p>
                All payment information is securely processed and stored by Stripe. 
                We never have access to your full card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}