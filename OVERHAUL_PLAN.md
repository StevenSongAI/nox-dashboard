# Nox Dashboard - Complete Overhaul Plan

**Date:** 2026-02-15  
**Scope:** Full redesign aligned with Steven's new vision  
**Guiding Principles:** Simple, visual, real data only, 3 categories

---

## New Vision Summary

The dashboard becomes a **clean information display** — not a complex tool, but a beautiful window into categorized information.

**Core Change:**
- **Before:** Complex dashboard with 14 tabs, many broken
- **After:** Simple 3-category view (YouTube, Business, Investments) + Activity Feed

**How it works:**
1. Steven messages about anything → I categorize and log it
2. Automated scraping finds data → I categorize and add it
3. Everything displays in clean, visual cards
4. No fake numbers, no mock data, only real verified information

---

## 1. New Architecture

### 1.1 Full-Stack Architecture (BEST PRACTICE)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NOX DASHBOARD v2.0                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────────────────┐   │
│  │   FRONTEND          │         │   BACKEND (Railway)             │   │
│  │   GitHub Pages      │◀───────▶│   Node.js + Express             │   │
│  │   (Static hosting)  │  HTTP   │   (API Server)                  │   │
│  │                     │         │                                 │   │
│  │  • React SPA        │         │  • REST API endpoints            │   │
│  │  • Clean UI         │         │  • Authentication (API keys)     │   │
│  │  • Real-time updates│         │  • Request validation            │   │
│  │  • Responsive       │         │  • Error handling                │   │
│  └─────────────────────┘         └──────────────┬──────────────────┘   │
│                                                 │                       │
│                                                 │  PostgreSQL           │
│                                                 │  (Managed DB)         │
│                                                 │                       │
│                                                 │  • ACID transactions  │
│                                                 │  • Indexed queries    │
│                                                 │  • Full-text search   │
│                                                 │  • Backup/restore     │
│                                                 └───────────────────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture is BEST

**Frontend (GitHub Pages):**
- Free, fast CDN for static assets
- No server maintenance
- Automatic HTTPS
- Zero downtime deploys

**Backend (Railway + Node.js/Express):**
- Real-time data updates (no 1-2 min delay)
- Proper API authentication (API keys)
- Request validation and sanitization
- Structured logging and error handling
- Horizontal scaling if needed

**Database (PostgreSQL):**
- ACID compliance (no data corruption)
- Complex queries with indexes (fast search)
- Full-text search built-in
- Row-level security possible
- Automated backups (point-in-time recovery)
- Connection pooling for performance

### 1.3 Project Structure

```
nox-dashboard/
├── frontend/                    # React SPA (GitHub Pages)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Card.jsx
│   │   │   ├── FilterPills.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── views/               # Page-level components
│   │   │   ├── YouTubeView.jsx
│   │   │   ├── BusinessView.jsx
│   │   │   ├── InvestmentsView.jsx
│   │   │   └── ActivityView.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useEntries.js
│   │   │   └── useSearch.js
│   │   ├── api/                 # API client
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # Node.js API (Railway)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # PostgreSQL connection
│   │   ├── models/              # Database models
│   │   │   ├── Entry.js
│   │   │   └── User.js
│   │   ├── routes/              # API routes
│   │   │   ├── entries.js
│   │   │   ├── search.js
│   │   │   └── health.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # API key validation
│   │   │   ├── validation.js    # Request validation
│   │   │   └── errorHandler.js
│   │   ├── services/            # Business logic
│   │   │   ├── entryService.js
│   │   │   └── searchService.js
│   │   └── app.js               # Express app setup
│   ├── migrations/              # Database migrations
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
│
└── README.md
```

### 1.4 Database Schema (PostgreSQL)

```sql
-- Core entries table (stores all dashboard data)
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('youtube', 'business', 'investments')),
    type VARCHAR(50) NOT NULL, -- outlier_video, opportunity, position, etc.
    
    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT, -- Auto-generated summary
    
    -- Source tracking
    source VARCHAR(100) NOT NULL, -- 'user_message', 'viewstats_scraper', 'x_com', etc.
    source_url VARCHAR(1000),
    source_id VARCHAR(200), -- External ID (e.g., YouTube video ID)
    
    -- Metadata (flexible JSON for different entry types)
    metadata JSONB DEFAULT '{}',
    
    -- Quality signals
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    verified BOOLEAN DEFAULT FALSE,
    
    -- For soft deletes
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_entries_category ON entries(category);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_source ON entries(source);
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX idx_entries_verified ON entries(verified);

-- Full-text search index
CREATE INDEX idx_entries_search ON entries USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Scraping jobs table (tracks automated scraping)
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) NOT NULL, -- 'viewstats', 'x_com', etc.
    status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
    entries_found INTEGER DEFAULT 0,
    entries_added INTEGER DEFAULT 0,
    error_message TEXT
);

-- API keys table (for authentication)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 1.5 API Endpoints

```
GET    /api/entries              # List entries (with filters)
GET    /api/entries/:id          # Get single entry
POST   /api/entries              # Create new entry
PATCH  /api/entries/:id          # Update entry
DELETE /api/entries/:id          # Soft delete entry

GET    /api/entries/search?q=... # Full-text search
GET    /api/entries/stats        # Dashboard stats

GET    /api/scraping/jobs        # List scraping jobs
POST   /api/scraping/jobs        # Start new scraping job

GET    /health                   # Health check
```

### 1.6 Request/Response Examples

**Create Entry:**
```http
POST /api/entries
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "category": "youtube",
  "type": "outlier_video",
  "title": "What If Pokemon Had Realistic Evolution",
  "content": "Found via ViewStats...",
  "source": "viewstats_scraper",
  "source_url": "https://youtube.com/watch?v=...",
  "metadata": {
    "channel": "RogersPets",
    "views": 2400000,
    "outlierScore": 99.1
  },
  "confidence": 95
}
```

**Search:**
```http
GET /api/entries/search?q=ai+agents&category=business&limit=20

Response:
{
  "results": [...],
  "total": 156,
  "page": 1,
  "limit": 20
}
```

---

## 2. UI/UX Redesign

### 1.3 Data Persistence Strategy

**CRITICAL: GitHub Pages is static hosting with no backend.**

Data persistence works through **git commits to JSON files**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. I scrape/research/find data                                 │
│           ↓                                                     │
│  2. I append to local JSON files (data/*.json)                  │
│           ↓                                                     │
│  3. I commit changes: git add . && git commit -m "[data] ..."   │
│           ↓                                                     │
│  4. I push to GitHub: git push origin main                      │
│           ↓                                                     │
│  5. GitHub Pages auto-redeploys (~1-2 minutes)                  │
│           ↓                                                     │
│  6. Data is now persisted in git history + live on site         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Source of Truth:**
- **JSON files in GitHub repo** = permanent storage
- **localStorage** = temporary cache only (device-specific, can be cleared)
- **Git commits** = audit trail and backup

**Data Update Workflow:**
```javascript
// When I add new data:
async function persistData(category, newEntry) {
  // 1. Read current data
  const data = await readJsonFile(`data/${category}.json`);
  
  // 2. Append new entry
  data.entries.push(newEntry);
  data.meta.lastUpdated = new Date().toISOString();
  data.meta.totalEntries = data.entries.length;
  
  // 3. Write to file
  await writeJsonFile(`data/${category}.json`, data);
  
  // 4. Commit and push (THIS IS THE PERSISTENCE)
  await exec('git add data/');
  await exec('git commit -m "[data] Added ' + newEntry.title + '"');
  await exec('git push origin main');
  
  // 5. Data is now permanently stored
}
```

**Why this works:**
- GitHub stores every version of every JSON file
- GitHub Pages serves the latest JSON files as static assets
- No backend server needed
- Free, reliable, version-controlled
- Data survives browser cache clears, device changes, etc.

**Commit Message Format:**
```
[data] Added YouTube outlier: "Video Title" (1.2M views)
[data] Added business opportunity: AI Agent SaaS
[data] Added investment intel: NVDA earnings
[scraping] Auto-added 5 ViewStats outliers
[message] Logged user research on topic X
```

**Recovery:**
- If data is corrupted: `git revert` or restore from previous commit
- If deployment fails: data still in git, can rollback
- Full history: `git log --oneline data/youtube.json`

---

## 2. Data Persistence (PostgreSQL)

### 2.1 Database Connection

**PostgreSQL on Railway:**
- Managed database with automated backups
- Connection pooling via `pg` library
- SSL/TLS encryption in transit
- Row-level security for multi-user (future)

**Connection String:**
```javascript
// backend/src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

### 2.2 Data Operations

**Create Entry:**
```javascript
// API call from agent
const entry = await api.post('/entries', {
  category: 'youtube',
  type: 'outlier_video',
  title: 'Video Title',
  content: 'Research findings...',
  source: 'viewstats_scraper',
  metadata: { views: 1000000, outlierScore: 99 },
  confidence: 95
});

// Data is immediately persisted to PostgreSQL
// Available via API instantly (no redeploy delay)
```

**Query with Filters:**
```javascript
// Get recent YouTube outliers
const outliers = await api.get('/entries', {
  params: {
    category: 'youtube',
    type: 'outlier_video',
    verified: true,
    limit: 50,
    sort: 'created_at:desc'
  }
});
```

**Full-Text Search:**
```javascript
// Search across all content
const results = await api.get('/entries/search?q=AI+agent+infrastructure');
```

### 2.3 Backup Strategy

**Railway Automated Backups:**
- Daily automated backups (point-in-time recovery)
- 7-day retention on free tier, 30-day on paid
- One-click restore from Railway dashboard

**Manual Export (if needed):**
```bash
# Export entire database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Export specific category
pg_dump --table=entries --where="category='youtube'" $DATABASE_URL > youtube_backup.sql
```

### 2.4 Migration Strategy

**Existing JSON data → PostgreSQL:**
1. Write migration script to parse JSON files
2. Insert into `entries` table with proper categorization
3. Verify data integrity post-migration
4. Archive JSON files (keep for history)

---

## 3. UI/UX Redesign

### 2.1 New Layout: Clean & Minimal

**Header (Fixed, 60px)**
```
[Nox]  [YouTube] [Business] [Investments]  [Activity]  [Search 🔍]
```
- Only 4 navigation items (was 14 tabs)
- Clean pill-style navigation
- Active state clearly indicated

**Main Content Area**
- No sidebar clutter
- Full-width card grid
- Generous whitespace
- Single-column mobile, 2-column tablet, 3-column desktop

**Card Design (Unified)**
```
┌─────────────────────────────────────┐
│ [Category Badge]      [Timestamp]   │
│                                     │
│ Title of Entry                      │
│                                     │
│ Brief description or content...     │
│                                     │
│ [Source: X.com]  [Confidence: 95%]  │
└─────────────────────────────────────┘
```

### 2.2 Category-Specific Views

#### YouTube View
**Filters:** All | Outliers | Competitors | Content Briefs | Research

**Card Types:**
1. **Outlier Video Card**
   - Thumbnail (auto-fetched)
   - Title, channel, view count
   - Outlier score badge
   - One-sentence why it works
   - Click → full research modal

2. **Competitor Card**
   - Channel avatar
   - Channel name, subscriber count
   - Latest viral video
   - Niche category

3. **Content Brief Card**
   - Title concept
   - Target audience
   - Production difficulty
   - Estimated cost

4. **Research Note Card**
   - Title
   - Summary (first 200 chars)
   - Source links
   - Confidence score

#### Business View
**Filters:** All | Opportunities | Active Deals | Won | Passed

**Card Types:**
1. **Opportunity Card**
   - Name
   - Alignment badge (HIGH/MEDIUM/LOW)
   - Potential revenue
   - Effort level
   - Next action

2. **Pipeline Card**
   - Deal name
   - Stage (New → Evaluating → Pursuing → Won/Passed)
   - Progress bar
   - Key metrics

#### Investments View
**Filters:** All | Positions | Watchlist | Intelligence

**Card Types:**
1. **Position Card**
   - Ticker symbol
   - Current value / gain%
   - Quantity, entry price
   - Position size

2. **Watchlist Card**
   - Ticker
   - Current price
   - Target entry
   - Distance to target

3. **Intelligence Card**
   - Topic
   - Bullish/Bearish indicator
   - Source
   - Key insight summary

#### Activity Feed (New)
**Chronological stream of everything**
- Real-time updates from messages
- Scraped data additions
- Research findings
- Auto-categorized by source

### 2.3 Visual Design System

**Colors:**
- Background: #0f0f0f (dark) or #ffffff (light) - user toggle
- Card Background: rgba(255,255,255,0.05) / #f5f5f5
- YouTube Category: #FF0000
- Business Category: #10B981
- Investments Category: #3B82F6
- Text Primary: #ffffff / #1f2937
- Text Secondary: #9ca3af / #6b7280
- Border: rgba(255,255,255,0.1) / #e5e7eb

**Typography:**
- Font: Inter (Google Fonts)
- Headings: 600 weight
- Body: 400 weight
- Card Title: 16px
- Card Body: 14px
- Meta: 12px

**Spacing:**
- Card Padding: 20px
- Card Gap: 16px
- Section Gap: 32px
- Container Max: 1400px

---

## 3. Functional Fixes

### 3.1 Remove Non-Functional Components
**DELETE:**
- Services tab (entirely non-functional)
- Automations tab (entirely non-functional)
- Tasks tab (non-functional)
- CRM tab (no data)
- Pipeline tab (redundant with Business)
- Usage tab (fake data)
- Knowledge tab (non-functional)

**CONSOLIDATE:**
- Tools tab → into Business as "Internal Tools" section
- Research notes → into each category

### 3.2 Fix Broken Features

#### Duplicate Function Cleanup
Remove all duplicate function definitions from app.js:
- `showContentPipeline()` (keep one)
- `addToPipeline()` (keep one)
- `saveScript()` (keep one)
- `exportToYouTube()` (keep one)
- `showPerformanceAnalyzer()` (keep one)
- `calculatePerformance()` (keep one)
- etc.

#### Real Data Sources
Replace fake/hardcoded data:
- Usage budget/spend → calculate from real tool usage OR remove
- All "-" stats → remove or show "No data yet" state
- Static numbers → dynamic from JSON

### 3.3 New Auto-Logging System

**When Steven messages me:**
```javascript
// Auto-categorize and log
function logUserActivity(message, category, type) {
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    source: 'user_message',
    category: category, // youtube|business|investments
    type: type, // note|decision|question|task
    title: extractTitle(message),
    content: message,
    metadata: { sessionKey, agentId },
    confidence: 100,
    verified: true
  };
  
  appendToActivityLog(entry);
  refreshDashboard();
}
```

**When scraping finds data:**
```javascript
function logScrapedData(data, source, category) {
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    source: source, // 'viewstats_scraper'|'x_com_scraper'|etc
    category: category,
    type: determineType(data),
    title: data.title,
    content: summarize(data),
    metadata: { url: data.url, views: data.views, ... },
    confidence: calculateConfidence(data),
    verified: false // pending review
  };
  
  appendToActivityLog(entry);
}
```

---

## 4. Technical Implementation

### 4.1 HTML Structure (Simplified)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Nox Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <header class="nav-header">
    <nav>
      <a href="#youtube" class="nav-pill active">YouTube</a>
      <a href="#business" class="nav-pill">Business</a>
      <a href="#investments" class="nav-pill">Investments</a>
      <a href="#activity" class="nav-pill">Activity</a>
    </nav>
    <input type="search" class="global-search" placeholder="Search...">
  </header>
  
  <main id="app">
    <!-- Content dynamically rendered -->
  </main>
  
  <script src="app.js"></script>
</body>
</html>
```

### 4.2 JavaScript Architecture
```javascript
// app.js - Modular structure
const NoxDashboard = {
  // State
  data: {},
  currentView: 'youtube',
  filters: {},
  
  // Initialization
  async init() {
    await this.loadData();
    this.render();
    this.bindEvents();
  },
  
  // Data Loading
  async loadData() {
    const files = ['youtube', 'business', 'investments', 'activity'];
    for (const file of files) {
      this.data[file] = await fetch(`data/${file}.json`).then(r => r.json());
    }
  },
  
  // Rendering
  render() {
    const view = this.currentView;
    const container = document.getElementById('app');
    container.innerHTML = Views[view].render(this.data[view]);
  },
  
  // Activity Logging
  logActivity(entry) {
    // Append to activity.json
    // Trigger re-render if on activity view
  }
};

// View modules
const Views = {
  youtube: {
    render(data) { /* render YouTube cards */ }
  },
  business: {
    render(data) { /* render Business cards */ }
  },
  investments: {
    render(data) { /* render Investments cards */ }
  },
  activity: {
    render(data) { /* render Activity feed */ }
  }
};

// Initialize
NoxDashboard.init();
```

### 4.3 CSS Structure (Minimal)
```css
/* Core layout */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #0f0f0f; color: #fff; }

/* Navigation */
.nav-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; }
.nav-pill { padding: 8px 16px; border-radius: 20px; }
.nav-pill.active { background: rgba(255,255,255,0.1); }

/* Cards */
.card {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-2px); }

/* Category colors */
.category-youtube { border-left: 3px solid #FF0000; }
.category-business { border-left: 3px solid #10B981; }
.category-investments { border-left: 3px solid #3B82F6; }
```

---

## 5. Migration Plan

### Phase 1: Cleanup (Batch 1)
1. Remove all non-functional tabs
2. Delete duplicate functions
3. Remove hardcoded fake data
4. Delete unused CSS

### Phase 2: Restructure (Batch 2)
1. Create new simplified HTML
2. Rewrite app.js with modular architecture
3. Create activity.json schema
4. Implement new card components

### Phase 3: Features (Batch 3)
1. Implement auto-logging system
2. Add search functionality
3. Add filtering by category/type
4. Add markdown rendering for notes

### Phase 4: Polish (Batch 4)
1. Add dark/light mode toggle
2. Optimize performance
3. Add loading states
4. Mobile responsiveness testing

---

## 6. Success Criteria

**Must Have:**
- [ ] Only 4 navigation items (YouTube, Business, Investments, Activity)
- [ ] No fake data anywhere
- [ ] All cards display real information from JSON
- [ ] Auto-logging works for user messages
- [ ] Auto-logging works for scraped data
- [ ] Clean, minimal visual design
- [ ] Mobile responsive

**Should Have:**
- [ ] Search across all categories
- [ ] Filter by type within categories
- [ ] Confidence scores displayed
- [ ] Source attribution on all items
- [ ] Activity feed shows chronological log

**Nice to Have:**
- [ ] Dark/light mode
- [ ] Real-time updates
- [ ] Offline support
- [ ] Export functionality

---

## 7. Anti-Patterns to Avoid

❌ **DON'T:**
- Create placeholder tabs "for future use"
- Add mock data for visual appeal
- Over-complicate the UI with too many options
- Duplicate code across functions
- Add features before fixing broken ones

✅ **DO:**
- Keep it simple - less is more
- Show "No data yet" instead of fake numbers
- Fix bugs immediately, don't postpone
- Test on mobile throughout
- Document data schemas clearly

---

**End of Overhaul Plan**
