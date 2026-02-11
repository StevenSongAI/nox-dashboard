#!/usr/bin/env python3
"""
Nox Outlier Scraper — Automated YouTube outlier detection.

Scrapes ViewStats Pro outliers and YouTube search results.
Stores raw data in JSON for later analysis.

Usage:
    python scraper.py                    # Full scrape (ViewStats + YouTube)
    python scraper.py --viewstats-only   # ViewStats only
    python scraper.py --youtube-only     # YouTube only
    python scraper.py --dry-run          # Print what would be scraped
"""

import argparse
import json
import os
import re
import sys
import time
import hashlib
from datetime import datetime, timezone
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# ViewStats Scraper (Browser-based — requires login)
# ---------------------------------------------------------------------------

class ViewStatsScraper:
    """Scrape outlier videos from ViewStats Pro using Playwright."""

    BASE_URL = "https://www.viewstats.com/pro/outliers"

    # Category URL slugs
    CATEGORY_SLUGS = {
        "gaming": "gaming",
        "science-technology": "science-technology",
        "entertainment": "entertainment",
        "pets-animals": "pets-animals",
        "howto-style": "howto-style",
        "people-blogs": "people-blogs",
        "film-animation": "film-animation",
        "music": "music",
        "news-politics": "news-politics",
        "education": "education",
        "comedy": "comedy",
        "sports": "sports",
    }

    def __init__(self, page, config):
        self.page = page
        self.config = config.get("viewstats", {})
        self.categories = self.config.get("categories", ["gaming"])
        self.min_score = self.config.get("min_outlier_score", 5)
        self.max_pages = self.config.get("max_pages", 3)
        self.time_filter = self.config.get("time_filter", "7d")

    def scrape_all_categories(self) -> list[dict]:
        """Scrape outliers from all configured categories."""
        all_outliers = []

        for category in self.categories:
            slug = self.CATEGORY_SLUGS.get(category, category)
            print(f"\n📊 Scraping ViewStats: {category}")

            try:
                outliers = self._scrape_category(slug)
                all_outliers.extend(outliers)
                print(f"   Found {len(outliers)} outliers")
            except Exception as e:
                print(f"   ✗ Error scraping {category}: {e}")

            time.sleep(2)  # Polite delay between categories

        return all_outliers

    def _scrape_category(self, category_slug: str) -> list[dict]:
        """Scrape outlier videos from a single ViewStats category."""
        url = f"{self.BASE_URL}?category={category_slug}"
        self.page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(8)  # Wait for JS rendering — ViewStats is heavy

        # Check if we're on the login page
        if "/login" in self.page.url:
            print("   ⚠ Not logged in to ViewStats — skipping")
            return []

        outliers = []

        for page_num in range(self.max_pages):
            page_outliers = self._extract_outliers_from_page(category_slug)
            outliers.extend(page_outliers)

            if page_num < self.max_pages - 1:
                # Try to click "next page" or "load more"
                if not self._go_to_next_page():
                    break
                time.sleep(2)

        return outliers

    def _extract_outliers_from_page(self, category: str) -> list[dict]:
        """Extract outlier video data from the current ViewStats page."""
        outliers = []

        try:
            # ViewStats renders outlier cards as <a> links with href containing /pro/outliers/{videoId}
            # Each card has: score (e.g. "10.4Kx"), title (paragraph), channel (paragraph), 
            # metadata text ("9.0K subs 75K views • 2 years ago")
            data = self.page.evaluate(r"""() => {
                const results = [];
                
                // Find all outlier card links — they link to /pro/outliers/{videoId}
                const cards = document.querySelectorAll('a[href*="/pro/outliers/"]');
                const seen = new Set();
                
                cards.forEach(card => {
                    const href = card.getAttribute('href') || '';
                    // Extract video ID from href like /pro/outliers/l2wj6lJtg_8?category=...
                    const videoIdMatch = href.match(/\/pro\/outliers\/([^?&]+)/);
                    if (!videoIdMatch) return;
                    const videoId = videoIdMatch[1];
                    
                    // Skip duration-only links (short text like "01:31")
                    const text = card.textContent.trim();
                    if (text.length < 20) return;
                    
                    // Deduplicate by videoId (each card has 2 links: thumbnail + info)
                    if (seen.has(videoId)) return;
                    seen.add(videoId);
                    
                    const entry = {
                        videoId: videoId,
                        videoUrl: 'https://www.youtube.com/watch?v=' + videoId,
                        title: '',
                        score: 0,
                        channel: '',
                        subs: '',
                        views: '',
                        publishedAt: '',
                        thumbnailUrl: ''
                    };
                    
                    // Score is the first text element (e.g. "2.8x", "10.4Kx", "404x")
                    const scoreMatch = text.match(/^([\d,.]+[Kk]?)x/);
                    if (scoreMatch) {
                        let scoreStr = scoreMatch[1].replace(',', '');
                        if (scoreStr.toLowerCase().endsWith('k')) {
                            entry.score = parseFloat(scoreStr.slice(0, -1)) * 1000;
                        } else {
                            entry.score = parseFloat(scoreStr);
                        }
                    }
                    
                    // Paragraphs: first = title, second = channel
                    const paragraphs = card.querySelectorAll('p');
                    if (paragraphs.length >= 1) entry.title = paragraphs[0].textContent.trim();
                    if (paragraphs.length >= 2) entry.channel = paragraphs[1].textContent.trim();
                    
                    // Metadata: "3.1M subs 3.61M views • 4 years ago"
                    const subsMatch = text.match(/([\d.]+[KMB]?)\s*subs/i);
                    if (subsMatch) entry.subs = subsMatch[1];
                    
                    const viewsMatch = text.match(/([\d.]+[KMB]?)\s*views/i);
                    if (viewsMatch) entry.views = viewsMatch[1];
                    
                    const ageMatch = text.match(/•\s*(.+ago)/i);
                    if (ageMatch) entry.publishedAt = ageMatch[1].trim();
                    
                    // Thumbnail
                    const img = card.querySelector('img');
                    if (img && img.src) entry.thumbnailUrl = img.src;
                    
                    if (entry.title && entry.score > 0) {
                        results.push(entry);
                    }
                });
                
                return results;
            }""")

            for item in data:
                if item["score"] >= self.min_score:
                    item["category"] = category
                    item["source"] = "viewstats"
                    item["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                    item["id"] = self._make_id(item)
                    outliers.append(item)

        except Exception as e:
            print(f"   ✗ Extraction error: {e}")

        return outliers

    def _go_to_next_page(self) -> bool:
        """Try to navigate to the next page of results."""
        try:
            next_btn = self.page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]').first
            if next_btn.count() > 0 and next_btn.is_visible():
                next_btn.click()
                time.sleep(2)
                return True
        except:
            pass
        return False

    @staticmethod
    def _make_id(item: dict) -> str:
        """Generate a unique ID for deduplication."""
        key = f"{item.get('videoUrl', '')}{item.get('title', '')}{item.get('channel', '')}"
        return f"vs-{hashlib.md5(key.encode()).hexdigest()[:12]}"


# ---------------------------------------------------------------------------
# YouTube Search Scraper (Browser-based)
# ---------------------------------------------------------------------------

class YouTubeScraper:
    """Scrape YouTube search results for niche monitoring."""

    SEARCH_URL = "https://www.youtube.com/results"

    def __init__(self, page, config):
        self.page = page
        self.config = config.get("youtube", {})
        self.queries = self.config.get("queries", [])
        self.sort_by = self.config.get("sort_by", "date")
        self.max_results = self.config.get("max_results", 20)

    def scrape_queries(self, max_queries: int = 3) -> list[dict]:
        """Scrape YouTube search results for configured queries.
        Rotates through queries — only runs a subset per invocation."""
        all_results = []

        # Rotate queries based on current hour
        hour = datetime.now().hour
        start_idx = (hour * max_queries) % len(self.queries) if self.queries else 0
        active_queries = self.queries[start_idx:start_idx + max_queries]

        # Wrap around if needed
        if len(active_queries) < max_queries:
            active_queries += self.queries[:max_queries - len(active_queries)]

        for query in active_queries:
            print(f"\n🔍 YouTube Search: '{query}'")
            try:
                results = self._search(query)
                all_results.extend(results)
                print(f"   Found {len(results)} results")
            except Exception as e:
                print(f"   ✗ Error searching '{query}': {e}")

            time.sleep(2)

        return all_results

    def _search(self, query: str) -> list[dict]:
        """Search YouTube and extract video data."""
        # Sort parameter: CAI = date, CAM = view count
        sort_param = ""
        if self.sort_by == "date":
            sort_param = "&sp=CAI%253D"
        elif self.sort_by == "viewCount":
            sort_param = "&sp=CAM%253D"

        url = f"{self.SEARCH_URL}?search_query={query.replace(' ', '+')}{sort_param}"
        self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)  # Wait for JS rendering

        results = []

        try:
            data = self.page.evaluate("""(maxResults) => {
                const results = [];
                const videos = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
                
                for (let i = 0; i < Math.min(videos.length, maxResults); i++) {
                    const video = videos[i];
                    const entry = {
                        title: '',
                        views: '',
                        channel: '',
                        videoUrl: '',
                        thumbnailUrl: '',
                        publishedAt: '',
                        duration: ''
                    };
                    
                    // Title
                    const titleEl = video.querySelector('#video-title, a#video-title-link');
                    if (titleEl) {
                        entry.title = titleEl.textContent.trim();
                        if (titleEl.href) entry.videoUrl = titleEl.href;
                    }
                    
                    // Channel
                    const channelEl = video.querySelector('#channel-name a, ytd-channel-name a');
                    if (channelEl) entry.channel = channelEl.textContent.trim();
                    
                    // Views and publish date from metadata
                    const metaEls = video.querySelectorAll('#metadata-line span, .inline-metadata-item');
                    metaEls.forEach(el => {
                        const text = el.textContent.trim();
                        if (text.includes('view')) entry.views = text;
                        else if (text.includes('ago') || text.includes('Streamed')) entry.publishedAt = text;
                    });
                    
                    // Thumbnail
                    const img = video.querySelector('img#img, ytd-thumbnail img');
                    if (img && img.src) entry.thumbnailUrl = img.src;
                    
                    // Duration
                    const durationEl = video.querySelector('ytd-thumbnail-overlay-time-status-renderer, .badge-shape-wiz__text');
                    if (durationEl) entry.duration = durationEl.textContent.trim();
                    
                    // Extract video ID from URL
                    if (entry.videoUrl) {
                        const match = entry.videoUrl.match(/v=([a-zA-Z0-9_-]{11})/);
                        if (match) entry.videoId = match[1];
                    }
                    
                    if (entry.title) results.push(entry);
                }
                
                return results;
            }""", self.max_results)

            for item in data:
                item["source"] = "youtube_search"
                item["query"] = query
                item["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                item["id"] = f"yt-{item.get('videoId', hashlib.md5(item['title'].encode()).hexdigest()[:12])}"
                results.append(item)

        except Exception as e:
            print(f"   ✗ Extraction error: {e}")

        return results


# ---------------------------------------------------------------------------
# Data Storage
# ---------------------------------------------------------------------------

class DataStore:
    """Append-only JSON storage for raw scrape data."""

    def __init__(self, raw_data_dir: str, max_days: int = 7):
        self.raw_data_dir = Path(raw_data_dir)
        self.raw_data_dir.mkdir(parents=True, exist_ok=True)
        self.max_days = max_days

    def save(self, data: list[dict], source: str):
        """Append scraped data to today's file."""
        today = datetime.now().strftime("%Y-%m-%d")
        filepath = self.raw_data_dir / f"{today}.json"

        existing = []
        if filepath.exists():
            try:
                with open(filepath, "r") as f:
                    existing = json.load(f)
            except (json.JSONDecodeError, IOError):
                existing = []

        # Deduplicate by ID
        existing_ids = {item["id"] for item in existing if "id" in item}
        new_items = [item for item in data if item.get("id") not in existing_ids]

        existing.extend(new_items)

        with open(filepath, "w") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved {len(new_items)} new items ({len(existing)} total today)")
        return len(new_items)

    def get_unprocessed(self) -> list[dict]:
        """Get all raw data that hasn't been analyzed yet."""
        all_data = []
        for filepath in sorted(self.raw_data_dir.glob("*.json")):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                    all_data.extend(data)
            except (json.JSONDecodeError, IOError):
                continue
        return all_data

    def cleanup_old(self):
        """Remove raw data files older than max_days."""
        cutoff = datetime.now().strftime("%Y-%m-%d")
        removed = 0
        for filepath in self.raw_data_dir.glob("*.json"):
            # Parse date from filename
            try:
                file_date = filepath.stem  # e.g., "2026-02-10"
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
    parser = argparse.ArgumentParser(description="Nox Outlier Scraper")
    parser.add_argument("--config", default="config.yaml", help="Config file path")
    parser.add_argument("--viewstats-only", action="store_true", help="Only scrape ViewStats")
    parser.add_argument("--youtube-only", action="store_true", help="Only scrape YouTube")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without scraping")
    parser.add_argument("--login", action="store_true", help="Open ViewStats login page and wait")
    args = parser.parse_args()

    # Load config
    config_path = Path(__file__).parent / args.config
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    print("=" * 60)
    print("NOX OUTLIER SCRAPER")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if args.dry_run:
        print("\n🏃 DRY RUN — no actual scraping")
        if not args.youtube_only:
            cats = config.get("viewstats", {}).get("categories", [])
            print(f"\nViewStats categories: {', '.join(cats)}")
        if not args.viewstats_only:
            queries = config.get("youtube", {}).get("queries", [])
            print(f"\nYouTube queries: {', '.join(queries)}")
        return

    # Initialize storage
    storage_config = config.get("storage", {})
    store = DataStore(
        raw_data_dir=Path(__file__).parent / storage_config.get("raw_data_dir", "raw_data"),
        max_days=storage_config.get("max_days_retention", 7),
    )

    # Connect to browser
    browser_config = config.get("browser", {})
    cdp_url = browser_config.get("cdp_url", "http://localhost:18800")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        print(f"\n🌐 Connecting to browser at {cdp_url}")
        try:
            browser = p.chromium.connect_over_cdp(cdp_url)
        except Exception as e:
            print(f"✗ Cannot connect to browser: {e}")
            print("  Make sure OpenClaw browser is running (openclaw browser start)")
            sys.exit(1)

        # Use existing context — CDP requires reusing context for cookies
        context = browser.contexts[0] if browser.contexts else browser.new_context()
        # Open a new page in the same context for scraping
        page = context.new_page()
        
        # If ViewStats cookies aren't available on new pages (CDP limitation),
        # try to copy cookies from an existing ViewStats page
        existing_pages = context.pages
        vs_page = None
        for p in existing_pages:
            if "viewstats.com" in (p.url or ""):
                vs_page = p
                break
        
        if vs_page and vs_page != page:
            try:
                cookies = context.cookies("https://www.viewstats.com")
                if not cookies:
                    # CDP contexts sometimes need cookies added manually
                    # Navigate the existing VS page to extract cookies via JS
                    raw_cookies = vs_page.evaluate("() => document.cookie")
                    if raw_cookies:
                        print(f"  ℹ Using cookies from existing ViewStats tab")
            except Exception:
                pass
        
        print("✓ Connected to browser")

        # Login mode — open ViewStats login and wait
        if args.login:
            print("\n🔐 Opening ViewStats login page...")
            page.goto("https://www.viewstats.com/login", wait_until="domcontentloaded", timeout=30000)
            print("   Log in to ViewStats in the browser window.")
            print("   Press Enter here when done...")
            input()
            
            # Verify login
            page.goto("https://www.viewstats.com/pro/outliers", wait_until="domcontentloaded", timeout=30000)
            time.sleep(3)
            if "/login" not in page.url:
                print("   ✅ Logged in successfully!")
            else:
                print("   ✗ Still not logged in. Try again.")
            page.close()
            return

        all_data = []

        # Scrape ViewStats
        if not args.youtube_only:
            print("\n" + "─" * 40)
            print("VIEWSTATS OUTLIERS")
            print("─" * 40)
            vs_scraper = ViewStatsScraper(page, config)
            vs_data = vs_scraper.scrape_all_categories()
            all_data.extend(vs_data)
            print(f"\n📊 ViewStats total: {len(vs_data)} outliers")

        # Scrape YouTube
        if not args.viewstats_only:
            print("\n" + "─" * 40)
            print("YOUTUBE SEARCH")
            print("─" * 40)
            yt_scraper = YouTubeScraper(page, config)
            yt_data = yt_scraper.scrape_queries(max_queries=3)
            all_data.extend(yt_data)
            print(f"\n🔍 YouTube total: {len(yt_data)} results")

        # Save data
        if all_data:
            store.save(all_data, source="combined")
        else:
            print("\n⚠ No data collected")

        # Cleanup old files
        store.cleanup_old()

        # Close the page we created (not the browser)
        page.close()
        print("\n✓ Done")

    # Print summary
    print("\n" + "=" * 60)
    print("SCRAPE SUMMARY")
    print("=" * 60)
    print(f"  Total items: {len(all_data)}")
    vs_count = sum(1 for d in all_data if d.get("source") == "viewstats")
    yt_count = sum(1 for d in all_data if d.get("source") == "youtube_search")
    print(f"  ViewStats:   {vs_count}")
    print(f"  YouTube:     {yt_count}")
    print(f"  Stored in:   raw_data/{datetime.now().strftime('%Y-%m-%d')}.json")


if __name__ == "__main__":
    main()
