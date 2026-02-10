const fs = require('fs');

// Read the current youtube.json
const data = JSON.parse(fs.readFileSync('./data/youtube.json', 'utf8'));

// New outliers found from viewstats research (cron task)
const newOutliers = [
  {
    "id": "yt-viewstats-097",
    "title": "THE ALIEN CREATURE | Hollywood Sci-Fi Action Full Movie",
    "channel": "veeoverseasfilms",
    "views": 423000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": "2026-02-09T19:00:00Z",
    "outlierScore": 322,
    "niche": "👽 Sci-Fi/Creature Feature",
    "whyOutlier": "EXTREME 322x outlier - 423K views on 61K sub channel! Full creature feature film achieving massive organic reach. Sci-fi creature content has dedicated audience.",
    "contentAngle": "Create full-length AI creature feature films or episodic series. 'The AI Creature' documentary-style presentation with cinematic quality.",
    "url": "https://www.youtube.com/watch?v=lwtf3_9JXws",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-098",
    "title": "Attack Of The Alice Clone Army | Resident Evil: Afterlife | Creature Features",
    "channel": "creaturefeaturesclips",
    "views": 1610000,
    "publishedAt": "2023-02-08T00:00:00Z",
    "addedAt": "2026-02-09T19:00:00Z",
    "outlierScore": 196,
    "niche": "🧟 Horror/Clone Army",
    "whyOutlier": "MASSIVE 196x outlier - 1.61M views on 1.1M sub channel! Clone army concept creates visual spectacle. Multi-creature scenes drive high engagement.",
    "contentAngle": "Create 'AI Creature Clone Army' videos - show armies of identical AI-generated creatures attacking/defending. Scale creates visual impact.",
    "url": "https://www.youtube.com/watch?v=rszg5D3j2c0",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-099",
    "title": "Turning The Gorilla Visible | Hollow Man | Creature Features",
    "channel": "creaturefeaturesclips",
    "views": 24600000,
    "publishedAt": "2025-02-08T00:00:00Z",
    "addedAt": "2026-02-09T19:00:00Z",
    "outlierScore": 74.9,
    "niche": "🦍 Sci-Fi/Creature Visibility",
    "whyOutlier": "74.9x outlier - 24.6M views on 1.1M sub channel! Invisible creature becoming visible creates satisfying reveal moment. High production value scene.",
    "contentAngle": "Create AI creature reveal sequences - invisible/transparent creatures becoming visible. Transformation/reveal moments drive retention.",
    "url": "https://www.youtube.com/watch?v=xR1rZlS5Lg8",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-100",
    "title": "Advanced Creature / Monsters Guide, combat tips, unknown tricks - Lethal Company",
    "channel": "wurps",
    "views": 500000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": "2026-02-09T19:00:00Z",
    "outlierScore": 15.3,
    "niche": "🎮 Gaming/Creature Guide",
    "whyOutlier": "15.3x outlier - 500K views on 42K sub channel! Advanced guide content with practical tips drives massive utility value. Lethal Company creature mechanics in high demand.",
    "contentAngle": "Create advanced guides for AI creature interactions. 'Advanced AI Creature Handling' with combat tips, hidden features, and optimization strategies.",
    "url": "https://www.youtube.com/watch?v=uLSLWbJdBlA",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  }
];

// Append new outliers to the array
data.outlierVideos.push(...newOutliers);

// Update meta.json
const meta = JSON.parse(fs.readFileSync('./data/meta.json', 'utf8'));
meta.lastUpdated = "2026-02-09T19:00:00Z";
meta.cacheBust = "202602091900";
meta.dataVersion = String(parseInt(meta.dataVersion || "0") + 1);

// Save files
fs.writeFileSync('./data/youtube.json', JSON.stringify(data, null, 2));
fs.writeFileSync('./data/meta.json', JSON.stringify(meta, null, 2));

console.log(`✅ Added ${newOutliers.length} new outlier videos`);
console.log(`📊 Total outliers: ${data.outlierVideos.length}`);
console.log('📝 Updated meta.json');
