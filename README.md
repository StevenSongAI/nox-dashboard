# Nox Dashboard

A personal dashboard for tracking YouTube strategy, business opportunities, investments, tools, research, and audit reports.

## Structure

```
nox-dashboard/
├── index.html          # Main dashboard UI with 7 tabs
├── app.js              # Application logic and data rendering
├── data/
│   ├── youtube.json    # YouTube outlier videos and content briefs
│   ├── new-business.json # Business opportunities and pipeline
│   ├── investments.json  # Portfolio positions and watchlist
│   ├── tools.json        # Registered tools and services
│   ├── research.json     # Research notes
│   ├── audits.json       # Audit reports and agent statistics
│   └── meta.json         # Metadata and agent status
└── README.md
```

## Tabs

1. **Dashboard** - Overview with morning brief and key metrics
2. **YouTube** - Outlier videos, content briefs, and trend analysis
3. **New Business** - Opportunities pipeline and evaluation
4. **Investments** - Portfolio positions, watchlist, and market intelligence
5. **Tools** - Registry of built tools and services
6. **Research** - Research notes and findings
7. **Audits** - Audit reports with grades and statistics

## Local Development

```bash
# Start a local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## Data Format

All data is stored in JSON files in the `data/` directory. The dashboard fetches these files dynamically on load.

## Deployment

The dashboard is designed to be deployed to GitHub Pages. Push to the repository and enable GitHub Pages in settings.
