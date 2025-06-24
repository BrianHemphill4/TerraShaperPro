'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { metrics } from '@/lib/metrics';

type MetricStat = {
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
};

type BudgetViolation = {
  metric: string;
  budget: number;
  current: number;
};

export function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<{
    metrics: Record<string, MetricStat>;
    violations: BudgetViolation[];
  }>({ metrics: {}, violations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      const summary = metrics.getPerformanceSummary();
      setPerformanceData(summary);
      setLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatMetricName = (name: string): string => {
    return name
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const formatValue = (value: number, metric: string): string => {
    if (metric.includes('size') || metric.includes('memory')) {
      return `${(value / 1024).toFixed(2)} KB`;
    }
    if (metric.includes('rate') || metric.includes('percentage')) {
      return `${value.toFixed(2)}%`;
    }
    return `${value.toFixed(2)} ms`;
  };

  const getHealthStatus = (violations: BudgetViolation[]) => {
    if (violations.length === 0) return 'healthy';
    if (violations.length <= 2) return 'warning';
    return 'critical';
  };

  const healthStatus = getHealthStatus(performanceData.violations);

  if (loading) {
    return <div>Loading performance metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        <div className="flex items-center gap-2">
          {healthStatus === 'healthy' && <CheckCircle className="size-5 text-green-500" />}
          {healthStatus === 'warning' && <AlertTriangle className="size-5 text-yellow-500" />}
          {healthStatus === 'critical' && <AlertTriangle className="size-5 text-red-500" />}
          <span className="text-sm font-medium">
            System {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
          </span>
        </div>
      </div>

      {performanceData.violations.length > 0 && (
        <Alert variant={healthStatus === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="size-4" />
          <AlertTitle>Performance Budget Violations</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {performanceData.violations.map((violation, index) => (
                <li key={index}>
                  <strong>{formatMetricName(violation.metric)}</strong>:{' '}
                  {formatValue(violation.current, violation.metric)} (budget:{' '}
                  {formatValue(violation.budget, violation.metric)})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="frontend">Frontend Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(performanceData.metrics)
              .slice(0, 6)
              .map(([metric, stats]) => (
                <Card key={metric}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {formatMetricName(metric)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatValue(stats.avg, metric)}</div>
                    <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                      <div>Min: {formatValue(stats.min, metric)}</div>
                      <div>Max: {formatValue(stats.max, metric)}</div>
                      <div>P95: {formatValue(stats.p95, metric)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(performanceData.metrics)
              .filter(([metric]) => metric.startsWith('api.') || metric.startsWith('trpc.'))
              .map(([metric, stats]) => (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {formatMetricName(metric)}
                    </CardTitle>
                    <CardDescription>Average: {formatValue(stats.avg, metric)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Performance</span>
                        <span className="text-sm font-medium">
                          P95: {formatValue(stats.p95, metric)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats.avg / stats.p95) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(performanceData.metrics)
              .filter(
                ([metric]) =>
                  metric.includes('component') ||
                  metric.includes('canvas') ||
                  metric.includes('webvital')
              )
              .map(([metric, stats]) => (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {formatMetricName(metric)}
                    </CardTitle>
                    <CardDescription>Average: {formatValue(stats.avg, metric)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Performance</span>
                        <span className="text-sm font-medium">
                          P99: {formatValue(stats.p99, metric)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats.avg / stats.p99) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
