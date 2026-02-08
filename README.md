# Nox Dashboard

Personal intelligence and work dashboard for Steven Song.

## URL
https://stevensongai.github.io/nox-dashboard/

## Data Structure

All data lives in `/data/` as JSON files:
- `youtube.json` - YouTube outlier research and content briefs
- `new-business.json` - Business opportunities and pipeline
- `investments.json` - Portfolio positions and watchlist
- `tools.json` - Registry of all built tools
- `research.json` - Research notes and intelligence
- `audits.json` - Audit reports and agent performance
- `meta.json` - Timestamps and agent status

## Agent Data Sync

The agent updates this dashboard by:
1. `git pull origin main`
2. Edit the relevant JSON file in `data/`
3. `git add . && git commit -m "update [section]" && git push`
4. GitHub Pages auto-deploys on push to main

## Local Development

Open `index.html` in any browser. No server needed.
