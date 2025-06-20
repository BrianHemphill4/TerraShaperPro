-- Migration: Overage Handling
-- Description: Add overage tracking and billing functionality

-- Create overage_charges table to track overages
CREATE TABLE overage_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  charge_type VARCHAR(50) NOT NULL, -- 'render', 'storage', 'team_seats'
  quantity_used INTEGER NOT NULL,
  quantity_included INTEGER NOT NULL,
  overage_quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 4) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'billed', 'waived'
  stripe_invoice_item_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  billed_at TIMESTAMP WITH TIME ZONE
);

-- Create overage_rates table for pricing
CREATE TABLE overage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_tier subscription_tier NOT NULL,
  charge_type VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10, 4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default overage rates
INSERT INTO overage_rates (subscription_tier, charge_type, unit_price, currency) VALUES
-- Starter tier overages
('starter', 'render', 0.50, 'USD'),      -- $0.50 per render over limit
('starter', 'storage', 0.10, 'USD'),     -- $0.10 per GB over limit
('starter', 'team_seats', 10.00, 'USD'), -- $10 per seat over limit

-- Professional tier overages
('professional', 'render', 0.40, 'USD'),
('professional', 'storage', 0.08, 'USD'),
('professional', 'team_seats', 8.00, 'USD'),

-- Growth tier overages
('growth', 'render', 0.30, 'USD'),
('growth', 'storage', 0.06, 'USD'),
('growth', 'team_seats', 6.00, 'USD'),

-- Enterprise has custom pricing
('enterprise', 'render', 0.00, 'USD'),
('enterprise', 'storage', 0.00, 'USD'),
('enterprise', 'team_seats', 0.00, 'USD');

-- Function to calculate overages for a billing period
CREATE OR REPLACE FUNCTION calculate_overages(
  p_organization_id UUID,
  p_billing_start DATE,
  p_billing_end DATE
) RETURNS TABLE (
  charge_type VARCHAR,
  quantity_used INTEGER,
  quantity_included INTEGER,
  overage_quantity INTEGER,
  unit_price DECIMAL,
  total_amount DECIMAL
) AS $$
DECLARE
  v_tier subscription_tier;
  v_plan RECORD;
  v_render_usage INTEGER;
  v_storage_usage INTEGER;
  v_team_seats INTEGER;
BEGIN
  -- Get organization tier and plan
  SELECT 
    COALESCE(o.subscription_tier, 'starter') as tier,
    sp.*
  INTO v_tier, v_plan
  FROM organizations o
  LEFT JOIN subscription_plans sp ON sp.stripe_price_id = o.stripe_price_id
  WHERE o.id = p_organization_id;

  -- Calculate render usage
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_render_usage
  FROM usage_records
  WHERE organization_id = p_organization_id
    AND record_type = 'render'
    AND DATE(created_at) >= p_billing_start
    AND DATE(created_at) <= p_billing_end;

  -- Calculate storage usage (peak usage during period)
  SELECT COALESCE(MAX(quantity), 0)
  INTO v_storage_usage
  FROM usage_records
  WHERE organization_id = p_organization_id
    AND record_type = 'storage'
    AND DATE(created_at) >= p_billing_start
    AND DATE(created_at) <= p_billing_end;

  -- Calculate team seats (current count)
  SELECT COUNT(*)
  INTO v_team_seats
  FROM users
  WHERE organization_id = p_organization_id;

  -- Return overage calculations for each type
  -- Renders
  IF v_plan.features->>'max_renders_per_month' != '-1' THEN
    RETURN QUERY
    SELECT 
      'render'::VARCHAR as charge_type,
      v_render_usage as quantity_used,
      (v_plan.features->>'max_renders_per_month')::INTEGER as quantity_included,
      GREATEST(0, v_render_usage - (v_plan.features->>'max_renders_per_month')::INTEGER) as overage_quantity,
      (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'render' AND is_active = true LIMIT 1) as unit_price,
      GREATEST(0, v_render_usage - (v_plan.features->>'max_renders_per_month')::INTEGER) * 
        (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'render' AND is_active = true LIMIT 1) as total_amount;
  END IF;

  -- Storage
  IF v_plan.features->>'max_storage_gb' != '-1' THEN
    RETURN QUERY
    SELECT 
      'storage'::VARCHAR as charge_type,
      v_storage_usage as quantity_used,
      (v_plan.features->>'max_storage_gb')::INTEGER as quantity_included,
      GREATEST(0, v_storage_usage - (v_plan.features->>'max_storage_gb')::INTEGER) as overage_quantity,
      (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'storage' AND is_active = true LIMIT 1) as unit_price,
      GREATEST(0, v_storage_usage - (v_plan.features->>'max_storage_gb')::INTEGER) * 
        (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'storage' AND is_active = true LIMIT 1) as total_amount;
  END IF;

  -- Team seats
  IF v_plan.max_team_members != -1 THEN
    RETURN QUERY
    SELECT 
      'team_seats'::VARCHAR as charge_type,
      v_team_seats as quantity_used,
      v_plan.max_team_members as quantity_included,
      GREATEST(0, v_team_seats - v_plan.max_team_members) as overage_quantity,
      (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'team_seats' AND is_active = true LIMIT 1) as unit_price,
      GREATEST(0, v_team_seats - v_plan.max_team_members) * 
        (SELECT unit_price FROM overage_rates WHERE subscription_tier = v_tier AND charge_type = 'team_seats' AND is_active = true LIMIT 1) as total_amount;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process overages at end of billing period
CREATE OR REPLACE FUNCTION process_billing_period_overages(
  p_organization_id UUID,
  p_billing_start DATE,
  p_billing_end DATE
) RETURNS void AS $$
DECLARE
  v_overage RECORD;
BEGIN
  -- Calculate and insert overage charges
  FOR v_overage IN 
    SELECT * FROM calculate_overages(p_organization_id, p_billing_start, p_billing_end)
    WHERE overage_quantity > 0
  LOOP
    INSERT INTO overage_charges (
      organization_id,
      billing_period_start,
      billing_period_end,
      charge_type,
      quantity_used,
      quantity_included,
      overage_quantity,
      unit_price,
      total_amount,
      metadata
    ) VALUES (
      p_organization_id,
      p_billing_start,
      p_billing_end,
      v_overage.charge_type,
      v_overage.quantity_used,
      v_overage.quantity_included,
      v_overage.overage_quantity,
      v_overage.unit_price,
      v_overage.total_amount,
      jsonb_build_object(
        'calculated_at', CURRENT_TIMESTAMP,
        'billing_month', TO_CHAR(p_billing_start, 'YYYY-MM')
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current period overages
CREATE OR REPLACE FUNCTION get_current_overages(
  p_organization_id UUID
) RETURNS TABLE (
  charge_type VARCHAR,
  quantity_used INTEGER,
  quantity_included INTEGER,
  overage_quantity INTEGER,
  unit_price DECIMAL,
  total_amount DECIMAL,
  percentage_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.charge_type,
    o.quantity_used,
    o.quantity_included,
    o.overage_quantity,
    o.unit_price,
    o.total_amount,
    CASE 
      WHEN o.quantity_included = 0 THEN 100
      ELSE ROUND((o.quantity_used::DECIMAL / o.quantity_included) * 100)::INTEGER
    END as percentage_used
  FROM calculate_overages(
    p_organization_id,
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
  ) o;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_overage_charges_organization_id ON overage_charges(organization_id);
CREATE INDEX idx_overage_charges_billing_period ON overage_charges(billing_period_start, billing_period_end);
CREATE INDEX idx_overage_charges_status ON overage_charges(status);
CREATE INDEX idx_overage_rates_tier_type ON overage_rates(subscription_tier, charge_type) WHERE is_active = true;

-- RLS Policies
ALTER TABLE overage_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE overage_rates ENABLE ROW LEVEL SECURITY;

-- Organizations can view their own overage charges
CREATE POLICY overage_charges_select_policy ON overage_charges
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- Everyone can view active overage rates
CREATE POLICY overage_rates_select_policy ON overage_rates
  FOR SELECT USING (is_active = true);

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_overages(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_overages(UUID) TO authenticated;