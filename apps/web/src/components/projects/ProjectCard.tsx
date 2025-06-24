'use client';

import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, Edit, Eye, MoreVertical, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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
                <DropdownMenuItem>
                  <Eye className="mr-2 size-4" />
                  View Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 size-4" />
                  Edit Details
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
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="text-muted-foreground flex items-center text-sm">
          <Clock className="mr-1 size-3" />
          Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
