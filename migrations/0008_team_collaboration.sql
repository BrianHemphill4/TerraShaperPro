-- Migration: Team Collaboration Features
-- Description: Add team invitations, enhanced roles, and activity tracking

-- Create user_roles enum
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'designer', 'member', 'viewer');

-- Update users table to use the enum
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Create invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table for team activity tracking
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Update RLS policies for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Owners and admins can view all invitations in their organization
CREATE POLICY invitations_select_policy ON invitations
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Only owners and admins can create invitations
CREATE POLICY invitations_insert_policy ON invitations
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Only owners and admins can update invitations (for revoking)
CREATE POLICY invitations_update_policy ON invitations
  FOR UPDATE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Only owners and admins can delete invitations
CREATE POLICY invitations_delete_policy ON invitations
  FOR DELETE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Update RLS policies for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- All organization members can view activity logs
CREATE POLICY activity_logs_select_policy ON activity_logs
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- System can insert activity logs (no user restriction)
CREATE POLICY activity_logs_insert_policy ON activity_logs
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id()
  );

-- Update existing RLS policies to use new role enum
-- Drop and recreate policies that reference roles

-- Users table policies
DROP POLICY IF EXISTS users_update_policy ON users;
CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (
    id = auth.user_id() OR 
    (organization_id = auth.user_organization_id() AND auth.user_role() IN ('owner', 'admin'))
  );

-- Organizations table policies  
DROP POLICY IF EXISTS organizations_update_policy ON organizations;
CREATE POLICY organizations_update_policy ON organizations
  FOR UPDATE USING (
    id = auth.user_organization_id() AND 
    auth.user_role() IN ('owner', 'admin')
  );

-- Projects table policies
DROP POLICY IF EXISTS projects_insert_policy ON projects;
CREATE POLICY projects_insert_policy ON projects
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin', 'designer')
  );

DROP POLICY IF EXISTS projects_update_policy ON projects;
CREATE POLICY projects_update_policy ON projects
  FOR UPDATE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin', 'designer')
  );

DROP POLICY IF EXISTS projects_delete_policy ON projects;
CREATE POLICY projects_delete_policy ON projects
  FOR DELETE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Add role permission check function
CREATE OR REPLACE FUNCTION auth.has_permission(required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  current_role := auth.user_role();
  
  -- Define role hierarchy
  CASE current_role
    WHEN 'owner' THEN role_hierarchy := 5;
    WHEN 'admin' THEN role_hierarchy := 4;
    WHEN 'designer' THEN role_hierarchy := 3;
    WHEN 'member' THEN role_hierarchy := 2;
    WHEN 'viewer' THEN role_hierarchy := 1;
    ELSE role_hierarchy := 0;
  END CASE;
  
  CASE required_role
    WHEN 'owner' THEN required_hierarchy := 5;
    WHEN 'admin' THEN required_hierarchy := 4;
    WHEN 'designer' THEN required_hierarchy := 3;
    WHEN 'member' THEN required_hierarchy := 2;
    WHEN 'viewer' THEN required_hierarchy := 1;
    ELSE required_hierarchy := 0;
  END CASE;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;