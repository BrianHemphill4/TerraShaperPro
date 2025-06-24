import { supabase } from '@terrashaper/db';

export interface ProjectService {
  create(data: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findByOrganizationId(organizationId: string): Promise<Project[]>;
  update(id: string, data: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
  createVersion(data: CreateVersionInput): Promise<ProjectVersion>;
  getVersions(projectId: string): Promise<ProjectVersion[]>;
  getStats(organizationId: string): Promise<ProjectStats>;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  organization_id: string;
  user_id: string;
  canvas_data?: any;
  metadata?: Record<string, any>;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  canvas_data?: any;
  metadata?: Record<string, any>;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  user_id: string;
  canvas_data?: any;
  metadata?: Record<string, any>;
  status?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVersionInput {
  project_id: string;
  version_number: number;
  canvas_data: any;
  metadata?: Record<string, any>;
  created_by: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  canvas_data: any;
  metadata?: Record<string, any>;
  created_by: string;
  created_at: Date;
}

export interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  projectId: string;
  projectName: string;
  action: 'created' | 'updated' | 'rendered';
  timestamp: Date;
  userId: string;
  userName?: string;
}

export class ProjectServiceImpl implements ProjectService {
  async create(data: CreateProjectInput): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return project;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return projects || [];
  }

  async findByOrganizationId(organizationId: string): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return projects || [];
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return project;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async createVersion(data: CreateVersionInput): Promise<ProjectVersion> {
    const { data: version, error } = await supabase
      .from('project_versions')
      .insert({
        ...data,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return version;
  }

  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    const { data: versions, error } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return versions || [];
  }

  async getStats(organizationId: string): Promise<ProjectStats> {
    // Get total count and status breakdown
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, created_at, updated_at')
      .eq('organization_id', organizationId);

    const total = projects?.length || 0;
    
    const byStatus = projects?.reduce((acc, project) => {
      const status = project.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent activity
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('id, name, created_at, updated_at, user_id, users(name)')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(10);

    const { data: recentRenders } = await supabase
      .from('renders')
      .select('id, project_id, created_at, user_id, projects(name), users(name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    const activities: RecentActivity[] = [];

    // Add project activities
    recentProjects?.forEach(project => {
      if (project.created_at === project.updated_at) {
        activities.push({
          projectId: project.id,
          projectName: project.name,
          action: 'created',
          timestamp: new Date(project.created_at),
          userId: project.user_id,
          userName: (project.users as any)?.name,
        });
      } else {
        activities.push({
          projectId: project.id,
          projectName: project.name,
          action: 'updated',
          timestamp: new Date(project.updated_at),
          userId: project.user_id,
          userName: (project.users as any)?.name,
        });
      }
    });

    // Add render activities
    recentRenders?.forEach(render => {
      activities.push({
        projectId: render.project_id,
        projectName: (render.projects as any)?.name || 'Unknown Project',
        action: 'rendered',
        timestamp: new Date(render.created_at),
        userId: render.user_id,
        userName: (render.users as any)?.name,
      });
    });

    // Sort by timestamp and take top 10
    const recentActivity = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      total,
      byStatus,
      recentActivity,
    };
  }
}

export const projectService = new ProjectServiceImpl();