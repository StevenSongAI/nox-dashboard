-- Add 'research' to category constraint
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_category_check;
ALTER TABLE entries ADD CONSTRAINT entries_category_check 
  CHECK (category IN ('youtube', 'business', 'investments', 'research'));

-- Update comment
COMMENT ON COLUMN entries.category IS ' youtube | business | investments | research ';
