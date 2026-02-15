-- API keys table (for authentication)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert a default API key for initial setup (optional)
-- You'll replace this with a real key after deployment
-- INSERT INTO api_keys (key_hash, name) VALUES ('placeholder', 'Initial Setup');

COMMENT ON TABLE api_keys IS 'API keys for agent authentication';

-- Index for fast lookups of active keys
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Index for sorting/filtering by usage time
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used ON api_keys(last_used_at DESC);
