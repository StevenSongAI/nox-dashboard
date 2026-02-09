const fs = require("fs");
const data = JSON.parse(fs.readFileSync("data/youtube.json", "utf8"));

const newOutliers = [
  {
    "id": "yt-viewstats-065",
    "title": "How I BECAME A DRAGON in Minecraft!",
    "channel": "littlelizardgaming",
    "views": 635000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": "2026-02-09T15:00:00Z",
    "outlierScore": 72.1,
    "niche": "🐉 Minecraft/Dragon Transformation",
    "whyOutlier": "EXTREME 72.1x outlier - 635K views on 4M sub channel. 'Became a dragon' transformation format creates immersive roleplay narrative. Minecraft dragon content consistently viral.",
    "contentAngle": "Create 'I Became an AI Dragon' series - first-person perspective transformation narrative with AI-generated dragon avatar progression.",
    "url": "https://www.youtube.com/watch?v=vZFdKwxrOPw",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-066",
    "title": "Playing Minecraft as a HELPFUL Dragon!",
    "channel": "mighty_friends",
    "views": 99000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": "2026-02-09T15:00:00Z",
    "outlierScore": 23.8,
    "niche": "🐉 Minecraft/Dragon Roleplay",
    "whyOutlier": "MASSIVE 23.8x outlier - 99K views on 102K sub channel. 'Helpful dragon' subverts typical destructive dragon trope. Role reversal creates unique narrative angle.",
    "contentAngle": "Create 'Playing as a HELPFUL AI Dragon' - subvert expectations by showing AI dragon assisting humans instead of attacking. Wholesome content angle.",
    "url": "https://www.youtube.com/watch?v=3ZrMGkwbV0Y",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-067",
    "title": "HOW TO TAME DRAGON In Taming.io",
    "channel": "fortish",
    "views": 76000,
    "publishedAt": "2020-02-08T00:00:00Z",
    "addedAt": "2026-02-09T15:00:00Z",
    "outlierScore": 16.2,
    "niche": "🐉 Gaming/Dragon Tutorial",
    "whyOutlier": "EXTREME 16.2x outlier - 76K views on 111K sub channel. Tutorial format for dragon taming in .io game drives strong engagement. Practical utility content.",
    "contentAngle": "Create 'How to Tame AI Dragons' tutorials - utility content teaching viewers to interact with/trigger behaviors in AI creature simulations.",
    "url": "https://www.youtube.com/watch?v=Y6tKTODYXPo",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": "yt-viewstats-068",
    "title": "I Got a Pet Dinosaur (kinda)",
    "channel": "terragreen1",
    "views": 21700000,
    "publishedAt": "2023-02-08T00:00:00Z",
    "addedAt": "2026-02-09T15:00:00Z",
    "outlierScore": 3.0,
    "niche": "🦖 Dinosaur/Pet Comedy",
    "whyOutlier": "3x outlier - 21.7M views on 3.5M sub channel. '(kinda)' qualifier creates curiosity gap. Pet dinosaur concept + humor drives massive mainstream appeal.",
    "contentAngle": "Create 'I Got a Pet [AI Creature] (kinda)' - comedy format where AI creature companionship has humorous complications/twists.",
    "url": "https://www.youtube.com/watch?v=QLI0XOFpK0A",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  }
];

data.outlierVideos.push(...newOutliers);

// Update meta timestamp
if (data.meta) {
  data.meta.lastUpdated = "2026-02-09T15:00:00Z";
}

fs.writeFileSync("data/youtube.json", JSON.stringify(data, null, 2));
console.log("Added 4 new outlier videos");
