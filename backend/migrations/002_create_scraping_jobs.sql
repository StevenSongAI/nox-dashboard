-- Scraping jobs table (tracks automated scraping runs)
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    entries_found INTEGER DEFAULT 0,
    entries_added INTEGER DEFAULT 0,
    error_message TEXT
);

COMMENT ON TABLE scraping_jobs IS 'Tracks automated scraping jobs (ViewStats, X.com, etc.)';
