# UPGRADE PLAN V2 — Nox Dashboard
## Inspired by Matthew Berman's "25+ OpenClaw Use Cases"

**Created:** 2026-02-13  
**Source:** [Berman YouTube Video](https://www.youtube.com/watch?v=Q7r--i9lLck) + [Prompts Gist](https://gist.github.com/mberman84/065631c62d6d8f30ecb14748c00fc6d9)  
**Target:** `~/Desktop/Nox Builds/nox-dashboard/`

---

## Executive Summary

The current Nox Dashboard has **12 tabs** (Dashboard, YouTube, Business, Investments, CRM, Pipeline, Usage, Tools, Services, Automations, Research, Audits) with JSON-file backing. Berman's video showcases **11 distinct use cases** with detailed implementation specs. Here's the gap:

| Berman Feature | Dashboard Status | Gap Level |
|---|---|---|
| 1. Personal CRM Intelligence | ✅ CRM tab exists (`crm.json`) | **ENHANCE** — missing auto-ingestion, scoring, AI filtering, semantic search |
| 2. Knowledge Base (RAG) | ❌ Not implemented | **NEW** — full RAG system needed |
| 3. Content Idea Pipeline | ⚠️ Pipeline tab exists (`pipeline.json`) | **ENHANCE** — missing semantic dedupe, research integration, task creation |
| 4. Twitter/X Search (Cost-Optimized) | ⚠️ `x-intel-data.json` exists | **ENHANCE** — missing tiered retrieval, cost tracking, caching |
| 5. YouTube Analytics + Competitor Tracking | ⚠️ YouTube tab + `competitors.json` exist | **ENHANCE** — missing daily metrics, chart generation, moving averages |
| 6. Nightly Business Briefing (AI Council) | ❌ Not implemented | **NEW** — multi-persona review council |
| 7. HubSpot/CRM Natural Language Access | ❌ Not implemented | **SKIP** — Steven doesn't use HubSpot; CRM tab suffices |
| 8. AI Content Humanizer | ❌ Not implemented | **NEW** — text rewriting tool |
| 9. Image/Video Generation | ⚠️ Services tab has Higgsfield/Kling tools | **ENHANCE** — missing iterative chat-based workflow |
| 10. Task Management (To-Do) | ❌ Not implemented | **NEW** — action item extraction + task management |
| 11. AI Usage & Cost Tracker | ⚠️ Usage tab exists (`usage.json`) | **ENHANCE** — missing per-call logging, model routing suggestions, JSONL tracking |

**Additional from video timestamps not in gist:**
- **Memory system** (23:30) — OpenClaw has built-in memory; dashboard could surface/manage it
- **Backup system** (22:42) — automated data backup/export
- **Automations registry** (21:25) — already exists as tab, needs enhancement

---

## Gap Analysis Detail

### 🔴 COMPLETELY MISSING (New Features Needed)

#### 1. Knowledge Base (RAG) Tab
**What Berman has:** Full RAG system — save URLs/files/tweets, chunk + embed, semantic search with cited answers.  
**What we have:** Nothing. Research notes are manually written.  
**Dashboard Impact:** New `knowledge-base` tab + `data/knowledge-base.json` for metadata (actual content in SQLite).

#### 2. Nightly Business Briefing
**What Berman has:** Multi-persona AI council (LeadAnalyst → 4 reviewers → Moderator) producing scored recommendations.  
**What we have:** Nothing automated. `state.json` has manual priorities.  
**Dashboard Impact:** New `briefings` tab or integrate into Dashboard home as a daily briefing card.

#### 3. Task Management / To-Do
**What Berman has:** Extract action items from meetings/chat, approval flow, create in Todoist/Asana.  
**What we have:** Nothing. Pipeline has video ideas but no general task management.  
**Dashboard Impact:** New `tasks` tab + `data/tasks.json`.

#### 4. AI Content Humanizer
**What Berman has:** Paste text → detect AI artifacts → rewrite with human cadence → channel-tune.  
**What we have:** Nothing.  
**Dashboard Impact:** New tool in Services tab (interactive text tool, no persistent data needed).

#### 5. Backup System
**What Berman has:** Automated backup of all data/configs.  
**What we have:** Git-backed but no explicit backup UI or automation tracking.  
**Dashboard Impact:** Add backup status card to Dashboard home + backup automation entry.

### 🟡 PARTIALLY IMPLEMENTED (Enhancement Needed)

#### 6. CRM Intelligence Enhancement
**Current:** Basic contact list with manual entries. Fields: name, type, status, source, skills, communications.  
**Missing:** Auto-ingestion from email/calendar, AI filtering (2-stage), contact scoring algorithm, semantic search, learning system, deduplication engine.  
**Enhancement:** Add scoring, interaction timeline, staleness alerts, search.

#### 7. Content Pipeline Enhancement  
**Current:** Pipeline tab with video ideas, stages, viral scores.  
**Missing:** Semantic dedupe gate (40% similarity threshold), research integration, brief auto-assembly, task creation.  
**Enhancement:** Add dedupe indicator, research links, status workflow.

#### 8. Twitter/X Intelligence Enhancement
**Current:** `x-intel-data.json` with topic categories and trend scores.  
**Missing:** Tiered retrieval (FxTwitter → paid → official API), cost logging per tier, caching, query decomposition.  
**Enhancement:** Add cost tracking, source tier indicators, cache status.

#### 9. YouTube Analytics Enhancement
**Current:** Outlier videos tracked, competitors listed.  
**Missing:** Daily channel metrics (views, watch time, CTR, subs), chart generation, 7-day moving averages, competitor upload cadence.  
**Enhancement:** Add `data/analytics.json` for daily metrics, chart rendering in-tab.

#### 10. Usage Tracker Enhancement
**Current:** Basic `usage.json` with monthly budget, provider breakdown.  
**Missing:** Per-call JSONL logging, cost-per-task-type breakdown, model routing suggestions, optimization flags, daily trend charts.  
**Enhancement:** Add detailed cost logging, optimization recommendations panel.

#### 11. Image/Video Generation Enhancement
**Current:** Higgsfield batch generator, Kling multi-shot in Services tab.  
**Missing:** Iterative chat-based workflow, image editing/inpainting, variant generation, session context tracking.  
**Enhancement:** Add interactive generation tool to Services.

---

## Feature Specifications & JSON Schemas

### NEW: `data/tasks.json`
```json
{
  "schemaVersion": "1.0.0",
  "lastUpdated": "ISO8601",
  "tasks": [
    {
      "id": "task-NNN",
      "title": "Task description",
      "description": "Detailed description",
      "status": "pending|approved|in_progress|done|cancelled",
      "priority": "high|medium|low",
      "source": "meeting|chat|manual|pipeline",
      "sourceRef": "meeting-id or message ref",
      "assignee": "steven|nox|editor",
      "dueDate": "ISO8601 or null",
      "createdAt": "ISO8601",
      "completedAt": "ISO8601 or null",
      "tags": ["tag1", "tag2"],
      "linkedIds": ["idea-001", "contact-001"]
    }
  ]
}
```

### NEW: `data/knowledge-base.json` (metadata index)
```json
{
  "schemaVersion": "1.0.0",
  "lastUpdated": "ISO8601",
  "stats": {
    "totalSources": 0,
    "totalChunks": 0,
    "byType": { "article": 0, "video": 0, "tweet": 0, "pdf": 0, "text": 0 }
  },
  "recentSources": [
    {
      "id": "kb-NNN",
      "title": "Source title",
      "url": "https://...",
      "sourceType": "article|video|tweet|pdf|text",
      "summary": "Brief summary",
      "tags": ["tag1"],
      "addedAt": "ISO8601",
      "chunkCount": 12
    }
  ]
}
```

### NEW: `data/briefings.json`
```json
{
  "schemaVersion": "1.0.0",
  "lastUpdated": "ISO8601",
  "briefings": [
    {
      "id": "brief-YYYY-MM-DD",
      "date": "ISO8601",
      "weeklyScore": 72,
      "monthlyScore": 68,
      "blendedScore": 70,
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "2-3 sentences",
          "impact": 85,
          "effort": 40,
          "confidence": 78,
          "priority": 82.3,
          "status": "new|actioned|dismissed",
          "consensusNotes": "Council agreed because..."
        }
      ],
      "signalCount": 45,
      "modelUsed": "claude-opus-4"
    }
  ]
}
```

### NEW: `data/analytics.json`
```json
{
  "schemaVersion": "1.0.0",
  "lastUpdated": "ISO8601",
  "channelId": "@StevenSongIRL",
  "dailyStats": [
    {
      "date": "2026-02-13",
      "views": 45000,
      "watchTimeMinutes": 12500,
      "avgViewDuration": 185,
      "subscribersGained": 120,
      "impressions": 250000,
      "ctr": 5.2
    }
  ],
  "movingAverages": {
    "views7d": 42000,
    "views30d": 38000,
    "subsGained7d": 95
  },
  "competitorSnapshots": [
    {
      "channelId": "@RogersPets-w5s",
      "date": "2026-02-13",
      "subscribers": 1200000,
      "recentUploads": 3,
      "uploadCadence": "2.1/week"
    }
  ]
}
```

### ENHANCED: `data/crm.json` additions
```json
{
  "contacts": [
    {
      "...existing fields...": "",
      "score": 75,
      "scoreBreakdown": {
        "emailExchanges": 15,
        "meetings": 6,
        "titleBonus": 15,
        "recencyBonus": 10,
        "crossChannelBonus": 25
      },
      "interactionTimeline": [
        { "date": "ISO8601", "type": "email|meeting|chat", "summary": "Brief" }
      ],
      "staleDays": 14,
      "autoIngested": false,
      "aiClassification": "approved|rejected",
      "embedding": null
    }
  ]
}
```

### ENHANCED: `data/usage.json` additions
```json
{
  "...existing fields...": "",
  "dailyCosts": [
    { "date": "2026-02-13", "calls": 245, "inputTokens": 1200000, "outputTokens": 450000, "cost": 42.50 }
  ],
  "byTaskType": [
    { "taskType": "x-research", "calls": 50, "cost": 12.30, "primaryModel": "claude-sonnet" }
  ],
  "optimizationFlags": [
    { "taskType": "crm-ingestion", "currentModel": "claude-opus", "suggestedModel": "gemini-flash", "potentialSavings": "$15/week" }
  ],
  "weeklyTrend": [
    { "week": "2026-W07", "cost": 285.00, "calls": 1800 }
  ]
}
```

### ENHANCED: `data/pipeline.json` additions
```json
{
  "ideas": [
    {
      "...existing fields...": "",
      "dedupeScore": 0.12,
      "dedupeMatch": null,
      "researchLinks": ["note-047", "kb-003"],
      "embedding": null,
      "slug": "what-if-pet-had-more-evolutions"
    }
  ]
}
```

---

## UI/UX Requirements

### New Tabs
1. **📝 Tasks** — Kanban-style columns (Pending → Approved → In Progress → Done). Filter by source, priority, assignee. Quick-add from header.
2. **📚 Knowledge Base** — Search bar prominent. Source type filter chips. Recent additions list. "Ask a question" input that triggers RAG retrieval.
3. **📊 Analytics** (rename from enhancing YouTube) — Daily metrics charts (Chart.js line charts), competitor comparison cards, moving average overlays.
4. **📋 Briefings** — Latest briefing card on Dashboard home. Full briefing tab with recommendation cards (impact/effort/confidence badges), historical list.

### Enhanced Existing Tabs
5. **👥 CRM** — Add contact score badges, staleness indicators (🟢 <7d, 🟡 7-30d, 🔴 >30d), search bar, sort by score.
6. **📊 Pipeline** — Add dedupe status indicator (✅ unique / ⚠️ similar found), linked research chips.
7. **💰 Usage** — Add daily cost chart, task-type breakdown pie chart, optimization suggestions panel with "apply" buttons.
8. **🚀 Services** — Add "Humanizer" tool card (inline text rewriting), "Image Generator" interactive tool.
9. **⚙️ Automations** — Add backup automation entry with last-run status.

### Dashboard Home Enhancements
- **Daily Briefing Card** — Show latest blended score + top 3 recommendations
- **Task Summary Card** — "5 tasks pending approval, 3 in progress"
- **Backup Status Card** — "Last backup: 2h ago ✅"
- **Knowledge Base Card** — "47 sources indexed, 823 chunks"

---

## Implementation Batches

### BATCH 1: Core Workflow Features (CRM + Pipeline + Tasks)
**Priority:** HIGHEST — These are daily-use features  
**Estimated effort:** 4-6 hours

**Deliverables:**
1. Create `data/tasks.json` with schema above
2. Add 📝 Tasks tab to `index.html` with Kanban UI
3. Enhance CRM tab: add score display, staleness badges, sort/search
4. Enhance Pipeline tab: add dedupe score display, research links
5. Add Task Summary card to Dashboard home
6. Update `SCHEMA.md` with new schemas
7. Wire up all data loading/rendering in JS

**Testing:**
- [ ] Tasks tab renders with sample data
- [ ] CRM contacts show scores and staleness correctly
- [ ] Pipeline shows dedupe indicators
- [ ] Dashboard home shows task summary
- [ ] Global search includes tasks

---

### BATCH 2: Cost & Analytics Tracking (Usage + Analytics)
**Priority:** HIGH — Saves money + provides strategic data  
**Estimated effort:** 4-6 hours

**Deliverables:**
1. Create `data/analytics.json` with daily metrics schema
2. Add/enhance Analytics section in YouTube tab (or new tab)
3. Add Chart.js line charts for daily views, watch time, CTR
4. Add competitor snapshot cards with upload cadence
5. Enhance Usage tab: daily cost chart, task-type pie chart, optimization flags panel
6. Add moving average calculations in JS
7. Add Analytics + Usage summary cards to Dashboard home

**Testing:**
- [ ] Analytics charts render with sample data
- [ ] Moving averages calculate correctly
- [ ] Usage pie chart shows task-type breakdown
- [ ] Optimization flags display with suggestions
- [ ] Competitor cards show upload cadence

---

### BATCH 3: Self-Service Tools (Humanizer + Briefings + Services)
**Priority:** MEDIUM — Productivity boosters  
**Estimated effort:** 3-5 hours

**Deliverables:**
1. Create `data/briefings.json` with schema
2. Add 📋 Briefings tab with recommendation cards (impact/effort/confidence visual badges)
3. Add Daily Briefing card to Dashboard home (blended score + top 3)
4. Add "Humanizer" tool to Services tab — textarea input, rewrite output, channel selector
5. Add "Image Generator" tool placeholder to Services
6. Enhance Automations tab with backup automation entry
7. Add Backup Status card to Dashboard home

**Testing:**
- [ ] Briefings tab renders recommendation cards
- [ ] Dashboard shows latest briefing summary
- [ ] Humanizer tool has working textarea + channel dropdown
- [ ] Backup status card shows last backup time
- [ ] Services tab shows new tool cards

---

### BATCH 4: Knowledge & Backup Systems
**Priority:** MEDIUM — Infrastructure features  
**Estimated effort:** 3-5 hours

**Deliverables:**
1. Create `data/knowledge-base.json` with metadata schema
2. Add 📚 Knowledge Base tab with search UI, source type filters, recent sources list
3. Add "Ask a question" input (UI only — backend RAG is separate)
4. Add Knowledge Base summary card to Dashboard home
5. Wire backup automation to show real git commit history
6. Add data export button (download all JSON as ZIP)
7. Final `SCHEMA.md` update with all new schemas
8. Update `meta.json` with new freshness tracking fields

**Testing:**
- [ ] Knowledge Base tab renders with sample data
- [ ] Source type filter chips work
- [ ] Search filters KB entries
- [ ] Dashboard shows KB stats card
- [ ] Export button generates downloadable ZIP
- [ ] All new schemas documented in SCHEMA.md

---

## Post-Implementation: Backend Automation (Separate from Dashboard)

These are **backend systems** that feed data INTO the dashboard but live outside it:

1. **CRM Auto-Ingestion** — Cron job scanning Gmail/Calendar → populates `crm.json`
2. **RAG Pipeline** — SQLite + embeddings system → populates `knowledge-base.json`
3. **Nightly Briefing Generator** — AI council pipeline → populates `briefings.json`
4. **YouTube Analytics Collector** — YouTube API daily cron → populates `analytics.json`
5. **Usage Logger** — JSONL wrapper for all API calls → populates `usage.json`
6. **Content Dedupe Engine** — Embedding comparison for pipeline ideas

These are separate projects that can be built incrementally. The dashboard should display whatever data exists in the JSON files, gracefully handling empty/missing data.

---

## Summary

| Batch | Features | New Files | New Tabs | Est. Hours |
|-------|----------|-----------|----------|------------|
| 1 | Tasks, CRM enhance, Pipeline enhance | `tasks.json` | 📝 Tasks | 4-6h |
| 2 | Analytics, Usage enhance | `analytics.json` | 📊 Analytics | 4-6h |
| 3 | Briefings, Humanizer, Backup status | `briefings.json` | 📋 Briefings | 3-5h |
| 4 | Knowledge Base, Export, Schema docs | `knowledge-base.json` | 📚 Knowledge Base | 3-5h |
| **Total** | **11 Berman features covered** | **4 new JSON files** | **4 new tabs** | **14-22h** |

---

*Plan written by Nox (Opus) — ready for execution by main session.*
