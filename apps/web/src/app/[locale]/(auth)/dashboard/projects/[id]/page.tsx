'use client';

import { useParams } from 'next/navigation';

import { VersionTimeline } from '@/components/projects/VersionTimeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : (params as any)?.id;

  const { data: project, isLoading } = (trpc as any).project.get.useQuery({ id: projectId }, {
    enabled: !!projectId,
  });

  if (isLoading || !project) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-6 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          {/* Placeholder for additional project overview content */}
          <p className="text-muted-foreground">Overview content coming soon.</p>
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <VersionTimeline projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 