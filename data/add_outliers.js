const fs = require("fs");
const data = JSON.parse(fs.readFileSync("youtube.json", "utf8"));

const newOutliers = [
  {
    "id": "yt-viewstats-023",
    "title": "Evolution Of Godzilla | Life Cycle",
    "channel": "worldinnumbers3d",
    "views": 1060000,
    "publishedAt": "2023-02-08T00:00:00Z",
    "addedAt": "2026-02-09T02:10:00Z",
    "outlierScore": 13.3,
    "niche": "🦖 Kaiju/Creature Evolution",
    "whyOutlier": "13.3x outlier - 1.06M views on 87K sub channel. Life cycle/evolution format with iconic kaiju creates massive appeal.",
    "contentAngle": "Create AI creature life cycle videos - show evolution from birth to ultimate form with cinematic presentation",
    "url": "https://www.youtube.com/watch?v=6yDY7bOdbRs",
    "researchStatus": "completed",
    "source": "viewstats outlier research - direct from viewstats.com/pro/outliers"
  },
  {
    "id": "yt-viewstats-024",
    "title": "All Alien Creatures & Evolution Compilation | Maxxive Jumpo",
    "channel": "maxxivejumpo",
    "views": 316000,
    "publishedAt": "2024-02-08T00:00:00Z",
    "addedAt": "2026-02-09T02:10:00Z",
    "outlierScore": 28.0,
    "niche": "👽 Alien/Creature Evolution",
    "whyOutlier": "28x outlier - 316K views on 56K sub channel. Alien creature compilation + evolution format hits algorithm sweet spot.",
    "contentAngle": "Create All AI Creatures & Evolution compilations - showcase multiple AI-generated creatures with evolution stages",
    "url": "https://www.youtube.com/watch?v=f7cTlQ947bw",
    "researchStatus": "completed",
    "source": "viewstats outlier research - direct from viewstats.com/pro/outliers"
  },
  {
    "id": "yt-viewstats-025",
    "title": "New MINECRAFT Pokemon Region - Minecraft Inspired Fakemon",
    "channel": "metalfear4",
    "views": 565000,
    "publishedAt": "2023-02-08T00:00:00Z",
    "addedAt": "2026-02-09T02:10:00Z",
    "outlierScore": 15.3,
    "niche": "🎮 Gaming/Pokémon/Minecraft",
    "whyOutlier": "15.3x outlier - 565K views on 143K sub channel. Minecraft + Pokémon crossover with custom fakemon designs = viral formula.",
    "contentAngle": "Create AI-generated creatures inspired by Minecraft mobs - Minecraft Mob Evolutions with custom designs",
    "url": "https://www.youtube.com/watch?v=FmMHgGEKmKU",
    "researchStatus": "completed",
    "source": "viewstats outlier research - direct from viewstats.com/pro/outliers"
  }
];

data.outlierVideos.push(...newOutliers);
data.trendAnalysis.lastUpdated = "2026-02-09T02:10:00Z";

fs.writeFileSync("youtube.json", JSON.stringify(data, null, 2));
console.log("Added 3 new outlier videos");
console.log("Total outliers:", data.outlierVideos.length);
