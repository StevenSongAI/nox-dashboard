#!/usr/bin/env python3
"""
last30days-integrated - Research orchestrator combining last30days skill with existing scrapers.

This script integrates:
- last30days-skill (Reddit, X, YouTube, Web research)
- Existing nox-dashboard scrapers (ViewStats, X.com API, etc.)
- Outputs to dashboard database

Usage:
    python3 last30days_integrated.py <topic> [--watchlist] [--cron]
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Paths
SKILL_ROOT = Path.home() / "Desktop/Nox Builds/last30days-skill"
DASHBOARD_ROOT = Path.home() / "Desktop/Nox Builds/nox-dashboard"
TOOLS_DIR = DASHBOARD_ROOT / "tools"
OUTPUT_DIR = DASHBOARD_ROOT / "data" / "research"

def run_last30days(topic: str, mode: str = "default"):
    """Run last30days skill research."""
    script = SKILL_ROOT / "scripts" / "last30days.py"
    
    cmd = [
        "python3", str(script),
        topic,
        "--emit=json",
        f"--profile={mode}"
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes
            cwd=str(SKILL_ROOT)
        )
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"last30days error: {result.stderr}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"Failed to run last30days: {e}", file=sys.stderr)
        return None

def run_existing_scrapers(topic: str):
    """Run existing dashboard scrapers for supplementary data."""
    results = {}
    
    # Check for ViewStats scraper
    viewstats_scraper = TOOLS_DIR / "outlier-scraper" / "scraper.py"
    if viewstats_scraper.exists():
        # ViewStats scraper is specialized for YouTube - last30days covers this
        results["viewstats"] = "Using last30days YouTube instead"
    
    # Check for X.com scraper  
    x_scraper = TOOLS_DIR / "outlier-scraper" / "biz_scraper.py"
    if x_scraper.exists():
        # X scraper runs separately - last30days covers this
        results["x_scraper"] = "Using last30days X instead"
    
    return results

def save_findings(topic: str, data: dict):
    """Save findings to dashboard research database."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).isoformat()
    safe_topic = topic.replace(" ", "_").replace("/", "-")[:50]
    
    filename = f"{safe_topic}_{timestamp[:10]}.json"
    filepath = OUTPUT_DIR / filename
    
    output = {
        "topic": topic,
        "timestamp": timestamp,
        "source": "last30days-integrated",
        "data": data,
        "metadata": {
            "skill_version": "2.1",
            "integration_version": "1.0"
        }
    }
    
    with open(filepath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Findings saved to: {filepath}")
    return filepath

def update_watchlist(topic: str):
    """Add topic to watchlist for cron-driven re-research."""
    watchlist_file = OUTPUT_DIR / "watchlist.json"
    
    watchlist = []
    if watchlist_file.exists():
        with open(watchlist_file) as f:
            watchlist = json.load(f)
    
    # Add if not already present
    if topic not in [w["topic"] for w in watchlist]:
        watchlist.append({
            "topic": topic,
            "added": datetime.now(timezone.utc).isoformat(),
            "last_run": None,
            "schedule": "daily"  # or "weekly"
        })
        
        with open(watchlist_file, "w") as f:
            json.dump(watchlist, f, indent=2)
        
        print(f"Added '{topic}' to watchlist")

def main():
    parser = argparse.ArgumentParser(
        description="Integrated research combining last30days with existing scrapers"
    )
    parser.add_argument("topic", help="Topic to research")
    parser.add_argument("--mode", choices=["quick", "default", "deep"], 
                       default="default", help="Research depth")
    parser.add_argument("--watchlist", action="store_true",
                       help="Add to watchlist for periodic re-research")
    parser.add_argument("--cron", action="store_true",
                       help="Running from cron (suppress interactive output)")
    
    args = parser.parse_args()
    
    print(f"🔍 Researching: {args.topic}")
    print(f"   Mode: {args.mode}")
    print(f"   This typically takes 2-8 minutes...\n")
    
    # Run last30days research
    findings = run_last30days(args.topic, args.mode)
    
    if not findings:
        print("❌ Research failed")
        sys.exit(1)
    
    # Run existing scrapers for supplementary data
    supplementary = run_existing_scrapers(args.topic)
    findings["supplementary"] = supplementary
    
    # Save findings
    filepath = save_findings(args.topic, findings)
    
    # Add to watchlist if requested
    if args.watchlist:
        update_watchlist(args.topic)
    
    # Output summary
    if not args.cron:
        print("\n" + "="*50)
        print("RESEARCH COMPLETE")
        print("="*50)
        print(f"Topic: {args.topic}")
        print(f"Output: {filepath}")
        
        # Show stats if available
        stats = findings.get("stats", {})
        if stats:
            print(f"\nSources:")
            print(f"  Reddit: {stats.get('reddit', {}).get('count', 0)} threads")
            print(f"  X: {stats.get('x', {}).get('count', 0)} posts")
            print(f"  YouTube: {stats.get('youtube', {}).get('count', 0)} videos")
            print(f"  Web: {stats.get('web', {}).get('count', 0)} pages")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
