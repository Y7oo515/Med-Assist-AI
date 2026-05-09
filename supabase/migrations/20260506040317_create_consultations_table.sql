/*
  # Create consultations table for AI Medical Assistant

  1. New Tables
    - `consultations`
      - `id` (uuid, primary key) - Unique consultation identifier
      - `user_id` (uuid, foreign key to auth.users) - The patient who created the consultation
      - `symptoms` (text) - The symptoms described by the patient
      - `ai_response` (jsonb) - Structured AI response containing diagnosis, treatment, etc.
      - `severity` (text) - Assessed severity level (low, moderate, high, emergency)
      - `created_at` (timestamptz) - When the consultation was created

  2. Security
    - Enable RLS on `consultations` table
    - Users can only read/write their own consultations
    - No public access

  3. Notes
    - The ai_response field stores structured JSON with sections for:
      possible_conditions, recommended_actions, medications, lifestyle_changes, when_to_see_doctor
    - Severity is determined by the AI to help users prioritize urgent cases
*/

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms text NOT NULL,
  ai_response jsonb NOT NULL DEFAULT '{}',
  severity text NOT NULL DEFAULT 'low',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultations"
  ON consultations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
