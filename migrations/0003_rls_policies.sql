-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create helper functions
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_organization_id());

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (id = auth.user_organization_id() AND auth.user_role() = 'owner');

-- Users policies
CREATE POLICY "Users can view members of their organization"
  ON users FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.user_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.user_id());

CREATE POLICY "Owners can manage organization users"
  ON users FOR ALL
  USING (
    organization_id = auth.user_organization_id() 
    AND auth.user_role() = 'owner'
  );

-- Projects policies
CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Designers and owners can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id() 
    AND auth.user_role() IN ('owner', 'designer')
  );

CREATE POLICY "Project creators and owners can update projects"
  ON projects FOR UPDATE
  USING (
    organization_id = auth.user_organization_id() 
    AND (created_by = auth.user_id() OR auth.user_role() = 'owner')
  );

CREATE POLICY "Project creators and owners can delete projects"
  ON projects FOR DELETE
  USING (
    organization_id = auth.user_organization_id() 
    AND (created_by = auth.user_id() OR auth.user_role() = 'owner')
  );

-- Scenes policies
CREATE POLICY "Users can view scenes in their organization's projects"
  ON scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = scenes.project_id 
      AND projects.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Designers and owners can manage scenes"
  ON scenes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = scenes.project_id 
      AND projects.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'designer')
    )
  );

-- Scene versions policies
CREATE POLICY "Users can view scene versions"
  ON scene_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = scene_versions.scene_id
      AND projects.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Designers and owners can create scene versions"
  ON scene_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = scene_versions.scene_id
      AND projects.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'designer')
    )
  );

-- Annotations policies (similar pattern for other tables)
CREATE POLICY "Users can view annotations"
  ON annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scene_versions
      JOIN scenes ON scenes.id = scene_versions.scene_id
      JOIN projects ON projects.id = scenes.project_id
      WHERE scene_versions.id = annotations.scene_version_id
      AND projects.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Designers and owners can manage annotations"
  ON annotations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scene_versions
      JOIN scenes ON scenes.id = scene_versions.scene_id
      JOIN projects ON projects.id = scenes.project_id
      WHERE scene_versions.id = annotations.scene_version_id
      AND projects.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'designer')
    )
  );

-- Renders policies
CREATE POLICY "Users can view renders"
  ON renders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = renders.scene_id
      AND projects.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Designers and owners can create renders"
  ON renders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = renders.scene_id
      AND projects.organization_id = auth.user_organization_id()
      AND auth.user_role() IN ('owner', 'designer')
    )
  );

-- Templates policies
CREATE POLICY "Users can view organization templates"
  ON templates FOR SELECT
  USING (
    organization_id = auth.user_organization_id() 
    OR is_public = true
  );

CREATE POLICY "Designers and owners can create templates"
  ON templates FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id()
    AND auth.user_role() IN ('owner', 'designer')
  );

CREATE POLICY "Template creators and owners can update templates"
  ON templates FOR UPDATE
  USING (
    organization_id = auth.user_organization_id()
    AND (created_by = auth.user_id() OR auth.user_role() = 'owner')
  );

-- API Keys policies (only owners)
CREATE POLICY "Owners can view API keys"
  ON api_keys FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
    AND auth.user_role() = 'owner'
  );

CREATE POLICY "Owners can manage API keys"
  ON api_keys FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.user_role() = 'owner'
  );

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
    AND (actor_id = auth.user_id() OR auth.user_role() = 'owner')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scene_versions_scene_id ON scene_versions(scene_id);
CREATE INDEX IF NOT EXISTS idx_annotations_scene_version_id ON annotations(scene_version_id);
CREATE INDEX IF NOT EXISTS idx_renders_scene_id ON renders(scene_id);
CREATE INDEX IF NOT EXISTS idx_templates_organization_id ON templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);