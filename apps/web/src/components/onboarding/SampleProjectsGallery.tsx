'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sampleProjects, type SampleProject } from '@/lib/sample-projects';
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

interface SampleProjectCardProps {
  project: SampleProject;
  onSelect: (project: SampleProject) => void;
}

function SampleProjectCard({ project, onSelect }: SampleProjectCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => onSelect(project)}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{categoryIcons[project.category]}</span>
          <Badge className={cn('ml-2', difficultyColors[project.difficulty])}>
            {project.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{project.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | SampleProject['category']>('all');

  const filteredProjects = selectedCategory === 'all' 
    ? sampleProjects 
    : sampleProjects.filter(p => p.category === selectedCategory);

  const handleSelectProject = async (project: SampleProject) => {
    // Store the selected project in localStorage
    localStorage.setItem('pendingSampleProject', JSON.stringify(project));
    
    // Navigate to the design page
    router.push('/design');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Start with a Sample Project</h2>
        <p className="text-muted-foreground">
          Choose a template to learn the basics or get inspired for your own design
        </p>
      </div>

      <Tabs defaultValue="all" value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
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

      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={() => router.push('/design')}>
          <Sparkles className="w-4 h-4 mr-2" />
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}