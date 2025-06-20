-- Migration: Client Portal Features
-- Description: Add client access links, approvals, and comments

-- Create client_access_links table
CREATE TABLE client_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  client_email VARCHAR(255),
  client_name VARCHAR(255),
  permissions JSONB DEFAULT '{"view": true, "comment": true, "approve": false}',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_approvals table
CREATE TABLE project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  approved_by VARCHAR(255), -- Can be client email or user ID
  client_access_link_id UUID REFERENCES client_access_links(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_comments table
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_email VARCHAR(255), -- For client comments
  author_name VARCHAR(255), -- For client comments
  client_access_link_id UUID REFERENCES client_access_links(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  position JSONB, -- For positioned comments on canvas {"x": 100, "y": 200}
  attachments JSONB DEFAULT '[]',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_client_access_links_project_id ON client_access_links(project_id);
CREATE INDEX idx_client_access_links_token ON client_access_links(token);
CREATE INDEX idx_client_access_links_is_active ON client_access_links(is_active);

CREATE INDEX idx_project_approvals_project_id ON project_approvals(project_id);
CREATE INDEX idx_project_approvals_status ON project_approvals(status);
CREATE INDEX idx_project_approvals_client_access_link_id ON project_approvals(client_access_link_id);

CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX idx_project_comments_parent_id ON project_comments(parent_id);
CREATE INDEX idx_project_comments_author_id ON project_comments(author_id);
CREATE INDEX idx_project_comments_client_access_link_id ON project_comments(client_access_link_id);

-- RLS Policies for client_access_links
ALTER TABLE client_access_links ENABLE ROW LEVEL SECURITY;

-- Team members can view all client links for their organization's projects
CREATE POLICY client_access_links_select_policy ON client_access_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = client_access_links.project_id
      AND p.organization_id = auth.user_organization_id()
    )
  );

-- Only designers and above can create client links
CREATE POLICY client_access_links_insert_policy ON client_access_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = client_access_links.project_id
      AND p.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'admin', 'designer')
    )
  );

-- Only the creator or admins can update client links
CREATE POLICY client_access_links_update_policy ON client_access_links
  FOR UPDATE USING (
    created_by = auth.user_id() OR auth.user_role() IN ('owner', 'admin')
  );

-- Only the creator or admins can delete client links
CREATE POLICY client_access_links_delete_policy ON client_access_links
  FOR DELETE USING (
    created_by = auth.user_id() OR auth.user_role() IN ('owner', 'admin')
  );

-- RLS Policies for project_approvals
ALTER TABLE project_approvals ENABLE ROW LEVEL SECURITY;

-- Team members can view approvals for their organization's projects
CREATE POLICY project_approvals_select_policy ON project_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_approvals.project_id
      AND p.organization_id = auth.user_organization_id()
    )
  );

-- Designers and above can create approval requests
CREATE POLICY project_approvals_insert_policy ON project_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_approvals.project_id
      AND p.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'admin', 'designer')
    )
  );

-- Only admins can update approval status
CREATE POLICY project_approvals_update_policy ON project_approvals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_approvals.project_id
      AND p.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'admin')
    )
  );

-- RLS Policies for project_comments
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Team members can view comments for their organization's projects
CREATE POLICY project_comments_select_policy ON project_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.organization_id = auth.user_organization_id()
    )
  );

-- All team members can create comments
CREATE POLICY project_comments_insert_policy ON project_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_comments.project_id
      AND p.organization_id = auth.user_organization_id()
    )
  );

-- Users can update their own comments
CREATE POLICY project_comments_update_policy ON project_comments
  FOR UPDATE USING (
    author_id = auth.user_id()
  );

-- Users can delete their own comments, admins can delete any
CREATE POLICY project_comments_delete_policy ON project_comments
  FOR DELETE USING (
    author_id = auth.user_id() OR auth.user_role() IN ('owner', 'admin')
  );

-- Create function to generate client access tokens
CREATE OR REPLACE FUNCTION generate_client_access_token()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create view for client portal access (no auth required)
CREATE VIEW client_portal_projects AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.thumbnail,
  p.status,
  cal.token,
  cal.permissions,
  cal.client_email,
  cal.client_name,
  cal.expires_at
FROM projects p
JOIN client_access_links cal ON p.id = cal.project_id
WHERE cal.is_active = true
  AND (cal.expires_at IS NULL OR cal.expires_at > CURRENT_TIMESTAMP);