/*
  # Update profiles table for Firebase Authentication

  1. Changes
    - Remove foreign key constraint on profiles.id to auth.users
    - profiles.id will now store Firebase UIDs instead of Supabase auth user IDs
    - Keep all other functionality the same

  2. Important Notes
    - Firebase handles authentication
    - Supabase handles all data storage
    - Profile IDs match Firebase user UIDs
*/

-- Drop the existing foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- The profiles table will now accept any UUID as id (Firebase UIDs)
-- No structural changes needed, just removing the constraint
