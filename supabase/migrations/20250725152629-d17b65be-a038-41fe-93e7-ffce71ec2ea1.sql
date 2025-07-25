-- Add drop-related columns to cases table
ALTER TABLE cases ADD COLUMN is_dropped boolean DEFAULT false;
ALTER TABLE cases ADD COLUMN dropped_date timestamp with time zone;
ALTER TABLE cases ADD COLUMN dropped_by uuid REFERENCES profiles(id);
ALTER TABLE cases ADD COLUMN drop_reason text;