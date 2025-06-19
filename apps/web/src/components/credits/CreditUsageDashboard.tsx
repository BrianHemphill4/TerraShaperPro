'use client';

import { formatDistanceToNow } from 'date-fns';
import { CreditCard, Package,TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

type Period = 'day' | 'week' | 'month' | 'year';

export function CreditUsageDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  
  const { data: balance } = trpc.credit.balance.useQuery();
  const { data: transactions } = trpc.credit.transactions.useQuery({ limit: 5 });
  const { data: usage } = trpc.credit.usage.useQuery({ period });
  const { data: packages } = trpc.credit.packages.useQuery();

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('en-US').format(credits);
  };

  const getCreditColor = (balance: number) => {
    if (balance <= 0) return 'text-red-600';
    if (balance <= 10) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Current Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={getCreditColor(balance?.balance || 0)}>
              {formatCredits(balance?.balance || 0)}
            </span>
            <span className="ml-2 text-sm font-normal text-muted-foreground">credits</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {balance?.balance === 0 && 'No credits remaining. Purchase more to continue rendering.'}
            {balance?.balance && balance.balance > 0 && balance.balance <= 10 && 'Running low on credits.'}
            {balance?.balance && balance.balance > 10 && 'You have sufficient credits for rendering.'}
          </p>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>Credits used over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-2">
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          
          {usage && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Used</p>
                  <p className="text-2xl font-bold">{formatCredits(usage.totalUsed)}</p>
                </div>
                <TrendingUp className="size-8 text-muted-foreground" />
              </div>
              
              {/* Simple bar chart */}
              {usage.chartData.length > 0 && (
                <div className="space-y-2">
                  {usage.chartData.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center space-x-2">
                      <span className="w-20 text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="h-4 flex-1 rounded-full bg-secondary">
                        <div
                          className="h-4 rounded-full bg-primary"
                          style={{ width: `${(day.credits / Math.max(...usage.chartData.map(d => d.credits))) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium">{day.credits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest credit activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'}>
                    {transaction.type}
                  </Badge>
                  <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              </div>
            ))}
            
            {transactions?.hasMore && (
              <Button variant="outline" className="w-full" size="sm">
                View All Transactions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>Choose a credit package that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {packages?.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border p-4 hover:bg-accent">
                <div className="space-y-2">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div className="text-2xl font-bold">
                    ${(pkg.price_cents / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pkg.credits} credits
                    {pkg.bonus_credits > 0 && (
                      <span className="text-green-600"> +{pkg.bonus_credits} bonus</span>
                    )}
                  </p>
                  <Button className="w-full" size="sm">
                    <Package className="mr-2 size-4" />
                    Purchase
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}