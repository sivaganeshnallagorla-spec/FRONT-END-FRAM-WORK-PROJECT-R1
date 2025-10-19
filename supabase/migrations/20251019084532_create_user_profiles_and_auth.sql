/*
  # User Profiles and Authentication Schema

  ## Overview
  Creates the foundation for user management with role-based access control for the FarmConnect platform.

  ## New Tables
  
  ### `user_profiles`
  Extended user information beyond Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `role` (text) - User role: 'admin', 'farmer', or 'buyer'
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `language_preference` (text) - Preferred language (en, hi, etc.)
  - `state` (text) - State/region in India
  - `district` (text) - District location
  - `profile_image_url` (text) - Profile picture URL
  - `is_active` (boolean) - Account active status
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `user_profiles` table
  - Users can read their own profile
  - Users can update their own profile (except role field)
  - Admins can read all profiles
  - Only authenticated users can access profiles

  ## Important Notes
  1. The role field determines access throughout the application
  2. Language preference enables multi-language support
  3. Location data (state/district) helps with regional analytics
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'farmer', 'buyer')),
  full_name text NOT NULL,
  phone text,
  language_preference text DEFAULT 'en',
  state text,
  district text,
  profile_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_state ON user_profiles(state);
