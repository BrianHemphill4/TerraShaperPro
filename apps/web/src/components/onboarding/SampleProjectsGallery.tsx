'use client';

import { Clock, Layers, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type SampleProject, sampleProjects } from '@/lib/sampleProjects';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const categoryIcons = {
  residential: '🏡',
  commercial: '🏢',
  xeriscape: '🌵',
};

type SampleProjectCardProps = {
  project: SampleProject;
  onSelect: (project: SampleProject) => void;
};

function SampleProjectCard({ project, onSelect }: SampleProjectCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => onSelect(project)}
    >
      <CardHeader>
        <div className="mb-2 flex items-start justify-between">
          <span className="text-2xl">{categoryIcons[project.category]}</span>
          <Badge className={cn('ml-2', difficultyColors[project.difficulty])}>
            {project.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{project.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="size-4" />
            <span>{project.features.length} features</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {project.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {project.features.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.features.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SampleProjectsGallery() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | SampleProject['category']>(
    'all'
  );

  const filteredProjects =
    selectedCategory === 'all'
      ? sampleProjects
      : sampleProjects.filter((p) => p.category === selectedCategory);

  const handleSelectProject = async (project: SampleProject) => {
    // Store the selected project in localStorage
    localStorage.setItem('pendingSampleProject', JSON.stringify(project));

    // Navigate to the design page
    router.push('/design');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Start with a Sample Project</h2>
        <p className="text-muted-foreground">
          Choose a template to learn the basics or get inspired for your own design
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={(v) => setSelectedCategory(v as any)}
      >
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="residential">Residential</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="xeriscape">Xeriscape</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <SampleProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => router.push('/design')}>
          <Sparkles className="mr-2 size-4" />
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}
