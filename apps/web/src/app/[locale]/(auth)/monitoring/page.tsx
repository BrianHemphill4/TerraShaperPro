import { Metadata } from 'next';
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';

export const metadata: Metadata = {
  title: 'Performance Monitoring | TerraShaper Pro',
  description: 'Monitor application performance metrics and budgets',
};

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-8">
      <PerformanceDashboard />
    </div>
  );
}