# Nox Dashboard Upgrade Plan
## Based on Matthew Berman's 25+ OpenClaw Use Cases

---

## Executive Summary

**Current State:** The nox-dashboard has strong data collection (YouTube, X.com, ViewStats) but lacks systematic workflow management, CRM, cost tracking, and self-service features that Berman's setup includes.

**Key Gaps Identified:**
1. No CRM system for managing editor hiring pipeline
2. No cost tracking per project/video
3. No systematic backup beyond git
4. No self-service portal for tools
5. No usage tracking for API costs
6. No humanizer/quality check system
7. No automated overnight analysis pipeline
8. No knowledge base with cross-references

---

## BATCH 1: CRM & Pipeline Management

### Feature 1.1: Personal CRM Tab
**Purpose:** Track all relationships - editors, candidates, collaborators

**JSON Schema:**
```json
{
  "contacts": [{
    "id": "contact-001",
    "name": "Dibyendu M.",
    "type": "editor_candidate",
    "status": "applied",
    "source": "Upwork",
    "location": "Bangladesh",
    "earnings": "$200K+",
    "skills": ["Runway", "Midjourney", "Pika", "Veo"],
    "lastContact": "2026-02-13",
    "nextAction": "Review portfolio",
    "priority": "high",
    "notes": "Bloombrain agency, perfect fit message",
    "communications": [{
      "date": "2026-02-13",
      "type": "application_received",
      "content": "Hi, This is a perfect fit..."
    }]
  }]
}
```

**UI Requirements:**
- Kanban board view (Applied → Screening → Test Project → Hired → Active)
- Contact cards with earnings, skills, location
- Communication history timeline
- Next action reminders
- Filter by status, source, priority

**Implementation:**
- Create `data/crm.json`
- Add "CRM" tab to dashboard
- Build kanban board component
- Link to existing Upwork hiring data in state.json

---

### Feature 1.2: Video Idea Pipeline
**Purpose:** Systematic content ideation from outlier → validation → production

**JSON Schema:**
```json
{
  "pipeline": [{
    "id": "idea-001",
    "title": "What If [Pet] Had More Evolution Stages?",
    "source": "outlier_research",
    "sourceUrl": "https://youtube.com/...",
    "viralScore": 95,
    "status": "validated",
    "stage": "ready_to_produce",
    "targetChannel": "stevensongirl",
    "estimatedCost": "$250",
    "estimatedViews": "100K+",
    "assignedEditor": null,
    "createdAt": "2026-02-13",
    "validation": {
      "outlierCount": 3,
      "avgViralScore": 90,
      "competitorAnalysis": "..."
    }
  }]
}
```

**Stages:**
1. Idea Captured (from outliers/research)
2. Validated (3+ outliers confirm opportunity)
3. Brief Created (content brief written)
4. Editor Assigned
5. In Production
6. Published
7. Performance Review

**UI Requirements:**
- Pipeline board with drag-drop
- Auto-populate from outlier videos
- One-click create content brief
- Assign to editor from CRM
- Track cost vs estimated

---

## BATCH 2: Cost Tracking & Analytics

### Feature 2.1: Usage Tracker (Cost Management)
**Purpose:** Track all API costs per project to optimize spend

**JSON Schema:**
```json
{
  "usage": {
    "monthlyBudget": 2000,
    "currentSpend": 1250,
    "alerts": [{
      "threshold": 80,
      "triggered": false
    }],
    "projects": [{
      "id": "project-001",
      "name": "Ice Dragon Video",
      "channel": "stevensongirl",
      "costs": {
        "higgsfield": 45.50,
        "kling": 12.00,
        "openai": 8.25,
        "total": 65.75
      },
      "editorCost": 250,
      "totalCost": 315.75,
      "estimatedViews": 100000,
      "cpm": 3.16
    }]
  }
}
```

**UI Requirements:**
- Monthly budget bar with alerts
- Per-project cost breakdown
- Cost per 1K views (CPM) tracking
- Compare estimated vs actual costs
- API usage by provider (OpenAI, Higgsfield, Kling, etc.)

---

### Feature 2.2: Analytics Tracker
**Purpose:** Monitor performance across all channels

**JSON Schema:**
```json
{
  "analytics": {
    "channels": [{
      "name": "stevensongirl",
      "subscribers": 125000,
      "avgViews": 45000,
      "avgRetention": 62,
      "growthRate": 12,
      "topPerforming": ["video-id-1", "video-id-2"],
      "alerts": [{
        "type": "view_drop",
        "message": "Last 3 videos underperforming by 30%"
      }]
    }]
  }
}
```

**UI Requirements:**
- Channel performance dashboard
- Alert system for anomalies
- Compare to competitor performance
- Retention tracking
- Growth trajectory charts

---

## BATCH 3: Automation & Self-Service

### Feature 3.1: Services Directory
**Purpose:** Self-service portal for editors to access tools

**JSON Schema:**
```json
{
  "services": [{
    "id": "higgsfield-batch",
    "name": "Higgsfield Batch Generator",
    "description": "Generate 888 images from CSV prompts",
    "accessLevel": "editor",
    "url": "/tools/higgsfield-batch",
    "status": "available",
    "usageCount": 12
  }, {
    "id": "kling-multishot",
    "name": "Kling Multi-Shot Generator",
    "description": "Generate multi-shot clips from single image",
    "accessLevel": "editor",
    "url": "/tools/kling-multishot",
    "status": "available",
    "usageCount": 8
  }]
}
```

**UI Requirements:**
- Grid of service cards
- Launch button for each tool
- Usage tracking per service
- Access control (admin vs editor)
- Status indicators (available/maintenance)

---

### Feature 3.2: Automations Hub
**Purpose:** View and manage all automated workflows

**JSON Schema:**
```json
{
  "automations": [{
    "id": "viewstats-scraper",
    "name": "ViewStats Hourly Scrape",
    "schedule": "0 * * * *",
    "lastRun": "2026-02-13T17:00:00Z",
    "status": "active",
    "output": "viewstats_hourly_output.json",
    "nextAction": "2 AM analysis"
  }, {
    "id": "youtube-scraper",
    "name": "YouTube Hourly Scrape",
    "schedule": "30 * * * *",
    "lastRun": "2026-02-13T17:30:00Z",
    "status": "active"
  }]
}
```

**UI Requirements:**
- List of all automations
- Run status (active/paused/error)
- Last run timestamp
- Output file links
- Manual trigger button
- Error logs

---

## BATCH 4: Knowledge Management

### Feature 4.1: Enhanced Knowledge Base
**Purpose:** Centralized, searchable research with cross-references

**JSON Schema:**
```json
{
  "knowledge": [{
    "id": "note-047",
    "title": "Seedance 2.0 Multi-Lens Storytelling",
    "category": "AI Video Tools",
    "tags": ["seedance-2.0", "bytedance", "multi-lens"],
    "related": ["note-045", "note-022", "active-002"],
    "confidence": 85,
    "content": "...",
    "sourceUrls": ["..."],
    "extractedInsights": [
      "Multi-lens storytelling reduces production time",
      "Native audio generation eliminates dubbing step"
    ]
  }]
}
```

**Enhancements to Existing:**
- Cross-reference linking (bidirectional)
- Extracted insights (bullet points)
- Full-text search
- Tag-based filtering
- Related notes suggestions
- Export to content brief

---

### Feature 4.2: Memory Consolidation
**Purpose:** Auto-summarize daily notes into MEMORY.md

**Process:**
1. Review daily memory files
2. Extract key decisions, learnings, feedback
3. Update MEMORY.md with distilled wisdom
4. Archive raw daily notes

**Automation:** Weekly cron to consolidate

---

## BATCH 5: Backup & Data Integrity

### Feature 5.1: Backup System
**Purpose:** Beyond git - automated data snapshots

**Implementation:**
- Daily export of all JSON data
- Versioned backups (7-day retention)
- Cloud backup option (S3/R2)
- One-click restore

**UI:**
- Backup status dashboard
- Last backup timestamp
- Restore from backup button

---

## Implementation Order

### Phase 1 (Week 1): Core Workflow
1. CRM Tab with Kanban board
2. Video Idea Pipeline
3. Link pipeline to existing outlier data

### Phase 2 (Week 2): Cost Management
1. Usage Tracker with monthly budget
2. Per-project cost tracking
3. Cost per view analytics

### Phase 3 (Week 3): Self-Service
1. Services Directory
2. Automations Hub
3. Editor onboarding flow

### Phase 4 (Week 4): Knowledge & Backup
1. Enhanced Knowledge Base with cross-references
2. Backup system
3. Memory consolidation automation

---

## Testing Criteria

**Per Feature:**
- [ ] JSON schema validation passes
- [ ] UI renders correctly on desktop
- [ ] Data persists on refresh
- [ ] Cross-links work (if applicable)
- [ ] Mobile responsive

**Integration Tests:**
- [ ] CRM → Pipeline → Cost tracking flow works
- [ ] New outlier → Pipeline idea auto-populates
- [ ] Editor assignment updates CRM status
- [ ] Costs aggregate correctly per project

**User Acceptance:**
- [ ] Can track editor from application to hire
- [ ] Can see cost breakdown per video
- [ ] Can find related research notes
- [ ] Can trigger automations manually

---

## Files to Create/Modify

**New Files:**
- `data/crm.json` - Contact management
- `data/pipeline.json` - Video idea pipeline
- `data/usage.json` - Cost tracking
- `data/services.json` - Services directory
- `data/automations.json` - Automation configs

**Modified:**
- `index.html` - New tabs: CRM, Pipeline, Usage, Services, Automations
- `app.js` - New controllers for each tab
- `style.css` - Kanban board styling, service cards
- `state.json` - Add activeWorkflows section

---

*Plan created: 2026-02-13*
*Based on Matthew Berman's OpenClaw use cases video*
