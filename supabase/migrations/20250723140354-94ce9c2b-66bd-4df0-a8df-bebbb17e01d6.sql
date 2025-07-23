-- Fix search path security warnings for recently created functions
DROP FUNCTION IF EXISTS public.cleanup_old_profile_photo();
DROP FUNCTION IF EXISTS public.cleanup_document_file();

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.cleanup_old_profile_photo()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, storage
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.cleanup_document_file()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Delete file from storage when document record is deleted
  IF OLD.file_path IS NOT NULL THEN
    PERFORM storage.delete(ARRAY[OLD.file_path], 'documents');
  END IF;
  
  RETURN OLD;
END;
$$;