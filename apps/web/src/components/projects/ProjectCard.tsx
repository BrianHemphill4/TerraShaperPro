'use client';

import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, Edit, Eye, MoreVertical, Trash, Map, Ruler, Tag, TrendingUp, Download, Share2, Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AnnotationStats = {
  totalArea: number;
  totalAreaUnit: 'acres' | 'hectares';
  totalLength: number;
  totalLengthUnit: 'feet' | 'meters';
  masksByCategory: Record<string, number>;
  annotationCount: number;
  completedScenes: number;
  lastAnnotatedAt?: string;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  thumbnailUrl?: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
  sceneCount: number;
  renderCount: number;
  annotationStats?: AnnotationStats;
  recentSceneThumbnails?: string[];
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const statusConfig = {
    active: { label: 'Active', variant: 'default' as const },
    completed: { label: 'Completed', variant: 'secondary' as const },
    archived: { label: 'Archived', variant: 'outline' as const },
  };

  const status = statusConfig[project.status];

  const completionPercentage = useMemo(() => {
    if (!project.annotationStats || project.sceneCount === 0) return 0;
    return Math.round((project.annotationStats.completedScenes / project.sceneCount) * 100);
  }, [project.annotationStats, project.sceneCount]);

  const categoryColors: Record<string, string> = {
    'irrigation': '#3B82F6',
    'planting': '#10B981',
    'structures': '#F59E0B',
    'boundaries': '#8B5CF6',
    'other': '#6B7280',
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="bg-muted relative h-48">
          {project.thumbnailUrl && !imageError ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="text-center">
                <Calendar className="mx-auto mb-2 size-12" />
                <p className="text-sm">No preview available</p>
              </div>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Eye className="mr-2 size-4" />
                    View Project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}?tab=annotations`}>
                    <Map className="mr-2 size-4" />
                    View Annotations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 size-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 size-4" />
                  Export Statistics
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 size-4" />
                  Share Summary
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Duplicate with Annotations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 size-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="flex-1 truncate text-lg font-semibold">
            <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </h3>
          <Badge variant={status.variant} className="ml-2">
            {status.label}
          </Badge>
        </div>

        {project.description && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{project.description}</p>
        )}

        {project.clientName && (
          <p className="text-muted-foreground mb-3 text-sm">Client: {project.clientName}</p>
        )}

        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span>{project.sceneCount} scenes</span>
          <span>{project.renderCount} renders</span>
        </div>

        {project.annotationStats && (
          <>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Annotation Progress</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Map className="size-4 text-muted-foreground" />
                <span>
                  {project.annotationStats.totalArea.toFixed(1)} {project.annotationStats.totalAreaUnit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="size-4 text-muted-foreground" />
                <span>
                  {project.annotationStats.totalLength.toFixed(0)} {project.annotationStats.totalLengthUnit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                <span>{project.annotationStats.annotationCount} annotations</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                <span>{project.annotationStats.completedScenes} completed</span>
              </div>
            </div>

            {Object.keys(project.annotationStats.masksByCategory).length > 0 && (
              <div className="mt-3">
                <div className="flex gap-1">
                  {Object.entries(project.annotationStats.masksByCategory).map(([category, count]) => (
                    <div
                      key={category}
                      className="h-2 transition-all duration-300"
                      style={{
                        backgroundColor: categoryColors[category] || categoryColors.other,
                        width: `${(count / project.annotationStats!.annotationCount) * 100}%`,
                      }}
                      title={`${category}: ${count} annotations`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(project.annotationStats.masksByCategory)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 text-xs"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: categoryColors[category] || categoryColors.other,
                          }}
                        />
                        {category} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}

            {project.recentSceneThumbnails && project.recentSceneThumbnails.length > 0 && (
              <div className="mt-3 flex gap-1">
                {project.recentSceneThumbnails.slice(0, 4).map((thumb, index) => (
                  <div
                    key={index}
                    className="relative size-12 overflow-hidden rounded border border-muted"
                  >
                    <Image
                      src={thumb}
                      alt={`Scene ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {project.sceneCount > 4 && (
                  <div className="flex size-12 items-center justify-center rounded border border-muted bg-muted text-xs text-muted-foreground">
                    +{project.sceneCount - 4}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center">
            <Clock className="mr-1 size-3" />
            Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
          {project.annotationStats?.lastAnnotatedAt && (
            <Badge variant="outline" className="text-xs">
              <Map className="mr-1 size-3" />
              Annotated {formatDistanceToNow(new Date(project.annotationStats.lastAnnotatedAt), { addSuffix: true })}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
