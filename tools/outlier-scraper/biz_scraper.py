#!/usr/bin/env python3
"""
Nox Business Intelligence Scraper — X.com + Reddit monitoring.

Searches X.com (via bird CLI) and Reddit for:
- Common complaints & pain points
- Emerging tools & trends
- Business opportunities

Stores raw data for daily analysis by the biz_analyzer.

Usage:
    python biz_scraper.py                  # Full scrape (X + Reddit)
    python biz_scraper.py --x-only         # X.com only
    python biz_scraper.py --reddit-only    # Reddit only
    python biz_scraper.py --dry-run        # Show what would be scraped
"""

import argparse
import json
import hashlib
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import yaml

try:
    import httpx
except ImportError:
    httpx = None


# ---------------------------------------------------------------------------
# X.com Scraper (via bird CLI)
# ---------------------------------------------------------------------------

class XScraper:
    """Search X.com for pain points, trends, and opportunities using bird CLI."""

    def __init__(self, config: dict):
        self.config = config.get("x", {})
        self.queries = self.config.get("queries", [])
        self.count_per_query = self.config.get("count_per_query", 20)

    def scrape_all(self, max_queries: int = 4) -> list[dict]:
        """Search X.com for configured queries. Rotates subset per run."""
        all_results = []

        # Rotate queries by hour
        hour = datetime.now().hour
        start_idx = (hour * max_queries) % len(self.queries) if self.queries else 0
        active_queries = self.queries[start_idx:start_idx + max_queries]
        if len(active_queries) < max_queries:
            active_queries += self.queries[:max_queries - len(active_queries)]

        for query_config in active_queries:
            query = query_config if isinstance(query_config, str) else query_config.get("query", "")
            category = "general" if isinstance(query_config, str) else query_config.get("category", "general")

            print(f"\n🐦 X.com Search: '{query}'")
            try:
                results = self._search(query, category)
                all_results.extend(results)
                print(f"   Found {len(results)} tweets")
            except Exception as e:
                print(f"   ✗ Error: {e}")

            time.sleep(1)

        return all_results

    def _search(self, query: str, category: str) -> list[dict]:
        """Execute bird CLI search and parse results."""
        try:
            result = subprocess.run(
                ["bird", "search", query, "-n", str(self.count_per_query), "--json"],
                capture_output=True, text=True, timeout=30
            )

            if result.returncode != 0:
                print(f"   ⚠ bird error: {result.stderr[:200]}")
                return []

            tweets = json.loads(result.stdout)

            # Handle different bird output formats
            if isinstance(tweets, dict):
                tweets = tweets.get("tweets", tweets.get("data", [tweets]))
            if not isinstance(tweets, list):
                tweets = [tweets]

            results = []
            for tweet in tweets:
                entry = {
                    "id": f"x-{tweet.get('id', hashlib.md5(str(tweet).encode()).hexdigest()[:12])}",
                    "text": tweet.get("text", tweet.get("full_text", "")),
                    "author": tweet.get("author", tweet.get("user", {}).get("screen_name", "")),
                    "authorName": tweet.get("authorName", tweet.get("user", {}).get("name", "")),
                    "likes": tweet.get("likes", tweet.get("favorite_count", 0)),
                    "retweets": tweet.get("retweets", tweet.get("retweet_count", 0)),
                    "replies": tweet.get("replies", tweet.get("reply_count", 0)),
                    "url": tweet.get("url", ""),
                    "createdAt": tweet.get("createdAt", tweet.get("created_at", "")),
                    "source": "x",
                    "query": query,
                    "category": category,
                    "scrapedAt": datetime.now(timezone.utc).isoformat(),
                }

                # Calculate engagement score
                entry["engagement"] = (
                    entry["likes"] + entry["retweets"] * 2 + entry["replies"] * 3
                )

                results.append(entry)

            return results

        except subprocess.TimeoutExpired:
            print("   ⚠ bird search timed out")
            return []
        except json.JSONDecodeError as e:
            print(f"   ⚠ JSON parse error: {e}")
            return []


# ---------------------------------------------------------------------------
# Reddit Scraper (public JSON API)
# ---------------------------------------------------------------------------

class RedditScraper:
    """Scrape Reddit for pain points, trends, and opportunities."""

    BASE_URL = "https://www.reddit.com"
    HEADERS = {"User-Agent": "NoxOutlierScraper/1.0"}

    def __init__(self, config: dict):
        self.config = config.get("reddit", {})
        self.subreddits = self.config.get("subreddits", [])
        self.search_queries = self.config.get("search_queries", [])
        self.posts_per_sub = self.config.get("posts_per_sub", 15)

    def scrape_all(self, max_subs: int = 4) -> list[dict]:
        """Scrape configured subreddits and search queries."""
        all_results = []

        # Rotate subreddits by hour
        hour = datetime.now().hour
        start_idx = (hour * max_subs) % len(self.subreddits) if self.subreddits else 0
        active_subs = self.subreddits[start_idx:start_idx + max_subs]
        if len(active_subs) < max_subs and self.subreddits:
            active_subs += self.subreddits[:max_subs - len(active_subs)]

        for sub_config in active_subs:
            subreddit = sub_config if isinstance(sub_config, str) else sub_config.get("name", "")
            category = "general" if isinstance(sub_config, str) else sub_config.get("category", "general")
            sort = "hot" if isinstance(sub_config, str) else sub_config.get("sort", "hot")

            print(f"\n📱 Reddit: r/{subreddit} ({sort})")
            try:
                results = self._scrape_subreddit(subreddit, sort, category)
                all_results.extend(results)
                print(f"   Found {len(results)} posts")
            except Exception as e:
                print(f"   ✗ Error: {e}")

            time.sleep(2)  # Rate limit

        # Also run search queries
        for query_config in self.search_queries[:2]:  # Max 2 searches per run
            query = query_config if isinstance(query_config, str) else query_config.get("query", "")
            category = "general" if isinstance(query_config, str) else query_config.get("category", "general")

            print(f"\n🔍 Reddit Search: '{query}'")
            try:
                results = self._search(query, category)
                all_results.extend(results)
                print(f"   Found {len(results)} results")
            except Exception as e:
                print(f"   ✗ Error: {e}")

            time.sleep(2)

        return all_results

    def _fetch_json(self, url: str) -> dict:
        """Fetch JSON from Reddit API."""
        if httpx:
            resp = httpx.get(url, headers=self.HEADERS, timeout=15, follow_redirects=True)
            resp.raise_for_status()
            return resp.json()
        else:
            import urllib.request
            req = urllib.request.Request(url, headers=self.HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode())

    def _scrape_subreddit(self, subreddit: str, sort: str, category: str) -> list[dict]:
        """Fetch posts from a subreddit."""
        url = f"{self.BASE_URL}/r/{subreddit}/{sort}.json?limit={self.posts_per_sub}&raw_json=1"

        data = self._fetch_json(url)
        posts = data.get("data", {}).get("children", [])

        results = []
        for post in posts:
            pd = post.get("data", {})

            # Skip pinned/stickied posts
            if pd.get("stickied"):
                continue

            entry = {
                "id": f"reddit-{pd.get('id', '')}",
                "title": pd.get("title", ""),
                "text": pd.get("selftext", "")[:1000],  # Truncate long posts
                "author": pd.get("author", ""),
                "subreddit": subreddit,
                "score": pd.get("score", 0),
                "numComments": pd.get("num_comments", 0),
                "url": f"https://reddit.com{pd.get('permalink', '')}",
                "createdAt": datetime.fromtimestamp(pd.get("created_utc", 0), tz=timezone.utc).isoformat(),
                "flair": pd.get("link_flair_text", ""),
                "source": "reddit",
                "category": category,
                "query": f"r/{subreddit}",
                "scrapedAt": datetime.now(timezone.utc).isoformat(),
            }

            # Engagement score
            entry["engagement"] = entry["score"] + entry["numComments"] * 2

            results.append(entry)

        return results

    def _search(self, query: str, category: str) -> list[dict]:
        """Search Reddit across all subreddits."""
        url = f"{self.BASE_URL}/search.json?q={query}&sort=hot&limit=15&raw_json=1"

        data = self._fetch_json(url)
        posts = data.get("data", {}).get("children", [])

        results = []
        for post in posts:
            pd = post.get("data", {})

            entry = {
                "id": f"reddit-{pd.get('id', '')}",
                "title": pd.get("title", ""),
                "text": pd.get("selftext", "")[:1000],
                "author": pd.get("author", ""),
                "subreddit": pd.get("subreddit", ""),
                "score": pd.get("score", 0),
                "numComments": pd.get("num_comments", 0),
                "url": f"https://reddit.com{pd.get('permalink', '')}",
                "createdAt": datetime.fromtimestamp(pd.get("created_utc", 0), tz=timezone.utc).isoformat(),
                "flair": pd.get("link_flair_text", ""),
                "source": "reddit",
                "category": category,
                "query": query,
                "scrapedAt": datetime.now(timezone.utc).isoformat(),
            }

            entry["engagement"] = entry["score"] + entry["numComments"] * 2
            results.append(entry)

        return results


# ---------------------------------------------------------------------------
# Data Storage (reuse from scraper.py)
# ---------------------------------------------------------------------------

class DataStore:
    """Append-only JSON storage for raw business intel data."""

    def __init__(self, raw_data_dir: str, max_days: int = 7):
        self.raw_data_dir = Path(raw_data_dir)
        self.raw_data_dir.mkdir(parents=True, exist_ok=True)
        self.max_days = max_days

    def save(self, data: list[dict], source: str):
        today = datetime.now().strftime("%Y-%m-%d")
        filepath = self.raw_data_dir / f"{today}.json"

        existing = []
        if filepath.exists():
            try:
                with open(filepath, "r") as f:
                    existing = json.load(f)
            except (json.JSONDecodeError, IOError):
                existing = []

        existing_ids = {item["id"] for item in existing if "id" in item}
        new_items = [item for item in data if item.get("id") not in existing_ids]
        existing.extend(new_items)

        with open(filepath, "w") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved {len(new_items)} new items ({len(existing)} total today)")
        return len(new_items)

    def cleanup_old(self):
        removed = 0
        for filepath in self.raw_data_dir.glob("*.json"):
            try:
                file_date = filepath.stem
                days_old = (datetime.now() - datetime.strptime(file_date, "%Y-%m-%d")).days
                if days_old > self.max_days:
                    filepath.unlink()
                    removed += 1
            except ValueError:
                continue
        if removed:
            print(f"🗑️  Cleaned up {removed} old data files")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Nox Business Intelligence Scraper")
    parser.add_argument("--config", default="biz_config.yaml", help="Config file path")
    parser.add_argument("--x-only", action="store_true", help="Only scrape X.com")
    parser.add_argument("--reddit-only", action="store_true", help="Only scrape Reddit")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be scraped")
    args = parser.parse_args()

    config_path = Path(__file__).parent / args.config
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    print("=" * 60)
    print("NOX BUSINESS INTELLIGENCE SCRAPER")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if args.dry_run:
        print("\n🏃 DRY RUN")
        if not args.reddit_only:
            queries = config.get("x", {}).get("queries", [])
            print(f"\nX.com queries ({len(queries)}):")
            for q in queries[:5]:
                name = q if isinstance(q, str) else q.get("query", "")
                print(f"  • {name}")
        if not args.x_only:
            subs = config.get("reddit", {}).get("subreddits", [])
            print(f"\nReddit subreddits ({len(subs)}):")
            for s in subs[:5]:
                name = s if isinstance(s, str) else s.get("name", "")
                print(f"  • r/{name}")
        return

    store = DataStore(
        raw_data_dir=Path(__file__).parent / config.get("storage", {}).get("raw_data_dir", "biz_raw_data"),
        max_days=config.get("storage", {}).get("max_days_retention", 7),
    )

    all_data = []

    # Scrape X.com
    if not args.reddit_only:
        print("\n" + "─" * 40)
        print("X.COM INTELLIGENCE")
        print("─" * 40)
        x_scraper = XScraper(config)
        x_data = x_scraper.scrape_all(max_queries=4)
        all_data.extend(x_data)
        print(f"\n🐦 X.com total: {len(x_data)} tweets")

    # Scrape Reddit
    if not args.x_only:
        print("\n" + "─" * 40)
        print("REDDIT INTELLIGENCE")
        print("─" * 40)
        reddit_scraper = RedditScraper(config)
        reddit_data = reddit_scraper.scrape_all(max_subs=4)
        all_data.extend(reddit_data)
        print(f"\n📱 Reddit total: {len(reddit_data)} posts")

    # Save
    if all_data:
        store.save(all_data, source="combined")
    else:
        print("\n⚠ No data collected")

    store.cleanup_old()

    # Summary
    print("\n" + "=" * 60)
    print("SCRAPE SUMMARY")
    print("=" * 60)
    print(f"  Total items: {len(all_data)}")
    x_count = sum(1 for d in all_data if d.get("source") == "x")
    reddit_count = sum(1 for d in all_data if d.get("source") == "reddit")
    print(f"  X.com:       {x_count}")
    print(f"  Reddit:      {reddit_count}")
    print(f"  Stored in:   biz_raw_data/{datetime.now().strftime('%Y-%m-%d')}.json")


if __name__ == "__main__":
    main()
