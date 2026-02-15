/**
 * Test Entries Data
 * Sample data for development and testing
 */

export const testEntries = [
  {
    id: 'test-001',
    title: 'YouTube Outlier Analysis: MrBeast Strategy',
    description: 'Deep dive into MrBeast video performance patterns and outlier detection',
    content: `## Key Findings

### Outlier Metrics
- **Views**: 45M average vs 12M baseline (+275% outlier)
- **Engagement**: 8.2% CTR vs 4.1% baseline
- **Retention**: 72% average view duration

### Success Patterns
1. Thumbnail contrast ratio > 4.5:1
2. Title includes specific numbers
3. First 30 seconds have high energy hook
4. Call-to-action within first 60 seconds

### Recommendations
- Implement A/B testing for thumbnails
- Optimize video length to 12-15 minutes
- Schedule uploads for peak engagement times`,
    category: 'analysis',
    confidence: 0.92,
    tags: ['youtube', 'mrbeast', 'outlier', 'strategy', 'analytics'],
    source_url: 'https://viewstats.com/pro/outliers',
    status: 'published',
    metadata: {
      author: 'Nox System',
      views: 45200000,
      engagement_rate: 0.082,
      outliers_detected: 3,
      analysis_date: '2026-02-10'
    },
    created_at: '2026-02-10T14:30:00Z',
    updated_at: '2026-02-10T16:45:00Z'
  },
  {
    id: 'test-002',
    title: 'AI Content Generation Pipeline',
    description: 'Technical architecture for automated content creation workflow',
    content: `## Architecture Overview

### Components
1. **Data Ingestion Layer**
   - YouTube API integration
   - ViewStats scraper
   - Social media monitors

2. **Processing Layer**
   - Outlier detection algorithm
   - Content analysis engine
   - Metadata extraction

3. **Generation Layer**
   - Template engine
   - AI summarization
   - Quality scoring

### Tech Stack
- Node.js + Express (backend)
- PostgreSQL (database)
- React + Vite (frontend)
- Python + Playwright (scraping)

### Performance Metrics
- Processing time: < 2s per video
- Accuracy: 94.5% outlier detection
- Throughput: 1000 videos/hour`,
    category: 'research',
    confidence: 0.88,
    tags: ['ai', 'pipeline', 'automation', 'architecture', 'tech-stack'],
    source_url: 'https://github.com/nox-system/pipeline',
    status: 'draft',
    metadata: {
      author: 'Dev Team',
      complexity: 'high',
      estimated_hours: 120,
      priority: 'critical'
    },
    created_at: '2026-02-12T09:15:00Z',
    updated_at: '2026-02-14T11:20:00Z'
  },
  {
    id: 'test-003',
    title: 'Podcast Episode Ideas Q1 2026',
    description: 'Curated list of trending topics for upcoming podcast episodes',
    content: `## Episode Ideas

### High Potential Topics
1. **AI Agents in Creative Work**
   - Interview with Midjourney founder
   - Case study: AI-assisted music production
   - Debate: Will AI replace creators?

2. **The Future of Short-Form Content**
   - TikTok vs YouTube Shorts analysis
   - Revenue models comparison
   - Creator migration patterns

3. **Building in Public**
   - Success stories from indie hackers
   - Transparency vs competition
   - Community building strategies

### Guest Recommendations
- @levelsio (Pieter Levels)
- @sama (Sam Altman)
- @mrbeast (Jimmy Donaldson)

### Research Notes
- Check Twitter/X trending topics weekly
- Monitor Hacker News front page
- Track Product Hunt launches`,
    category: 'idea',
    confidence: 0.75,
    tags: ['podcast', 'ideas', 'content', 'planning', 'q1-2026'],
    source_url: 'https://trello.com/b/podcast-board',
    status: 'published',
    metadata: {
      author: 'Content Team',
      episode_count: 12,
      target_length: '45-60 min',
      format: 'interview'
    },
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-01T14:30:00Z'
  },
  {
    id: 'test-004',
    title: 'Competitor Analysis: ViewStats Pro',
    description: 'Feature comparison and gap analysis for outlier detection tools',
    content: `## Competitor Overview

### ViewStats Pro
**Strengths:**
- Real-time outlier alerts
- Historical trend analysis
- YouTube-native integration

**Weaknesses:**
- Limited export formats
- No API access for enterprise
- UI/UX feels dated

### Social Blade
**Strengths:**
- Multi-platform support
- Public leaderboards
- Free tier available

**Weaknesses:**
- Data delay (24-48 hours)
- No AI-powered insights
- Limited customization

### VidIQ
**Strengths:**
- Browser extension
- SEO recommendations
- Competitor tracking

**Weaknesses:**
- Expensive at scale
- Overwhelming for beginners
- Limited outlier detection

## Our Opportunity
Focus on **actionable insights** rather than raw data. Build the "what should I do" layer on top of analytics.`,
    category: 'analysis',
    confidence: 0.85,
    tags: ['competitors', 'viewstats', 'analysis', 'features', 'strategy'],
    source_url: 'https://viewstats.com/pro',
    status: 'published',
    metadata: {
      author: 'Product Team',
      competitors_analyzed: 5,
      gaps_identified: 8,
      priority_features: ['api', 'alerts', 'insights']
    },
    created_at: '2026-02-05T13:00:00Z',
    updated_at: '2026-02-08T09:30:00Z'
  },
  {
    id: 'test-005',
    title: 'Weekly Team Notes - Feb Week 2',
    description: 'Internal team updates and action items from sprint planning',
    content: `## Sprint 14 Updates

### Completed ✅
- [x] Database migration to PostgreSQL 15
- [x] API rate limiting implemented
- [x] Frontend component library v2 released
- [x] CI/CD pipeline optimized (build time: 3min → 45s)

### In Progress 🚧
- [ ] Outlier detection algorithm refinement
- [ ] Mobile responsive design for dashboard
- [ ] User onboarding flow redesign
- [ ] Performance optimization for large datasets

### Blockers 🚫
- Waiting for AWS credits approval
- Third-party API quota limits
- Designer availability next week

### Action Items
1. @steven - Review PR #234 by EOD
2. @sarah - Schedule user interviews for next week
3. @mike - Update API documentation

### Next Week Focus
- Launch preparation for v1.0 beta
- Security audit completion
- Performance benchmarking`,
    category: 'note',
    confidence: 1.0,
    tags: ['team', 'sprint', 'notes', 'internal', 'planning'],
    source_url: null,
    status: 'draft',
    metadata: {
      author: 'Team Lead',
      sprint: 14,
      team_size: 5,
      velocity: 34
    },
    created_at: '2026-02-12T17:00:00Z',
    updated_at: '2026-02-12T17:30:00Z'
  },
  {
    id: 'test-006',
    title: 'Useful Resources for Content Creators',
    description: 'Curated collection of tools and resources for video creators',
    content: `## Video Production

### Editing Software
- **DaVinci Resolve** - Free, professional-grade color grading
- **Premiere Pro** - Industry standard, Creative Cloud integration
- **Final Cut Pro** - Optimized for Mac, magnetic timeline

### Thumbnail Design
- **Canva** - Easy templates, great for beginners
- **Photoshop** - Full creative control
- **Figma** - Collaborative design, component system

## Analytics & Research
- ViewStats - YouTube outlier detection
- Social Blade - Multi-platform tracking
- TubeBuddy - SEO and optimization
- VidIQ - Keyword research

## Learning Resources
- YouTube Creator Academy (free)
- MrBeast's Creator Insider interviews
- Pat Flynn's Smart Passive Income
- Ali Abdaal's Part-Time YouTuber Academy

## Communities
- r/NewTubers (Reddit)
- Creator Economy Discord
- Y Combinator's Creator Community

*Last updated: February 2026*`,
    category: 'resource',
    confidence: 0.90,
    tags: ['resources', 'tools', 'creators', 'youtube', 'production'],
    source_url: 'https://www.notion.so/resources-db',
    status: 'published',
    metadata: {
      author: 'Community Manager',
      resource_count: 15,
      category: 'tools',
      last_verified: '2026-02-10'
    },
    created_at: '2026-02-01T11:00:00Z',
    updated_at: '2026-02-10T14:00:00Z'
  }
];

export default testEntries;
