#!/bin/bash
# Nox Outlier Scraper — Hourly cron wrapper
# Ensures the OpenClaw browser is running, then runs the scraper.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
VENV="$SCRIPT_DIR/venv"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H%M")
LOG_FILE="$LOG_DIR/scrape_${TIMESTAMP}.log"

echo "[$TIMESTAMP] Starting outlier scrape..." | tee "$LOG_FILE"

# Activate venv
source "$VENV/bin/activate"

# Run scraper
cd "$SCRIPT_DIR"
python scraper.py --config config.yaml 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$TIMESTAMP] Scrape completed successfully" | tee -a "$LOG_FILE"
else
    echo "[$TIMESTAMP] Scrape failed with exit code $EXIT_CODE" | tee -a "$LOG_FILE"
fi

# Clean up old logs (keep 7 days)
find "$LOG_DIR" -name "scrape_*.log" -mtime +7 -delete 2>/dev/null || true

exit $EXIT_CODE
