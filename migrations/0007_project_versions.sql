-- 0007_project_versions.sql

-- Create project_versions table
CREATE TABLE project_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    snapshot JSONB NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for fast querying by project and created_at
CREATE INDEX idx_project_versions_project_id_created_at ON project_versions(project_id, created_at DESC);

-- Seed: create an initial version for the first few existing projects (if any)
INSERT INTO project_versions (project_id, created_by, snapshot, comment)
SELECT id, created_by, jsonb_build_object('name', name, 'description', description, 'status', status), 'Initial version'
FROM projects
ORDER BY created_at
LIMIT 5; 