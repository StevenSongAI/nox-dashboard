# 🔍 Nox Outlier Scraper

**Automated YouTube outlier detection pipeline for the Nox Dashboard.**

Collects viral video data from ViewStats Pro and YouTube Search, scores relevance to your content strategy, and pushes findings directly to your dashboard — all on autopilot.

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    HOURLY SCRAPER                        │
│                   (zero AI cost)                         │
│                                                         │
│  ViewStats Pro ──→ Outlier videos (score, views, etc.)  │
│  YouTube Search ──→ Niche monitoring (trending content)  │
│                         │                                │
│                         ▼                                │
│              raw_data/YYYY-MM-DD.json                    │
│              (append-only, timestamped)                  │
└─────────────────────────────────────────────────────────┘
                          │
                    24 scrapes/day
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    DAILY ANALYZER                        │
│                  (Kimi K2.5 agent)                       │
│                                                         │
│  Relevance scoring ──→ Keyword matching                 │
│  Priority tiers ──→ high / medium / low                 │
│  Dashboard merge ──→ data/youtube.json                  │
│  Git push ──→ GitHub Pages auto-deploy                  │
└─────────────────────────────────────────────────────────┘
```

### Data Sources

| Source | What It Collects | Cost |
|--------|-----------------|------|
| **ViewStats Pro** | Outlier videos with X multiplier scores, category, channel, views | Free (Pro account) |
| **YouTube Search** | Videos matching niche queries, sorted by date or views | Free |

### Relevance Scoring

Every video is scored against your content strategy keywords:

| Priority | Score | Keywords |
|----------|-------|----------|
| 🔴 High (+30 each) | 50+ | ice dragon, pet evolution, creature evolution, AI coding agent, T-Rex, minecraft creature |
| 🟡 Medium (+15 each) | 25-49 | AI video, gaming, simulation, creature, monster, minecraft, comparison |
| ⚪ Low (-5 each) | 0-24 | reaction, vlog, unboxing, music video, shorts |

---

## Quick Start

### 1. Install

```bash
cd tools/outlier-scraper
python3 -m venv venv
source venv/bin/activate
pip install playwright pyyaml httpx
playwright install chromium
```

### 2. Login to ViewStats (one-time)

```bash
# Start OpenClaw browser first
python scraper.py --login
# Log in via the browser window, then press Enter
```

### 3. Run

```bash
# Full scrape (ViewStats + YouTube)
python scraper.py

# YouTube only (no login needed)
python scraper.py --youtube-only

# Analyze accumulated data
python analyzer.py

# Dry run (see what would happen)
python analyzer.py --dry-run
```

---

## Automation (Cron Jobs)

Two cron jobs are pre-configured (disabled by default):

### Hourly Scraper
- **Schedule:** Every hour, 8 AM - 11 PM EST
- **Model:** Kimi K2.5 (cheapest)
- **Action:** Runs `scraper.py`, stores raw data
- **Delivery:** Silent (no notification)

### Daily Analyzer
- **Schedule:** 7 AM EST daily
- **Model:** Kimi K2.5
- **Action:** Runs `analyzer.py`, pushes to dashboard
- **Delivery:** Announces findings to Telegram

Enable them:
```
openclaw cron update --id <scraper-id> --enabled true
openclaw cron update --id <analyzer-id> --enabled true
```

---

## Configuration

Edit `config.yaml` to customize:

```yaml
viewstats:
  categories:        # ViewStats categories to monitor
    - gaming
    - science-technology
    - entertainment
    - pets-animals
  min_outlier_score: 5    # Minimum X multiplier
  max_pages: 3            # Pages per category

youtube:
  queries:           # Search terms (rotated hourly)
    - "ice dragon"
    - "pet evolution stages"
    - "AI coding agent comparison"
  max_results: 20    # Results per query

storage:
  max_days_retention: 7   # Days to keep raw data
```

---

## Output

### Raw Data (`raw_data/YYYY-MM-DD.json`)

```json
{
  "id": "yt-abc123",
  "title": "I Survived 100 Days as an ICE DRAGON in Minecraft",
  "channel": "Ryguyrocky",
  "views": "2.3M views",
  "videoUrl": "https://youtube.com/watch?v=...",
  "source": "youtube_search",
  "query": "ice dragon",
  "scrapedAt": "2026-02-10T23:08:37Z"
}
```

### Analyzer Output

```
Top 10 Most Relevant:
  1. [7600x] [rel:60] REACHING MAX EVOLUTION IN THE NEW PET SIMULATOR
     Channel: RussoPlays | 🔴 pet evolution, 🟡 roblox
  2. [  45x] [rel:45] I Survived 100 Days as an ICE DRAGON in Minecraft
     Channel: Ryguyrocky | 🔴 ice dragon, 🟡 minecraft
```

---

## Architecture Decisions

1. **Why Playwright over API?** — ViewStats has no public API. YouTube Data API has quota limits (10,000 units/day). Browser scraping has no limits.

2. **Why hourly?** — Outliers are time-sensitive. A video that's 50x at hour 6 might be 200x by hour 24. Hourly captures the trajectory.

3. **Why separate scraper + analyzer?** — Scraper is pure Python (zero AI cost). Analyzer uses LLM for intelligent scoring. Separating them means 24 free scrapes + 1 cheap analysis per day.

4. **Why append-only storage?** — Deduplication by ID means running the scraper multiple times is safe. No data loss, no overwrites.

---

## File Structure

```
tools/outlier-scraper/
├── README.md           # This file
├── config.yaml         # Configuration
├── scraper.py          # Hourly data collection
├── analyzer.py         # Daily analysis + dashboard push
├── run_scraper.sh      # Cron wrapper script
├── raw_data/           # Accumulated scrape data
│   └── 2026-02-10.json
├── logs/               # Execution logs
└── venv/               # Python environment
```
