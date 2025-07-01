import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  FolderOpen,
  Inbox,
  Layers,
  MessageSquare,
  Plant,
  Search,
  Users,
  Upload,
  Image,
  Map,
  Ruler,
  Clock,
  FileQuestion,
  MousePointer,
  Palette,
  Plus,
  PlayCircle,
  Keyboard,
  HelpCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="bg-muted mb-4 rounded-full p-4">
        <Icon className="text-muted-foreground size-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm text-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'default'} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoProjectsEmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create your first landscape design project to get started."
      action={{
        label: 'Create Project',
        onClick: onCreateProject,
      }}
    />
  );
}

export function NoTeamMembersEmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Invite team members to collaborate on your landscape designs."
      action={{
        label: 'Invite Members',
        onClick: onInvite,
      }}
    />
  );
}

export function NoResultsEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query ? `No results found for "${query}"` : 'Try adjusting your search or filters.'
      }
    />
  );
}

export function NoPlantsEmptyState() {
  return (
    <EmptyState
      icon={Plant}
      title="No plants in this category"
      description="Try selecting a different category or adjusting your filters."
    />
  );
}

export function NoLayersEmptyState({ onCreateLayer }: { onCreateLayer: () => void }) {
  return (
    <EmptyState
      icon={Layers}
      title="No layers yet"
      description="Organize your design by creating layers for different elements."
      action={{
        label: 'Create Layer',
        onClick: onCreateLayer,
        variant: 'outline',
      }}
    />
  );
}

export function NoCommentsEmptyState() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No comments yet"
      description="Be the first to leave feedback on this design."
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={Inbox}
      title="All caught up!"
      description="You have no new notifications at the moment."
    />
  );
}

export function EmptyCanvas({ onAddElement }: { onAddElement: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto text-center">
        <div className="bg-muted mx-auto mb-4 w-fit rounded-full p-6">
          <FileText className="text-muted-foreground size-12" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Start designing</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Add plants, draw garden beds, or import a base plan to begin.
        </p>
        <div className="flex justify-center gap-2">
          <Button onClick={onAddElement} size="sm">
            Add Element
          </Button>
          <Button variant="outline" size="sm">
            Import Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NoScenesEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={Upload}
      title="No scenes uploaded yet"
      description="Upload your first scene to start annotating landscape elements."
      action={{
        label: 'Upload Scene',
        onClick: onUpload,
      }}
    />
  );
}

export function NoAnnotationsEmptyState({ onStartAnnotating }: { onStartAnnotating: () => void }) {
  return (
    <EmptyState
      icon={MousePointer}
      title="No annotations yet"
      description="Select a tool from the palette and start drawing on the canvas."
      action={{
        label: 'View Tool Guide',
        onClick: onStartAnnotating,
        variant: 'outline',
      }}
    />
  );
}

export function NoMeasurementsEmptyState({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <EmptyState
      icon={Ruler}
      title="No measurements taken"
      description="Use the measurement tools to calculate distances and areas."
      action={{
        label: 'Learn About Measurements',
        onClick: onLearnMore,
        variant: 'outline',
      }}
    />
  );
}

export function EmptyHistoryState() {
  return (
    <EmptyState
      icon={Clock}
      title="No history yet"
      description="Your annotation history will appear here as you work."
    />
  );
}

interface InteractiveEmptyStateProps {
  type: 'first-annotation' | 'first-project' | 'upload-scene';
  onComplete?: () => void;
}

export function InteractiveEmptyState({ type, onComplete }: InteractiveEmptyStateProps) {
  const [step, setStep] = React.useState(0);

  const tutorials = {
    'first-annotation': [
      {
        icon: <Palette className="w-8 h-8" />,
        title: 'Choose a Tool',
        description: 'Select a drawing tool from the palette',
      },
      {
        icon: <MousePointer className="w-8 h-8" />,
        title: 'Draw on Canvas',
        description: 'Click and drag to create shapes',
      },
      {
        icon: <Map className="w-8 h-8" />,
        title: 'Categorize',
        description: 'Assign categories to your annotations',
      },
    ],
    'first-project': [
      {
        icon: <Plus className="w-8 h-8" />,
        title: 'Create Project',
        description: 'Start with a project name and description',
      },
      {
        icon: <Image className="w-8 h-8" />,
        title: 'Upload Scenes',
        description: 'Add aerial photos or site images',
      },
      {
        icon: <Map className="w-8 h-8" />,
        title: 'Start Annotating',
        description: 'Draw and categorize landscape elements',
      },
    ],
    'upload-scene': [
      {
        icon: <Upload className="w-8 h-8" />,
        title: 'Select Files',
        description: 'Choose images from your computer',
      },
      {
        icon: <Image className="w-8 h-8" />,
        title: 'Preview',
        description: 'Review your uploaded scenes',
      },
      {
        icon: <PlayCircle className="w-8 h-8" />,
        title: 'Begin',
        description: 'Start annotating your first scene',
      },
    ],
  };

  const currentTutorial = tutorials[type];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to TerraShaper Pro
        </h2>
        <p className="text-gray-600">
          Let's get you started with your first {type.replace('-', ' ')}
        </p>
      </div>

      <div className="flex justify-between mb-8">
        {currentTutorial.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 text-center px-4",
              index <= step ? "opacity-100" : "opacity-40"
            )}
          >
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors",
              index === step
                ? "bg-blue-100 text-blue-600"
                : index < step
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400"
            )}>
              {item.icon}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {currentTutorial.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === step ? "bg-blue-600" : "bg-gray-300"
            )}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            Previous
          </Button>
        )}
        
        {step < currentTutorial.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={onComplete}>
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
}

interface SampleProjectPromptProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function SampleProjectPrompt({ onAccept, onDecline }: SampleProjectPromptProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">
            Want to try a sample project?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We can create a demo project with sample scenes to help you explore the annotation features.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAccept}>
              Yes, create sample
            </Button>
            <Button size="sm" variant="outline" onClick={onDecline}>
              No thanks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyboardShortcutHintProps {
  shortcuts: Array<{
    key: string;
    description: string;
  }>;
  onDismiss?: () => void;
}

export function KeyboardShortcutHint({ shortcuts, onDismiss }: KeyboardShortcutHintProps) {
  return (
    <div className="bg-gray-900 text-white rounded-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Keyboard Shortcuts
        </h4>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between text-sm">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-gray-300">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
