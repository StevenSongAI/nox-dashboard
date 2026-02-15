-- Entry stats table for tracking engagement metrics
CREATE TABLE IF NOT EXISTS entry_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    
    -- View metrics
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement metrics
    avg_time_spent_seconds INTEGER DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Additional metrics (stored as JSON for flexibility)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(entry_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entry_stats_entry_id ON entry_stats(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_stats_view_count ON entry_stats(view_count);
CREATE INDEX IF NOT EXISTS idx_entry_stats_engagement ON entry_stats(engagement_score);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_entry_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_entry_stats_updated_at ON entry_stats;
CREATE TRIGGER update_entry_stats_updated_at
    BEFORE UPDATE ON entry_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_entry_stats_updated_at();

COMMENT ON TABLE entry_stats IS 'Tracks view counts and engagement metrics for entries';
