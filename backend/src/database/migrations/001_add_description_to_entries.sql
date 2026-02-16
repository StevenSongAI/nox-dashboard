-- Migration: Add description column to entries table
-- Created: 2026-02-15
-- Issue: SCHEMA-FIX-001 - Database column "description" does not exist

-- Safely add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'entries' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE entries ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to entries table';
    ELSE
        RAISE NOTICE 'description column already exists in entries table';
    END IF;
END $$;
