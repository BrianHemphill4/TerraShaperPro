import { supabase } from '@terrashaper/db';

export type TeamService = {
  createTeam: (data: CreateTeamInput) => Promise<Team>;
  findTeamById: (id: string) => Promise<Team | null>;
  updateTeam: (id: string, data: UpdateTeamInput) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  
  addMember: (teamId: string, userId: string, role: string) => Promise<TeamMember>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  updateMemberRole: (teamId: string, userId: string, role: string) => Promise<TeamMember>;
  getTeamMembers: (teamId: string) => Promise<TeamMember[]>;
}

export type CreateTeamInput = {
  name: string;
  organization_id: string;
  created_by: string;
  metadata?: Record<string, any>;
}

export type UpdateTeamInput = {
  name?: string;
  metadata?: Record<string, any>;
}

export type Team = {
  id: string;
  name: string;
  organization_id: string;
  created_by: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export class TeamServiceImpl implements TeamService {
  async createTeam(data: CreateTeamInput): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return team;
  }

  async findTeamById(id: string): Promise<Team | null> {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return team;
  }

  async updateTeam(id: string, data: UpdateTeamInput): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        ...data,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async addMember(teamId: string, userId: string, role: string): Promise<TeamMember> {
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
        joined_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: member.id,
      userId: member.user_id,
      teamId: member.team_id,
      role: member.role,
      joinedAt: member.joined_at,
    };
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async updateMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember> {
    const { data: member, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: member.id,
      userId: member.user_id,
      teamId: member.team_id,
      role: member.role,
      joinedAt: member.joined_at,
    };
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*, users(id, email, name, avatar_url)')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    
    return (members || []).map(member => ({
      id: member.id,
      userId: member.user_id,
      teamId: member.team_id,
      role: member.role,
      joinedAt: member.joined_at,
      user: member.users ? {
        id: member.users.id,
        email: member.users.email,
        name: member.users.name,
        avatar: member.users.avatar_url,
      } : undefined,
    }));
  }
}

export const teamService = new TeamServiceImpl();