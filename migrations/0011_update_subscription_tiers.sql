-- Migration: Update Subscription Tiers
-- Description: Update subscription plans to Starter/Pro/Growth tiers with enhanced features and limits

-- First, update the subscription_tier enum type
ALTER TYPE subscription_tier RENAME TO subscription_tier_old;

CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'growth', 'enterprise');

-- Update the columns that use this type
ALTER TABLE subscription_plans 
  ALTER COLUMN tier TYPE subscription_tier USING tier::text::subscription_tier;

ALTER TABLE subscription_events
  ALTER COLUMN from_tier TYPE subscription_tier USING from_tier::text::subscription_tier,
  ALTER COLUMN to_tier TYPE subscription_tier USING to_tier::text::subscription_tier;

-- Drop the old type
DROP TYPE subscription_tier_old;

-- Clear existing plans
DELETE FROM subscription_plans;

-- Insert new subscription plans with enhanced features and usage limits
INSERT INTO subscription_plans (
  name, 
  stripe_price_id, 
  tier, 
  price_monthly, 
  price_yearly, 
  render_credits_monthly, 
  max_projects, 
  max_team_members, 
  features
) VALUES
(
  'Starter',
  'price_starter_monthly',
  'starter',
  0,
  0,
  25,
  5,
  1,
  jsonb_build_object(
    'watermark', true,
    'export_formats', ARRAY['png', 'jpg'],
    'support', 'community',
    'custom_branding', false,
    'api_access', false,
    'sso', false,
    'max_storage_gb', 5,
    'max_renders_per_month', 25,
    'render_resolution', 'standard',
    'canvas_size_limit', '2000x2000',
    'version_history_days', 7,
    'priority_support', false,
    'white_label', false,
    'bulk_export', false,
    'advanced_analytics', false,
    'client_portal', false,
    'team_collaboration', false
  )
),
(
  'Professional',
  'price_professional_monthly',
  'professional',
  29,
  290,
  100,
  25,
  5,
  jsonb_build_object(
    'watermark', false,
    'export_formats', ARRAY['png', 'jpg', 'svg', 'pdf'],
    'support', 'email',
    'custom_branding', true,
    'api_access', false,
    'sso', false,
    'max_storage_gb', 50,
    'max_renders_per_month', 100,
    'render_resolution', 'high',
    'canvas_size_limit', '5000x5000',
    'version_history_days', 30,
    'priority_support', false,
    'white_label', false,
    'bulk_export', true,
    'advanced_analytics', false,
    'client_portal', true,
    'team_collaboration', true
  )
),
(
  'Growth',
  'price_growth_monthly',
  'growth',
  79,
  790,
  500,
  100,
  20,
  jsonb_build_object(
    'watermark', false,
    'export_formats', ARRAY['png', 'jpg', 'svg', 'pdf', 'dxf'],
    'support', 'priority',
    'custom_branding', true,
    'api_access', true,
    'sso', false,
    'max_storage_gb', 200,
    'max_renders_per_month', 500,
    'render_resolution', 'ultra',
    'canvas_size_limit', '10000x10000',
    'version_history_days', 90,
    'priority_support', true,
    'white_label', true,
    'bulk_export', true,
    'advanced_analytics', true,
    'client_portal', true,
    'team_collaboration', true
  )
),
(
  'Enterprise',
  'price_enterprise_custom',
  'enterprise',
  299,
  2990,
  -1, -- Unlimited
  -1, -- Unlimited
  -1, -- Unlimited
  jsonb_build_object(
    'watermark', false,
    'export_formats', ARRAY['png', 'jpg', 'svg', 'pdf', 'dxf', 'dwg'],
    'support', 'dedicated',
    'custom_branding', true,
    'api_access', true,
    'sso', true,
    'max_storage_gb', -1, -- Unlimited
    'max_renders_per_month', -1, -- Unlimited
    'render_resolution', 'ultra',
    'canvas_size_limit', 'unlimited',
    'version_history_days', -1, -- Unlimited
    'priority_support', true,
    'white_label', true,
    'bulk_export', true,
    'advanced_analytics', true,
    'client_portal', true,
    'team_collaboration', true,
    'custom_contract', true,
    'dedicated_account_manager', true,
    'sla', true,
    'custom_integrations', true
  )
);

-- Add yearly pricing variants
INSERT INTO subscription_plans (
  name, 
  stripe_price_id, 
  tier, 
  price_monthly, 
  price_yearly, 
  render_credits_monthly, 
  max_projects, 
  max_team_members, 
  features
) 
SELECT 
  name || ' (Yearly)',
  stripe_price_id || '_yearly',
  tier,
  price_monthly,
  price_yearly,
  render_credits_monthly,
  max_projects,
  max_team_members,
  features || jsonb_build_object('billing_period', 'yearly')
FROM subscription_plans
WHERE price_yearly > 0;

-- Create a function to check feature access
CREATE OR REPLACE FUNCTION check_feature_access(
  org_id UUID,
  feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  plan_features JSONB;
  feature_value JSONB;
BEGIN
  -- Get the organization's current plan features
  SELECT sp.features INTO plan_features
  FROM organizations o
  JOIN subscription_plans sp ON sp.stripe_price_id = 
    CASE 
      WHEN o.stripe_subscription_status = 'active' THEN 
        (SELECT stripe_price_id FROM subscription_plans WHERE tier = 
          COALESCE(
            (SELECT tier FROM subscription_plans WHERE stripe_price_id = o.stripe_price_id LIMIT 1),
            'starter'
          )
        LIMIT 1)
      ELSE 'price_starter_monthly'
    END
  WHERE o.id = org_id;

  -- Return false if no plan found
  IF plan_features IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get the specific feature value
  feature_value := plan_features->feature_name;

  -- Handle different types of feature values
  CASE jsonb_typeof(feature_value)
    WHEN 'boolean' THEN
      RETURN feature_value::boolean;
    WHEN 'number' THEN
      RETURN feature_value::int > 0;
    WHEN 'string' THEN
      RETURN feature_value::text != 'none';
    WHEN 'array' THEN
      RETURN jsonb_array_length(feature_value) > 0;
    ELSE
      RETURN feature_value IS NOT NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  org_id UUID,
  limit_type TEXT,
  current_usage INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  plan_features JSONB;
  limit_value INTEGER;
  limit_key TEXT;
BEGIN
  -- Map limit types to feature keys
  limit_key := CASE limit_type
    WHEN 'projects' THEN 'max_projects'
    WHEN 'team_members' THEN 'max_team_members'
    WHEN 'renders' THEN 'max_renders_per_month'
    WHEN 'storage_gb' THEN 'max_storage_gb'
    ELSE limit_type
  END;

  -- Get the organization's current plan
  SELECT sp.features, 
         CASE 
           WHEN limit_key = 'max_projects' THEN sp.max_projects
           WHEN limit_key = 'max_team_members' THEN sp.max_team_members
           ELSE (sp.features->>limit_key)::int
         END INTO plan_features, limit_value
  FROM organizations o
  JOIN subscription_plans sp ON sp.stripe_price_id = 
    CASE 
      WHEN o.stripe_subscription_status = 'active' THEN o.stripe_price_id
      ELSE 'price_starter_monthly'
    END
  WHERE o.id = org_id;

  -- Return limit info
  RETURN jsonb_build_object(
    'limit', COALESCE(limit_value, 0),
    'usage', current_usage,
    'remaining', CASE 
      WHEN limit_value = -1 THEN -1  -- Unlimited
      ELSE GREATEST(0, COALESCE(limit_value, 0) - current_usage)
    END,
    'exceeded', CASE 
      WHEN limit_value = -1 THEN false  -- Unlimited
      ELSE current_usage > COALESCE(limit_value, 0)
    END,
    'percentage', CASE 
      WHEN limit_value = -1 OR limit_value = 0 THEN 0
      ELSE ROUND((current_usage::decimal / limit_value) * 100)
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);
CREATE INDEX idx_organizations_stripe_price_id ON organizations(stripe_price_id) WHERE stripe_price_id IS NOT NULL;