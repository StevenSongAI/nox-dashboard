#!/usr/bin/env python3
"""
Nox Outlier Analyzer — Daily analysis of accumulated scrape data.

Reads raw data from scraper, scores relevance, and pushes findings
to the nox-dashboard GitHub repo.

Designed to be called by a cron agent (Kimi K2.5) for intelligent analysis,
or run standalone for basic statistical output.

Usage:
    python analyzer.py                  # Analyze and push to dashboard
    python analyzer.py --dry-run        # Analyze without pushing
    python analyzer.py --stats          # Print statistics only
    python analyzer.py --export FILE    # Export processed data to file
"""

import argparse
import json
import os
import sys
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter

import yaml


class OutlierAnalyzer:
    """Analyze accumulated outlier data and prepare dashboard updates."""

    # Keywords that indicate relevance to Steven's content strategy
    RELEVANCE_KEYWORDS = {
        "high": [
            "ice dragon", "dragon evolution", "pet evolution", "creature evolution",
            "baby creature", "what if", "evolution stages", "minecraft creature",
            "AI coding", "AI agent", "coding agent", "T-Rex", "dinosaur",
            "creature mod", "pokemon evolution", "animal simulation",
        ],
        "medium": [
            "AI video", "AI generation", "AI tool", "image generation",
            "gaming", "simulation", "physics", "creature", "monster",
            "tutorial", "comparison", "vs", "battle",
            "minecraft", "roblox", "pet sim",
        ],
        "low": [
            "reaction", "vlog", "unboxing", "review", "news",
            "music video", "shorts", "podcast", "live stream",
        ],
    }

    def __init__(self, config_path: str):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)

        self.raw_data_dir = Path(config_path).parent / self.config.get("storage", {}).get("raw_data_dir", "raw_data")
        
        dashboard_config = self.config.get("dashboard", {})
        self.dashboard_path = Path(os.path.expanduser(dashboard_config.get("repo_path", "~/Desktop/Nox Builds/nox-dashboard")))
        self.youtube_json_path = self.dashboard_path / dashboard_config.get("youtube_json", "data/youtube.json")
        self.meta_json_path = self.dashboard_path / dashboard_config.get("meta_json", "data/meta.json")

    def load_raw_data(self) -> list[dict]:
        """Load all raw data files."""
        all_data = []
        if not self.raw_data_dir.exists():
            print("⚠ No raw data directory found")
            return []

        for filepath in sorted(self.raw_data_dir.glob("*.json")):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    all_data.extend(data)
                    print(f"  Loaded {len(data)} items from {filepath.name}")
            except (json.JSONDecodeError, IOError) as e:
                print(f"  ⚠ Error loading {filepath.name}: {e}")

        return all_data

    def deduplicate(self, data: list[dict]) -> list[dict]:
        """Remove duplicate entries by ID."""
        seen = set()
        unique = []
        for item in data:
            item_id = item.get("id", "")
            if item_id and item_id not in seen:
                seen.add(item_id)
                unique.append(item)
        
        dupes = len(data) - len(unique)
        if dupes:
            print(f"  Removed {dupes} duplicates")
        return unique

    def score_relevance(self, item: dict) -> dict:
        """Score an item's relevance to Steven's content strategy."""
        title = (item.get("title", "") or "").lower()
        channel = (item.get("channel", "") or "").lower()
        raw_text = (item.get("rawText", "") or "").lower()
        combined = f"{title} {channel} {raw_text}"

        # Base score from outlier multiplier
        outlier_score = item.get("score", 0)
        
        # Relevance scoring
        relevance = 0
        matched_keywords = []

        for keyword in self.RELEVANCE_KEYWORDS["high"]:
            if keyword.lower() in combined:
                relevance += 30
                matched_keywords.append(f"🔴 {keyword}")

        for keyword in self.RELEVANCE_KEYWORDS["medium"]:
            if keyword.lower() in combined:
                relevance += 15
                matched_keywords.append(f"🟡 {keyword}")

        for keyword in self.RELEVANCE_KEYWORDS["low"]:
            if keyword.lower() in combined:
                relevance -= 5

        # Bonus for high outlier scores
        if outlier_score >= 100:
            relevance += 20
        elif outlier_score >= 50:
            relevance += 10
        elif outlier_score >= 20:
            relevance += 5

        item["relevanceScore"] = max(0, relevance)
        item["matchedKeywords"] = matched_keywords
        
        # Priority tier
        if relevance >= 50:
            item["priority"] = "high"
        elif relevance >= 25:
            item["priority"] = "medium"
        else:
            item["priority"] = "low"

        return item

    def analyze(self, data: list[dict]) -> dict:
        """Run full analysis on accumulated data."""
        print(f"\n📊 Analyzing {len(data)} items...")

        # Score all items
        scored = [self.score_relevance(item) for item in data]

        # Sort by relevance score (descending)
        scored.sort(key=lambda x: x.get("relevanceScore", 0), reverse=True)

        # Separate by source
        viewstats = [d for d in scored if d.get("source") == "viewstats"]
        youtube = [d for d in scored if d.get("source") == "youtube_search"]

        # Category breakdown
        categories = Counter(d.get("category", "unknown") for d in viewstats)

        # Priority breakdown
        priorities = Counter(d.get("priority", "low") for d in scored)

        # Top outliers: high relevance ViewStats OR high relevance YouTube results
        top_outliers = [
            d for d in scored
            if (d.get("priority") in ("high", "medium") and d.get("score", 0) >= 10)  # ViewStats with score
            or (d.get("priority") == "high")  # Any high-relevance item
            or (d.get("priority") == "medium" and d.get("relevanceScore", 0) >= 30)  # Strong medium items
        ]

        analysis = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "totalItems": len(data),
                "viewstatsCount": len(viewstats),
                "youtubeCount": len(youtube),
                "highPriority": priorities.get("high", 0),
                "mediumPriority": priorities.get("medium", 0),
                "lowPriority": priorities.get("low", 0),
                "topOutliersCount": len(top_outliers),
                "categories": dict(categories),
            },
            "topOutliers": top_outliers[:30],  # Top 30 most relevant
            "allScored": scored,
        }

        return analysis

    def format_for_dashboard(self, analysis: dict) -> list[dict]:
        """Format top outliers for the dashboard's youtube.json format."""
        dashboard_entries = []

        for item in analysis["topOutliers"]:
            entry = {
                "id": item.get("id", ""),
                "title": item.get("title", ""),
                "channel": item.get("channel", ""),
                "views": item.get("views", ""),
                "outlierScore": item.get("score", 0),
                "relevanceScore": item.get("relevanceScore", 0),
                "priority": item.get("priority", "low"),
                "category": item.get("category", ""),
                "videoUrl": item.get("videoUrl", ""),
                "thumbnailUrl": item.get("thumbnailUrl", ""),
                "source": item.get("source", ""),
                "matchedKeywords": [k.split(" ", 1)[1] if " " in k else k for k in item.get("matchedKeywords", [])],
                "scrapedAt": item.get("scrapedAt", ""),
                "addedAt": datetime.now(timezone.utc).isoformat(),
            }
            dashboard_entries.append(entry)

        return dashboard_entries

    def push_to_dashboard(self, entries: list[dict], dry_run: bool = False):
        """Merge new outlier entries into the dashboard's youtube.json."""
        if not self.youtube_json_path.exists():
            print(f"⚠ Dashboard youtube.json not found at {self.youtube_json_path}")
            return

        # Load existing data
        with open(self.youtube_json_path, "r") as f:
            dashboard_data = json.load(f)

        # Get existing outlier IDs
        existing_outliers = dashboard_data.get("outlierVideos", [])
        existing_ids = {o.get("id", "") for o in existing_outliers}

        # Filter new entries
        new_entries = [e for e in entries if e["id"] not in existing_ids]

        if not new_entries:
            print("  No new outliers to add to dashboard")
            return

        if dry_run:
            print(f"\n  [DRY RUN] Would add {len(new_entries)} new outliers to dashboard")
            for e in new_entries[:5]:
                print(f"    • {e['title'][:60]}... (score: {e['outlierScore']}x, relevance: {e['relevanceScore']})")
            return

        # Append new entries
        existing_outliers.extend(new_entries)
        dashboard_data["outlierVideos"] = existing_outliers

        # Write back
        with open(self.youtube_json_path, "w") as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)

        # Update meta.json
        if self.meta_json_path.exists():
            with open(self.meta_json_path, "r") as f:
                meta = json.load(f)
            meta["lastUpdated"] = datetime.now(timezone.utc).isoformat()
            meta["youtubeUpdated"] = datetime.now(timezone.utc).isoformat()
            meta["dataVersion"] = str(int(meta.get("dataVersion", "0")) + 1)
            with open(self.meta_json_path, "w") as f:
                json.dump(meta, f, indent=2)

        print(f"\n  ✅ Added {len(new_entries)} new outliers to dashboard")
        print(f"  Total outliers in dashboard: {len(existing_outliers)}")

        # Git commit and push
        try:
            os.chdir(self.dashboard_path)
            subprocess.run(["git", "add", "data/youtube.json", "data/meta.json"], check=True)
            subprocess.run([
                "git", "commit", "-m",
                f"[nox-scraper] Added {len(new_entries)} outlier videos (automated)"
            ], check=True)
            subprocess.run(["git", "push", "origin", "main"], check=True)
            print("  ✅ Pushed to GitHub")
        except subprocess.CalledProcessError as e:
            print(f"  ⚠ Git push failed: {e}")


def main():
    parser = argparse.ArgumentParser(description="Nox Outlier Analyzer")
    parser.add_argument("--config", default="config.yaml", help="Config file path")
    parser.add_argument("--dry-run", action="store_true", help="Analyze without pushing")
    parser.add_argument("--stats", action="store_true", help="Print statistics only")
    parser.add_argument("--export", type=str, help="Export processed data to file")
    args = parser.parse_args()

    config_path = Path(__file__).parent / args.config

    print("=" * 60)
    print("NOX OUTLIER ANALYZER")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    analyzer = OutlierAnalyzer(str(config_path))

    # Load data
    print("\n📂 Loading raw data...")
    raw_data = analyzer.load_raw_data()

    if not raw_data:
        print("\n⚠ No data to analyze")
        return

    # Deduplicate
    raw_data = analyzer.deduplicate(raw_data)

    # Analyze
    analysis = analyzer.analyze(raw_data)

    # Print summary
    summary = analysis["summary"]
    print("\n" + "=" * 60)
    print("ANALYSIS RESULTS")
    print("=" * 60)
    print(f"  Total items analyzed:  {summary['totalItems']}")
    print(f"  ViewStats outliers:    {summary['viewstatsCount']}")
    print(f"  YouTube results:       {summary['youtubeCount']}")
    print(f"  High priority:         {summary['highPriority']}")
    print(f"  Medium priority:       {summary['mediumPriority']}")
    print(f"  Low priority:          {summary['lowPriority']}")
    print(f"  Top outliers selected: {summary['topOutliersCount']}")

    if summary.get("categories"):
        print("\n  Categories:")
        for cat, count in sorted(summary["categories"].items(), key=lambda x: -x[1]):
            print(f"    {cat}: {count}")

    # Show top outliers
    if analysis["topOutliers"]:
        print("\n  Top 10 Most Relevant:")
        for i, item in enumerate(analysis["topOutliers"][:10], 1):
            score = item.get("score", 0)
            rel = item.get("relevanceScore", 0)
            title = (item.get("title", "") or "Unknown")[:50]
            channel = item.get("channel", "")[:20]
            keywords = ", ".join(item.get("matchedKeywords", [])[:3])
            print(f"    {i:2d}. [{score:>6.0f}x] [rel:{rel:>3d}] {title}")
            if channel:
                print(f"        Channel: {channel} | {keywords}")

    if args.stats:
        return

    # Export if requested
    if args.export:
        with open(args.export, "w") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Exported to {args.export}")
        return

    # Format and push to dashboard
    entries = analyzer.format_for_dashboard(analysis)

    if entries:
        print(f"\n📤 Pushing {len(entries)} outliers to dashboard...")
        analyzer.push_to_dashboard(entries, dry_run=args.dry_run)
    else:
        print("\n  No relevant outliers to push")

    print("\n✅ Analysis complete")


if __name__ == "__main__":
    main()
