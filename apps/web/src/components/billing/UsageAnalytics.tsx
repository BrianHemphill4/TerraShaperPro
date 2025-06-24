'use client';

import { Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function UsageAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: analytics } = api.billing.getUsageAnalytics.useQuery({ timeRange });
  const { data: breakdown } = api.billing.getUsageBreakdown.useQuery();

  if (!analytics || !breakdown) {
    return <div>Loading analytics...</div>;
  }

  const exportUsageReport = () => {
    window.open(`/api/billing/usage/export?timeRange=${timeRange}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor your resource consumption and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportUsageReport}>
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Render Credits Usage</CardTitle>
            <CardDescription>Daily render credit consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.renderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="credits"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Growth</CardTitle>
            <CardDescription>Storage usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.storageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={(value) => formatBytes(value * 1024 * 1024 * 1024).split(' ')[0]}
                />
                <Tooltip formatter={(value: number) => formatBytes(value * 1024 * 1024 * 1024)} />
                <Line type="monotone" dataKey="storage" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Usage Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project Usage</CardTitle>
            <CardDescription>Credits by project</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={breakdown.projects}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="credits"
                  label={(entry) => `${entry.name}: ${entry.credits}`}
                >
                  {breakdown.projects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Member Activity</CardTitle>
            <CardDescription>Credits by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {breakdown.teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full text-sm font-medium">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <Badge variant="outline">{member.credits} credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>Usage by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={breakdown.resourceTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Peak Usage Times */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Usage Patterns</CardTitle>
          <CardDescription>Identify your busiest periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Hourly Distribution</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={analytics.hourlyDistribution}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm font-medium">Peak Usage Day</p>
                <p className="text-2xl font-bold">{analytics.peakDay}</p>
                <p className="text-muted-foreground text-sm">{analytics.peakDayUsage} credits</p>
              </div>
              <div>
                <p className="text-sm font-medium">Average Daily Usage</p>
                <p className="text-2xl font-bold">{analytics.avgDailyUsage}</p>
                <p className="text-muted-foreground text-sm">credits per day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage Forecast</CardTitle>
              <CardDescription>Predicted usage for the current billing period</CardDescription>
            </div>
            <TrendingUp className="text-muted-foreground size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Projected Renders</p>
                <p className="text-2xl font-bold">{analytics.projectedRenders}</p>
                <Progress
                  value={(analytics.projectedRenders / analytics.renderLimit) * 100}
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Projected Storage</p>
                <p className="text-2xl font-bold">
                  {formatBytes(analytics.projectedStorage * 1024 * 1024 * 1024)}
                </p>
                <Progress
                  value={(analytics.projectedStorage / analytics.storageLimit) * 100}
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Overages</p>
                <p className="text-2xl font-bold text-yellow-600">${analytics.estimatedOverages}</p>
                <p className="text-muted-foreground mt-1 text-sm">if current pace continues</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
