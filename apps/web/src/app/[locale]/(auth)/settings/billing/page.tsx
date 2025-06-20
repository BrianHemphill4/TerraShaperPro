import { BillingOverview } from '@/components/billing/BillingOverview';
import { PricingPlans } from '@/components/billing/PricingPlans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@clerk/nextjs';

export default async function BillingSettingsPage() {
  const { userId } = auth();
  
  // In a real app, you'd fetch the current subscription tier from the database
  const currentTier = 'free';

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Billing & Subscription</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BillingOverview />
        </TabsContent>

        <TabsContent value="plans">
          <PricingPlans currentTier={currentTier} />
        </TabsContent>
      </Tabs>
    </div>
  );
}