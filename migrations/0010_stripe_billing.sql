-- Migration: Stripe Billing Integration
-- Description: Add tables for Stripe customer, subscription, and payment tracking

-- Update organizations table to add Stripe customer ID
ALTER TABLE organizations 
  ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE,
  ADD COLUMN stripe_subscription_id VARCHAR(255) UNIQUE,
  ADD COLUMN stripe_subscription_status VARCHAR(50),
  ADD COLUMN stripe_current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN stripe_cancel_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN stripe_canceled_at TIMESTAMP WITH TIME ZONE;

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  tier subscription_tier NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  render_credits_monthly INTEGER NOT NULL,
  max_projects INTEGER,
  max_team_members INTEGER,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', etc.
  brand VARCHAR(50), -- 'visa', 'mastercard', etc.
  last4 VARCHAR(4),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  invoice_number VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  stripe_hosted_invoice_url TEXT,
  stripe_invoice_pdf TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_history table
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  failure_code VARCHAR(100),
  failure_message TEXT,
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_events table for tracking changes
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'created', 'updated', 'canceled', 'reactivated', etc.
  from_tier subscription_tier,
  to_tier subscription_tier,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create usage_records table for usage-based billing
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL, -- 'render', 'storage', 'api_call', etc.
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount DECIMAL(10, 4),
  total_amount DECIMAL(10, 2),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  billed BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX idx_organizations_stripe_subscription_id ON organizations(stripe_subscription_id);
CREATE INDEX idx_payment_methods_organization_id ON payment_methods(organization_id);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payment_history_organization_id ON payment_history(organization_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_subscription_events_organization_id ON subscription_events(organization_id);
CREATE INDEX idx_usage_records_organization_id ON usage_records(organization_id);
CREATE INDEX idx_usage_records_billed ON usage_records(billed);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Subscription plans are public read
CREATE POLICY subscription_plans_select_policy ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Payment methods - org members can view, only owners/admins can manage
CREATE POLICY payment_methods_select_policy ON payment_methods
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

CREATE POLICY payment_methods_insert_policy ON payment_methods
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY payment_methods_update_policy ON payment_methods
  FOR UPDATE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY payment_methods_delete_policy ON payment_methods
  FOR DELETE USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('owner', 'admin')
  );

-- Invoices - org members can view
CREATE POLICY invoices_select_policy ON invoices
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- Payment history - org members can view
CREATE POLICY payment_history_select_policy ON payment_history
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- Subscription events - org members can view
CREATE POLICY subscription_events_select_policy ON subscription_events
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- Usage records - org members can view their own
CREATE POLICY usage_records_select_policy ON usage_records
  FOR SELECT USING (
    organization_id = auth.user_organization_id()
  );

-- Insert default subscription plans
INSERT INTO subscription_plans (name, stripe_price_id, tier, price_monthly, price_yearly, render_credits_monthly, max_projects, max_team_members, features) VALUES
('Free', 'price_free', 'free', 0, 0, 10, 3, 1, '{"watermark": true, "export_formats": ["png", "jpg"], "support": "community"}'),
('Professional', 'price_1234567890', 'professional', 49, 470, 100, 20, 5, '{"watermark": false, "export_formats": ["png", "jpg", "svg", "pdf"], "support": "email", "custom_branding": true}'),
('Business', 'price_0987654321', 'business', 149, 1430, 500, 100, 20, '{"watermark": false, "export_formats": ["png", "jpg", "svg", "pdf"], "support": "priority", "custom_branding": true, "api_access": true, "sso": false}'),
('Enterprise', 'price_enterprise', 'enterprise', 499, 4790, 2000, -1, -1, '{"watermark": false, "export_formats": ["png", "jpg", "svg", "pdf"], "support": "dedicated", "custom_branding": true, "api_access": true, "sso": true, "custom_contract": true}');