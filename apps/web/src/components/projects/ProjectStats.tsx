'use client';

import { Archive, CheckCircle, Folder, PlayCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatsData = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
}

type ProjectStatsProps = {
  stats?: StatsData | null;
  isLoading?: boolean;
}

export function ProjectStats({ stats, isLoading }: ProjectStatsProps) {
  const cards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: Folder,
    },
    {
      label: 'Active',
      value: stats?.activeProjects ?? 0,
      icon: PlayCircle,
    },
    {
      label: 'Completed',
      value: stats?.completedProjects ?? 0,
      icon: CheckCircle,
    },
    {
      label: 'Archived',
      value: stats?.archivedProjects ?? 0,
      icon: Archive,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 