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

interface Project {
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
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const statusConfig = {
    active: { label: 'Active', variant: 'default' as const },
    completed: { label: 'Completed', variant: 'secondary' as const },
    archived: { label: 'Archived', variant: 'outline' as const },
  };

  const status = statusConfig[project.status];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-muted">
          {project.thumbnailUrl && !imageError ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No preview available</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg truncate flex-1">
            <Link 
              href={`/dashboard/projects/${project.id}`}
              className="hover:underline"
            >
              {project.name}
            </Link>
          </h3>
          <Badge variant={status.variant} className="ml-2">
            {status.label}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {project.clientName && (
          <p className="text-sm text-muted-foreground mb-3">
            Client: {project.clientName}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{project.sceneCount} scenes</span>
          <span>{project.renderCount} renders</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}