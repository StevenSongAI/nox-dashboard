#!/usr/bin/env python3
"""
watchlist-runner - Cron-driven research for watchlisted topics.

Runs daily via cron to re-research watchlisted topics and accumulate findings.
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

OUTPUT_DIR = Path.home() / "Desktop/Nox Builds/nox-dashboard/data/research"
WATCHLIST_FILE = OUTPUT_DIR / "watchlist.json"
INTEGRATED_SCRIPT = Path.home() / "Desktop/Nox Builds/nox-dashboard/tools/last30days-integrated.py"

def load_watchlist():
    """Load topics from watchlist."""
    if not WATCHLIST_FILE.exists():
        return []
    
    with open(WATCHLIST_FILE) as f:
        return json.load(f)

def run_research(topic: str):
    """Run integrated research for a topic."""
    cmd = [
        "python3", str(INTEGRATED_SCRIPT),
        topic,
        "--mode=default",
        "--cron"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        return result.returncode == 0
    except Exception as e:
        print(f"Error researching '{topic}': {e}", file=sys.stderr)
        return False

def update_last_run(topic: str):
    """Update last_run timestamp for a watchlisted topic."""
    watchlist = load_watchlist()
    
    for item in watchlist:
        if item["topic"] == topic:
            item["last_run"] = datetime.now(timezone.utc).isoformat()
            break
    
    with open(WATCHLIST_FILE, "w") as f:
        json.dump(watchlist, f, indent=2)

def main():
    """Run research for all watchlisted topics."""
    watchlist = load_watchlist()
    
    if not watchlist:
        print("No topics in watchlist")
        return 0
    
    print(f"Running research for {len(watchlist)} watchlisted topics...\n")
    
    success_count = 0
    for item in watchlist:
        topic = item["topic"]
        print(f"🔍 {topic}...", end=" ", flush=True)
        
        if run_research(topic):
            update_last_run(topic)
            print("✅ Done")
            success_count += 1
        else:
            print("❌ Failed")
    
    print(f"\nCompleted: {success_count}/{len(watchlist)}")
    return 0 if success_count == len(watchlist) else 1

if __name__ == "__main__":
    sys.exit(main())
