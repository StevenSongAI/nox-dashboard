# Dashboard Data Schema

This document defines the JSON schema contracts for all dashboard data files to ensure consistency and prevent schema drift.

---

## new-business.json - Business Opportunities

**All opportunity entries must follow this exact schema:**

```json
{
  "id": "opp-NNN",                        // REQUIRED: Unique ID (sequential)
  "name": "Opportunity Title",            // REQUIRED: Human-readable title
  "description": "Full description...",   // REQUIRED: Detailed description
  "alignment": "HIGH|MEDIUM|LOW",         // REQUIRED: Strategic alignment
  "status": "new|evaluating|pursuing|passed|won", // REQUIRED: Current status
  "potentialRevenue": "$X-Y/month",       // REQUIRED: Revenue estimate or cost savings
  "effort": "Low|Medium|High",            // REQUIRED: Effort to execute
  "nextStep": "Concrete action...",       // REQUIRED: Single next action (string, not array)
  "createdAt": "ISO8601 timestamp",       // REQUIRED: Creation timestamp
  "marketData": {                         // OPTIONAL: Market validation
    "tam": "Total addressable market",
    "problem": "Problem being solved",
    "targetAudience": "Who this is for",
    "competitors": ["List", "of", "competitors"],
    "differentiation": "What makes this unique",
    "validationSignal": "Evidence of demand"
  },
  "linkedResearch": ["note-XXX"],         // OPTIONAL: Links to research.json entries
  "linkedProject": "Project name",        // OPTIONAL: Related project
  "tags": ["tag1", "tag2"]                // OPTIONAL: Categorization tags
}
```

### Field Naming Rules

❌ **DO NOT USE:**
- `title` (use `name` instead)
- `nextSteps` as array (use `nextStep` as string)
- `revenueModel`, `targetMarket`, `marketSize`, `competitiveAdvantage` at top level (nest in `marketData`)

✅ **ALWAYS USE:**
- `name` for opportunity title
- `nextStep` as a single string (not array)
- `marketData` object for market information
- `linkedResearch` for references to research notes
- ISO 8601 timestamps with timezone for all dates

### Status Values

- `new` - Just identified, not yet evaluated
- `evaluating` - Research/validation in progress
- `pursuing` - Actively working on this
- `passed` - Decided not to pursue
- `won` - Successfully launched/completed

### Schema Version

**Current version:** 2.0 (standardized Feb 12, 2026)

**Changes from 1.0:**
- Renamed `title` → `name`
- Changed `nextSteps` array → `nextStep` string
- Moved market fields into `marketData` object
- Added `linkedResearch`, `linkedProject`, `tags` fields

---

## youtube.json - Outlier Videos

```json
{
  "outlierVideos": [
    {
      "id": "yt-XXXXX",                   // REQUIRED: Unique ID
      "title": "Video title",             // REQUIRED: Full video title
      "url": "https://youtube.com/...",   // REQUIRED: Full YouTube URL
      "channel": "Channel name",          // REQUIRED: Creator name
      "views": "1.2M views",              // REQUIRED: View count
      "viralScore": 150,                  // REQUIRED: Multiplier (e.g., 150x)
      "category": "gaming",               // REQUIRED: Content category
      "addedAt": "ISO8601 timestamp",     // REQUIRED: When added to dashboard
      "source": "viewstats|youtube_search|manual", // REQUIRED: How found
      "relevanceScore": 85,               // OPTIONAL: 0-100 relevance to Steven's content
      "notes": "Why this matters..."      // OPTIONAL: Strategic notes
    }
  ],
  "contentBriefs": [...]                  // Content opportunity briefs
}
```

### Content Brief Schema

Only add content briefs when:
✅ Backed by 3+ outlier videos (50K+ views, 5x+ viral score)
✅ Clear opportunity signal (not speculation)
✅ Production-ready (thumbnail ideas, script structure, viral mechanics)

❌ DO NOT add briefs for:
- Videos Steven is already making
- Low-effort speculation without outlier research
- Planning documents (research first, document second)

---

## investments.json - Investment Intelligence

```json
{
  "intelligence": [
    {
      "id": "intel-XXX",                  // REQUIRED: Unique ID
      "ticker": "AAPL",                   // REQUIRED: Stock ticker or crypto symbol
      "title": "Brief headline",          // REQUIRED: Intelligence summary
      "type": "buy|sell|hold|news",       // REQUIRED: Action type
      "content": "Full analysis...",      // REQUIRED: Detailed intelligence
      "date": "ISO8601 timestamp",        // REQUIRED: Publication date
      "confidence": 75,                   // REQUIRED: 0-100 confidence score
      "sources": ["URL1", "URL2"],        // REQUIRED: Source URLs
      "actionable": true,                 // REQUIRED: Is this actionable?
      "tags": ["earnings", "technical"]   // OPTIONAL: Categorization
    }
  ]
}
```

### Intelligence Rules

✅ **ADD when:**
- NEW buy opportunities (stocks Steven doesn't own)
- SELL signals for existing positions (red flags worth exiting)

❌ **DO NOT add:**
- Performance updates on stocks Steven already owns (he can check his broker)
- General market news without actionable decision
- Stocks Steven doesn't own without clear buy signal

**Steven's current holdings:**
- AAPL: $143K CAD
- BTC: 0.5 BTC

---

## research.json - Research Notes

```json
{
  "notes": [
    {
      "id": "note-XXX",                   // REQUIRED: Unique ID
      "title": "Research title",          // REQUIRED: Topic summary
      "date": "ISO8601 timestamp",        // REQUIRED: Research date
      "category": "Category name",        // REQUIRED: Type of research
      "tags": ["tag1", "tag2"],           // REQUIRED: Searchable tags
      "content": "Full findings...",      // REQUIRED: Complete research (not link to file)
      "sourceUrls": ["URL1", "URL2"],     // REQUIRED: Source references
      "confidence": 85,                   // REQUIRED: 0-100 confidence score
      "status": "complete|active_research|blocked", // REQUIRED: Research status
      "priority": "high|medium|low",      // OPTIONAL: Importance
      "linkedYouTubeIds": ["yt-XXX"],     // OPTIONAL: Related outlier videos
      "relatedIds": ["brief-XXX"],        // OPTIONAL: Related dashboard entries
      "project": "Project name"           // OPTIONAL: Associated project
    }
  ]
}
```

### Research Note Rules

✅ **ADD when:**
- You have completed research with findings
- Full findings are in `content` field (not links to external files)
- Sources are cited with URLs

❌ **DO NOT add:**
- Task planning ("I should research X")
- TODO lists without research
- Links to files instead of actual content
- If research shows "couldn't find info", document that (documents dead ends)

---

## meta.json - Dashboard Metadata

```json
{
  "lastUpdated": "ISO8601 timestamp",     // Global last update time
  "updatedBy": "nox|steven|system",       // Who made the update
  "version": "1.0.XX",                    // Dashboard version
  "cacheBust": "YYYYMMDDTHHMM",           // Cache busting string
  "dataVersion": "XXX",                   // Data schema version
  "youtubeUpdated": "ISO8601 timestamp",  // Last YouTube data update
  "investmentsUpdated": "ISO8601 timestamp",
  "researchUpdated": "ISO8601 timestamp",
  "newBusinessUpdated": "ISO8601 timestamp",
  "toolsUpdated": "ISO8601 timestamp"
}
```

---

## state.json - Agent State

```json
{
  "lastHeartbeat": "ISO8601 timestamp",
  "totalHeartbeats": 134,
  "lastAction": "Description of last update",
  "nextPriority": "What to focus on next",
  "currentPriorities": {
    "category": "Priority description"
  },
  "dataFreshness": {
    "category": "YYYY-MM-DD - summary"
  },
  "recentFeedback": [
    {
      "date": "YYYY-MM-DD",
      "feedback": "Steven's feedback",
      "implication": "What this means"
    }
  ],
  "workThatLanded": [...],
  "workThatFlopped": [...],
  "lessonsLearned": [...]
}
```

---

## Schema Validation

### Manual Validation

Before committing changes to any data file:

1. ✅ All required fields present
2. ✅ Field names match schema exactly (no `title` when `name` expected)
3. ✅ Data types correct (string vs array vs object)
4. ✅ ISO 8601 timestamps with timezone
5. ✅ No placeholder/mock data
6. ✅ Sources cited for all claims

### Common Schema Violations

❌ Using `title` instead of `name` in opportunities
❌ Using `nextSteps` array instead of `nextStep` string
❌ Adding investment intel for stocks Steven already owns
❌ Creating content briefs for videos already in production
❌ Adding research notes that are just TODO lists
❌ Missing `marketData` object in new opportunities
❌ Forgetting to update `meta.json` and `state.json` after data changes

---

## Versioning

When making breaking schema changes:

1. Increment `dataVersion` in meta.json
2. Update this SCHEMA.md document
3. Add migration notes below
4. Update all existing entries to match new schema

---

## Migration History

### v2.0 (2026-02-12)
- Standardized opportunity schema across all 16 entries
- `title` → `name`
- `nextSteps` → `nextStep` (array to string)
- Consolidated market fields into `marketData` object
- Added `linkedResearch`, `linkedProject`, `tags`

### v1.0 (2026-02-07)
- Initial schema (inconsistent across files)

---

*Last updated: 2026-02-12*  
*Maintained by: Nox Work Agent*
