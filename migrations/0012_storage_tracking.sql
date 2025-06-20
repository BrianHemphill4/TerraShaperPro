-- Migration: Storage Usage Tracking
-- Description: Add functions for tracking storage usage and periodic billing

-- Create a function to calculate organization storage usage
CREATE OR REPLACE FUNCTION calculate_storage_usage(
  p_organization_id UUID
) RETURNS TABLE (
  total_bytes BIGINT,
  file_count INTEGER,
  breakdown JSONB
) AS $$
DECLARE
  v_project_uploads RECORD;
  v_renders RECORD;
  v_templates RECORD;
BEGIN
  -- Get project uploads storage
  SELECT 
    COALESCE(SUM((metadata->>'size')::BIGINT), 0) as bytes,
    COUNT(*) as count
  INTO v_project_uploads
  FROM storage.objects
  WHERE bucket_id = 'project-uploads'
    AND name LIKE p_organization_id::text || '/%';

  -- Get renders storage
  SELECT 
    COALESCE(SUM((metadata->>'size')::BIGINT), 0) as bytes,
    COUNT(*) as count
  INTO v_renders
  FROM storage.objects
  WHERE bucket_id = 'renders'
    AND name LIKE '%/' || p_organization_id::text || '/%';

  -- Get templates storage
  SELECT 
    COALESCE(SUM((metadata->>'size')::BIGINT), 0) as bytes,
    COUNT(*) as count
  INTO v_templates
  FROM storage.objects
  WHERE bucket_id = 'templates'
    AND name LIKE p_organization_id::text || '/%';

  RETURN QUERY SELECT
    v_project_uploads.bytes + v_renders.bytes + v_templates.bytes as total_bytes,
    v_project_uploads.count + v_renders.count + v_templates.count as file_count,
    jsonb_build_object(
      'project_uploads', jsonb_build_object('bytes', v_project_uploads.bytes, 'count', v_project_uploads.count),
      'renders', jsonb_build_object('bytes', v_renders.bytes, 'count', v_renders.count),
      'templates', jsonb_build_object('bytes', v_templates.bytes, 'count', v_templates.count)
    ) as breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to track storage usage periodically
CREATE OR REPLACE FUNCTION track_storage_usage(
  p_organization_id UUID
) RETURNS void AS $$
DECLARE
  v_usage RECORD;
  v_gb_used DECIMAL;
BEGIN
  -- Calculate current storage usage
  SELECT * INTO v_usage FROM calculate_storage_usage(p_organization_id);
  
  -- Convert to GB
  v_gb_used := v_usage.total_bytes::DECIMAL / (1024 * 1024 * 1024);
  
  -- Insert usage record
  INSERT INTO usage_records (
    organization_id,
    record_type,
    quantity,
    unit_amount,
    total_amount,
    description,
    metadata
  ) VALUES (
    p_organization_id,
    'storage',
    CEIL(v_gb_used),  -- Round up to nearest GB
    1.0,  -- $1 per GB (adjust as needed)
    CEIL(v_gb_used),
    'Storage usage for ' || TO_CHAR(CURRENT_DATE, 'Month YYYY'),
    jsonb_build_object(
      'total_bytes', v_usage.total_bytes,
      'file_count', v_usage.file_count,
      'gb_used', v_gb_used,
      'breakdown', v_usage.breakdown,
      'calculated_at', CURRENT_TIMESTAMP
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to track storage usage daily
-- Note: This requires pg_cron extension or external scheduler
-- For now, we'll create a function that can be called by an external scheduler

CREATE OR REPLACE FUNCTION track_all_organizations_storage() RETURNS void AS $$
DECLARE
  v_org RECORD;
BEGIN
  -- Track storage for all active organizations
  FOR v_org IN 
    SELECT DISTINCT o.id
    FROM organizations o
    WHERE o.stripe_subscription_status = 'active'
      -- Only track once per day
      AND NOT EXISTS (
        SELECT 1 FROM usage_records ur
        WHERE ur.organization_id = o.id
          AND ur.record_type = 'storage'
          AND DATE(ur.created_at) = CURRENT_DATE
      )
  LOOP
    PERFORM track_storage_usage(v_org.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check storage limits
CREATE OR REPLACE FUNCTION check_storage_limit(
  p_organization_id UUID,
  p_additional_bytes BIGINT DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  v_current_usage RECORD;
  v_plan_limit_gb INTEGER;
  v_current_gb DECIMAL;
  v_future_gb DECIMAL;
  v_plan RECORD;
BEGIN
  -- Get current usage
  SELECT * INTO v_current_usage FROM calculate_storage_usage(p_organization_id);
  
  -- Get plan storage limit
  SELECT sp.features->>'max_storage_gb' as limit_gb
  INTO v_plan_limit_gb
  FROM organizations o
  JOIN subscription_plans sp ON sp.stripe_price_id = o.stripe_price_id
  WHERE o.id = p_organization_id
    AND o.stripe_subscription_status = 'active';
  
  -- Default to starter plan if no active subscription
  IF v_plan_limit_gb IS NULL THEN
    v_plan_limit_gb := 5; -- Starter plan default
  END IF;
  
  -- Convert to GB
  v_current_gb := v_current_usage.total_bytes::DECIMAL / (1024 * 1024 * 1024);
  v_future_gb := (v_current_usage.total_bytes + p_additional_bytes)::DECIMAL / (1024 * 1024 * 1024);
  
  RETURN jsonb_build_object(
    'limit_gb', v_plan_limit_gb,
    'current_gb', ROUND(v_current_gb, 2),
    'future_gb', ROUND(v_future_gb, 2),
    'current_bytes', v_current_usage.total_bytes,
    'future_bytes', v_current_usage.total_bytes + p_additional_bytes,
    'percentage_used', CASE 
      WHEN v_plan_limit_gb = -1 THEN 0  -- Unlimited
      ELSE ROUND((v_current_gb / v_plan_limit_gb) * 100, 1)
    END,
    'exceeded', CASE 
      WHEN v_plan_limit_gb = -1 THEN false  -- Unlimited
      ELSE v_future_gb > v_plan_limit_gb
    END,
    'remaining_gb', CASE 
      WHEN v_plan_limit_gb = -1 THEN -1  -- Unlimited
      ELSE GREATEST(0, v_plan_limit_gb - v_current_gb)
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for the functions
GRANT EXECUTE ON FUNCTION calculate_storage_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_storage_limit(UUID, BIGINT) TO authenticated;

-- Create a policy to ensure users can only check their own organization's storage
CREATE OR REPLACE FUNCTION auth.user_can_access_organization(org_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster storage queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id, name);

-- Add a trigger to check storage limits on file uploads
CREATE OR REPLACE FUNCTION check_storage_before_upload() RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_file_size BIGINT;
  v_limit_check JSONB;
BEGIN
  -- Extract organization ID from the file path
  -- Assuming paths are structured as: org_id/...
  v_org_id := SPLIT_PART(NEW.name, '/', 1)::UUID;
  
  -- Get file size
  v_file_size := (NEW.metadata->>'size')::BIGINT;
  
  -- Check storage limit
  v_limit_check := check_storage_limit(v_org_id, v_file_size);
  
  IF (v_limit_check->>'exceeded')::boolean THEN
    RAISE EXCEPTION 'Storage limit exceeded. Current: % GB, Limit: % GB', 
      v_limit_check->>'future_gb', 
      v_limit_check->>'limit_gb';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would need to be created by a superuser
-- For production, implement this check in the application layer instead
-- CREATE TRIGGER check_storage_limit_trigger
-- BEFORE INSERT ON storage.objects
-- FOR EACH ROW
-- EXECUTE FUNCTION check_storage_before_upload();