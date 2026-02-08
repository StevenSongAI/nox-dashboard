#!/bin/bash
# Auto-Intel Scheduler
# Runs X Intelligence collection and analysis
# Intended for cron scheduling: */20 * * * * /bin/bash /path/to/auto-intel.sh

DASHBOARD_DIR="$HOME/Desktop/Nox Builds/nox-dashboard-repo"
DATA_DIR="$DASHBOARD_DIR/data"
LOG_FILE="$DATA_DIR/auto-intel.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting auto-intel run" >> "$LOG_FILE"

# Run collector
cd "$DATA_DIR" || exit 1
if node x-intel-collector.js >> "$LOG_FILE" 2>&1; then
    echo "[$TIMESTAMP] ✓ Collector completed" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✗ Collector failed" >> "$LOG_FILE"
    exit 1
fi

# Run analyzer
if node x-intel-analyzer.js --full >> "$LOG_FILE" 2>&1; then
    echo "[$TIMESTAMP] ✓ Analyzer completed" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✗ Analyzer failed" >> "$LOG_FILE"
    exit 1
fi

# Check for high-priority alerts
ALERTS_FILE="$DASHBOARD_DIR/briefings/latest-alerts.json"
if [ -f "$ALERTS_FILE" ]; then
    HIGH_ALERTS=$(grep -c '"severity": "HIGH"' "$ALERTS_FILE" 2>/dev/null || echo "0")
    if [ "$HIGH_ALERTS" -gt 0 ]; then
        echo "[$TIMESTAMP] ⚠️  $HIGH_ALERTS HIGH priority alert(s) detected" >> "$LOG_FILE"
    fi
fi

echo "[$TIMESTAMP] Auto-intel run complete" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
