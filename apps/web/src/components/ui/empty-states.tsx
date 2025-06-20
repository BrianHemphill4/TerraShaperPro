import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty state components
import { 
  FolderOpen, 
  Users, 
  FileText, 
  Search, 
  Inbox,
  Plant,
  Layers,
  MessageSquare,
} from 'lucide-react';

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
      description={query ? `No results found for "${query}"` : 'Try adjusting your search or filters.'}
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
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center pointer-events-auto">
        <div className="rounded-full bg-muted p-6 mb-4 mx-auto w-fit">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Start designing</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Add plants, draw garden beds, or import a base plan to begin.
        </p>
        <div className="flex gap-2 justify-center">
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