-- Core entries table (stores all dashboard data)
CREATE TABLE IF NOT EXISTS entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('youtube', 'business', 'investments')),
    type VARCHAR(50) NOT NULL,
    
    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    
    -- Source tracking
    source VARCHAR(100) NOT NULL,
    source_url VARCHAR(1000),
    source_id VARCHAR(200),
    
    -- Metadata (flexible JSON for different entry types)
    metadata JSONB DEFAULT '{}',
    
    -- Quality signals
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    verified BOOLEAN DEFAULT FALSE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE entries IS 'Main table for all dashboard entries (YouTube, Business, Investments)';
COMMENT ON COLUMN entries.category IS ' youtube | business | investments ';
COMMENT ON COLUMN entries.type IS 'outlier_video, opportunity, position, intelligence, etc.';
COMMENT ON COLUMN entries.metadata IS 'Flexible JSON for entry-specific data';
