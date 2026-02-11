# Nox Outlier Scraper

Automated YouTube outlier detection pipeline for the Nox Dashboard.

## Architecture

```
[Hourly Cron] → scraper.py → raw_data/YYYY-MM-DD.json (append)
[Daily Cron]  → analyzer.py → dashboard/data/youtube.json (merge)
```

### Scraper (hourly, zero AI cost)
- ViewStats Pro outliers (browser automation, logged-in session)
- YouTube search for niche keywords
- Stores raw JSON with timestamps

### Analyzer (daily, Kimi K2.5)
- Reads accumulated raw data
- Scores relevance to content strategy
- Generates content briefs
- Pushes to dashboard

## Setup
```bash
cd tools/outlier-scraper
python3 -m venv venv
source venv/bin/activate
pip install playwright httpx
playwright install chromium
```

## Usage
```bash
# Run scraper once
python scraper.py

# Run analyzer
python analyzer.py

# Dry run (no dashboard push)
python analyzer.py --dry-run
```
