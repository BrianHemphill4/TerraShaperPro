-- TerraShaperPro Database Schema
-- Based on the ERD from technical requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'professional', 'business', 'enterprise');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE render_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE render_provider AS ENUM ('google-imagen', 'openai-dalle');

-- Organizations table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    render_credits INTEGER DEFAULT 10 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    location GEOMETRY(Point, 4326),
    property_size_sqft INTEGER,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    status project_status DEFAULT 'draft' NOT NULL,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for location-based queries
CREATE INDEX idx_projects_location ON projects USING GIST (location);

-- Templates table
CREATE TABLE templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false NOT NULL,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    design_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Renders table
CREATE TABLE renders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    provider render_provider NOT NULL,
    status render_status DEFAULT 'pending' NOT NULL,
    processing_time_ms INTEGER,
    error_message TEXT,
    settings JSONB DEFAULT '{}' NOT NULL,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Design Elements table (for the drag-and-drop editor)
CREATE TABLE design_elements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    element_type VARCHAR(50) NOT NULL, -- 'plant', 'hardscape', 'structure', etc.
    name VARCHAR(255) NOT NULL,
    position_x DECIMAL(6, 2) NOT NULL,
    position_y DECIMAL(6, 2) NOT NULL,
    width DECIMAL(6, 2),
    height DECIMAL(6, 2),
    rotation DECIMAL(5, 2) DEFAULT 0,
    properties JSONB DEFAULT '{}' NOT NULL,
    layer_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Plant Database table
CREATE TABLE plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scientific_name VARCHAR(255) NOT NULL,
    common_names TEXT[] DEFAULT '{}',
    usda_zones TEXT[] DEFAULT '{}',
    water_needs VARCHAR(50),
    sun_requirements VARCHAR(50),
    mature_height_ft DECIMAL(5, 2),
    mature_width_ft DECIMAL(5, 2),
    growth_rate VARCHAR(50),
    texas_native BOOLEAN DEFAULT false,
    drought_tolerant BOOLEAN DEFAULT false,
    image_url TEXT,
    description TEXT,
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- API Keys table (for managing external service credentials)
CREATE TABLE api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    service VARCHAR(50) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Audit Log table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_renders_project ON renders(project_id);
CREATE INDEX idx_renders_status ON renders(status);
CREATE INDEX idx_design_elements_project ON design_elements(project_id);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_elements_updated_at BEFORE UPDATE ON design_elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();