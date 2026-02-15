-- Performance indexes for entries table
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_source ON entries(source);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_verified ON entries(verified);
CREATE INDEX IF NOT EXISTS idx_entries_deleted_at ON entries(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_entries_category_created ON entries(category, created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_entries_search ON entries 
USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- JSONB index for metadata queries
CREATE INDEX IF NOT EXISTS idx_entries_metadata ON entries USING gin(metadata);

-- Indexes for scraping_jobs
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_source ON scraping_jobs(source);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);
