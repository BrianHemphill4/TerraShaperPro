-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-uploads', 'project-uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('renders', 'renders', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('assets', 'assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('templates', 'templates', false, 5242880, ARRAY['application/json']);

-- Storage policies for project-uploads bucket
CREATE POLICY "Users can upload to their organization's projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-uploads' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
);

CREATE POLICY "Users can view their organization's uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-uploads' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-uploads' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
  AND auth.user_role() IN ('owner', 'designer')
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-uploads' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
  AND auth.user_role() IN ('owner', 'designer')
);

-- Storage policies for renders bucket
CREATE POLICY "Users can view their organization's renders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'renders' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
);

CREATE POLICY "Service role can manage renders"
ON storage.objects FOR ALL
USING (
  bucket_id = 'renders' 
  AND auth.role() = 'service_role'
);

-- Storage policies for assets bucket (public read)
CREATE POLICY "Anyone can view assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Service role can manage assets"
ON storage.objects FOR ALL
USING (
  bucket_id = 'assets' 
  AND auth.role() = 'service_role'
);

-- Storage policies for templates bucket
CREATE POLICY "Users can view their organization's templates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'templates' 
  AND (
    (storage.foldername(name))[1] = auth.user_organization_id()::text
    OR (storage.foldername(name))[1] = 'public'
  )
);

CREATE POLICY "Designers can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'templates' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
  AND auth.user_role() IN ('owner', 'designer')
);

CREATE POLICY "Template creators can update their templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'templates' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
  AND auth.user_role() IN ('owner', 'designer')
);

CREATE POLICY "Owners can delete templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'templates' 
  AND (storage.foldername(name))[1] = auth.user_organization_id()::text
  AND auth.user_role() = 'owner'
);