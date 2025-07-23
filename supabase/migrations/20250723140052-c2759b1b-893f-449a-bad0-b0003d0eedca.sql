-- Create storage buckets for documents and profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Add avatar_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Add tags column to documents table for better categorization
ALTER TABLE public.documents ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Create storage policies for documents bucket
CREATE POLICY "Documents: Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (
    -- Attorneys, firm admins, case managers can upload
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('attorney', 'firm_admin', 'case_manager', 'super_admin')
    ) OR
    -- Clients can upload for their own cases
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'client'
    )
  )
);

CREATE POLICY "Documents: Users can view accessible documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND
  (
    -- Super admins can access all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    ) OR
    -- Firm admins can access documents in their firm context
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.documents d ON d.file_path = name
      JOIN public.profiles p2 ON (d.client_id = p2.id OR d.attorney_id = p2.id)
      WHERE p1.id = auth.uid() 
      AND p1.role IN ('firm_admin', 'case_manager')
      AND p1.firm_id = p2.firm_id
    ) OR
    -- Attorneys can access their clients' documents
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = name 
      AND (d.attorney_id = auth.uid() OR d.client_id IN (
        SELECT client_id FROM public.cases WHERE attorney_id = auth.uid()
      ))
    ) OR
    -- Clients can access their own documents
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = name 
      AND d.client_id = auth.uid()
    )
  )
);

CREATE POLICY "Documents: Users can update their documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND
  (
    -- Super admins can update all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    ) OR
    -- Document uploader can update
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = name 
      AND d.uploaded_by = auth.uid()
    ) OR
    -- Firm admins can update documents in their firm
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.documents d ON d.file_path = name
      JOIN public.profiles p2 ON (d.client_id = p2.id OR d.attorney_id = p2.id)
      WHERE p1.id = auth.uid() 
      AND p1.role = 'firm_admin'
      AND p1.firm_id = p2.firm_id
    )
  )
);

CREATE POLICY "Documents: Users can delete their documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND
  (
    -- Super admins can delete all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    ) OR
    -- Document uploader can delete
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = name 
      AND d.uploaded_by = auth.uid()
    ) OR
    -- Firm admins can delete documents in their firm
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.documents d ON d.file_path = name
      JOIN public.profiles p2 ON (d.client_id = p2.id OR d.attorney_id = p2.id)
      WHERE p1.id = auth.uid() 
      AND p1.role = 'firm_admin'
      AND p1.firm_id = p2.firm_id
    )
  )
);

-- Create storage policies for profile photos bucket
CREATE POLICY "Profile photos: Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Profile photos: Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Profile photos: Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-photos' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  )
);

CREATE POLICY "Profile photos: Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-photos' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  )
);

-- Function to clean up old profile photos when new ones are uploaded
CREATE OR REPLACE FUNCTION public.cleanup_old_profile_photo()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove old profile photo from storage if it exists
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
    -- Extract file path from URL and delete from storage
    PERFORM storage.delete(ARRAY[
      substring(OLD.avatar_url from 'profile-photos/(.+)')
    ], 'profile-photos');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to cleanup old profile photos
CREATE TRIGGER cleanup_profile_photo_trigger
  BEFORE UPDATE OF avatar_url ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_profile_photo();

-- Function to clean up orphaned documents
CREATE OR REPLACE FUNCTION public.cleanup_document_file()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete file from storage when document record is deleted
  IF OLD.file_path IS NOT NULL THEN
    PERFORM storage.delete(ARRAY[OLD.file_path], 'documents');
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to cleanup document files
CREATE TRIGGER cleanup_document_file_trigger
  AFTER DELETE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_document_file();