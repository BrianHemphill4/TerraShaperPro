-- Credit System Tables
-- Tracks credit transactions and usage

-- Credit transaction types
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'render', 'refund', 'bonus', 'adjustment');
CREATE TYPE credit_transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Credit transactions table
CREATE TABLE credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type credit_transaction_type NOT NULL,
    amount INTEGER NOT NULL, -- Positive for credits added, negative for credits used
    balance_after INTEGER NOT NULL, -- Organization credit balance after transaction
    status credit_transaction_status DEFAULT 'completed' NOT NULL,
    render_id UUID REFERENCES renders(id) ON DELETE SET NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Credit packages table (for purchase options)
CREATE TABLE credit_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL, -- Price in cents to avoid floating point issues
    bonus_credits INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_cents, bonus_credits) VALUES
    ('Starter Pack', 10, 999, 0),
    ('Professional Pack', 50, 3999, 5),
    ('Business Pack', 100, 6999, 15),
    ('Enterprise Pack', 500, 29999, 100);

-- Add credit cost to renders table
ALTER TABLE renders ADD COLUMN credit_cost INTEGER DEFAULT 1 NOT NULL;

-- Add quality status for renders (for automatic quality checks)
ALTER TABLE renders ADD COLUMN quality_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE renders ADD COLUMN quality_score DECIMAL(3, 2);

-- Render queue management
CREATE TABLE render_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    render_id UUID REFERENCES renders(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    position INTEGER,
    estimated_wait_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(render_id)
);

-- Create indexes
CREATE INDEX idx_credit_transactions_organization ON credit_transactions(organization_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_render ON credit_transactions(render_id);
CREATE INDEX idx_render_queue_position ON render_queue(position) WHERE position IS NOT NULL;
CREATE INDEX idx_render_queue_priority ON render_queue(priority DESC, created_at ASC);

-- Function to consume credits
CREATE OR REPLACE FUNCTION consume_credits(
    p_organization_id UUID,
    p_user_id UUID,
    p_render_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Lock the organization row to prevent concurrent modifications
    SELECT render_credits INTO v_current_balance
    FROM organizations
    WHERE id = p_organization_id
    FOR UPDATE;

    -- Check if sufficient credits
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    -- Update balance
    v_new_balance := v_current_balance - p_amount;
    UPDATE organizations
    SET render_credits = v_new_balance
    WHERE id = p_organization_id;

    -- Record transaction
    INSERT INTO credit_transactions (
        organization_id,
        user_id,
        type,
        amount,
        balance_after,
        render_id,
        description
    ) VALUES (
        p_organization_id,
        p_user_id,
        'render',
        -p_amount,
        v_new_balance,
        p_render_id,
        COALESCE(p_description, 'Render generation')
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to refund credits
CREATE OR REPLACE FUNCTION refund_credits(
    p_organization_id UUID,
    p_user_id UUID,
    p_render_id UUID,
    p_amount INTEGER,
    p_reason TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Lock the organization row
    SELECT render_credits INTO v_current_balance
    FROM organizations
    WHERE id = p_organization_id
    FOR UPDATE;

    -- Update balance
    v_new_balance := v_current_balance + p_amount;
    UPDATE organizations
    SET render_credits = v_new_balance
    WHERE id = p_organization_id;

    -- Record transaction
    INSERT INTO credit_transactions (
        organization_id,
        user_id,
        type,
        amount,
        balance_after,
        render_id,
        description
    ) VALUES (
        p_organization_id,
        p_user_id,
        'refund',
        p_amount,
        v_new_balance,
        p_render_id,
        p_reason
    );
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (for purchases)
CREATE OR REPLACE FUNCTION add_credits(
    p_organization_id UUID,
    p_user_id UUID,
    p_amount INTEGER,
    p_type credit_transaction_type,
    p_description TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Lock the organization row
    SELECT render_credits INTO v_current_balance
    FROM organizations
    WHERE id = p_organization_id
    FOR UPDATE;

    -- Update balance
    v_new_balance := v_current_balance + p_amount;
    UPDATE organizations
    SET render_credits = v_new_balance
    WHERE id = p_organization_id;

    -- Record transaction
    INSERT INTO credit_transactions (
        organization_id,
        user_id,
        type,
        amount,
        balance_after,
        description
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_type,
        p_amount,
        v_new_balance,
        p_description
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update credit_packages updated_at
CREATE TRIGGER update_credit_packages_updated_at BEFORE UPDATE ON credit_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();