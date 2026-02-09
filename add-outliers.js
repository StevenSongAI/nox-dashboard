const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'youtube.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Get current count to determine next ID number
const currentCount = data.outlierVideos.length;
let nextId = currentCount + 1;

// New outliers from viewstats search - verified NOT already in database
const newOutliers = [
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "We Turned Into BABY DRAGONS In Minecraft!",
    "channel": "nico",
    "views": 991000,
    "publishedAt": "2024-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 2.2,
    "niche": "🐉 Minecraft/Dragon Transformation",
    "whyOutlier": "2.2x outlier - 991K views on 4.7M sub channel. Transformation format (turning into baby dragons) drives engagement. Multiple players = more dynamic interactions.",
    "contentAngle": "Create 'We Turned Into AI Baby Dragons' - multiplayer transformation with different dragon types and abilities",
    "url": "https://www.youtube.com/watch?v=xiBCikNqOSU",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "THE BABY RAINBOW DRAGONS!",
    "channel": "crazycrafters",
    "views": 84000,
    "publishedAt": "2024-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 1.7,
    "niche": "🐉 Minecraft/Rainbow Dragons",
    "whyOutlier": "1.7x outlier - 84K views on 565K sub channel. Rainbow aesthetic + baby dragons creates visual appeal. Color variety adds discovery element.",
    "contentAngle": "Create 'The AI RAINBOW DRAGONS' - showcase multicolored AI-generated dragons with unique elemental abilities tied to colors",
    "url": "https://www.youtube.com/watch?v=HnIZlpxH6zk",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "The WILD Dragon Family - Minecraft Dragons",
    "channel": "littlelizardgaming",
    "views": 120000,
    "publishedAt": "2024-06-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 0.9,
    "niche": "🐉 Minecraft/Wild Dragons",
    "whyOutlier": "Recent upload (7 months ago) - 'WILD' descriptor implies untamed nature vs domesticated dragons. Dragon family content consistently performs.",
    "contentAngle": "Create 'The WILD AI Dragon Family' - untamed AI dragons with survival/wild behaviors vs typical pet dragons",
    "url": "https://www.youtube.com/watch?v=xTGGjS6dub0",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "Our Baby Dragon is Sick! - Minecraft Dragons",
    "channel": "littlelizardgaming",
    "views": 389000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 1.6,
    "niche": "🐉 Minecraft/Dragon Care",
    "whyOutlier": "1.6x outlier - 389K views on 4M sub channel. Sick pet narrative creates emotional stakes and care-taking gameplay loop.",
    "contentAngle": "Create 'My AI Dragon is Sick!' - illness/healing narrative with AI creature care mechanics. Emotional investment drives retention.",
    "url": "https://www.youtube.com/watch?v=NHWGWXWH7jw",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "We ADOPTED Baby Dragons in Minecraft PE!",
    "channel": "olioptv",
    "views": 338000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 4.0,
    "niche": "🐉 Minecraft/Dragon Adoption",
    "whyOutlier": "EXTREME 4x outlier - 338K views on 659K sub channel! 'ADOPTED' format + 'Baby Dragons' = viral combo. PE (Pocket Edition) reaches mobile audience.",
    "contentAngle": "Create 'We ADOPTED AI Baby Dragons' - adoption narrative with care/training progression. Mobile-friendly content angle.",
    "url": "https://www.youtube.com/watch?v=nDPRbn0wsEc",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "How To Make A Baby Dragon In Minecraft",
    "channel": "furioussss",
    "views": 110000,
    "publishedAt": "2022-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 10.1,
    "niche": "🐉 Minecraft/Dragon Tutorial",
    "whyOutlier": "EXTREME 10.1x outlier - 110K views on 3.3M sub channel. Tutorial format for creating baby dragons drives strong utility value.",
    "contentAngle": "Create 'How To Make an AI Baby Dragon' - tutorial format teaching viewers to create AI-generated baby dragons. Educational + practical.",
    "url": "https://www.youtube.com/watch?v=Y17CSQ7pJVI",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "which dragon has more health?",
    "channel": "axol",
    "views": 1250000,
    "publishedAt": "2023-02-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 3.6,
    "niche": "🐉 Gaming/Dragon Comparison",
    "whyOutlier": "MASSIVE 3.6x outlier - 1.25M views on 2.7M sub channel! Simple question format drives curiosity. Health stat comparison creates engagement.",
    "contentAngle": "Create 'Which AI dragon has more health?' - comparison format pitting different AI creatures against each other. Stats + visuals.",
    "url": "https://www.youtube.com/watch?v=iVyeeoWSi1A",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  },
  {
    "id": `yt-viewstats-${String(nextId++).padStart(3, '0')}`,
    "title": "Evo Baby Dragon Speeds up your Units.",
    "channel": "orangejuice",
    "views": 347000,
    "publishedAt": "2024-08-08T00:00:00Z",
    "addedAt": new Date().toISOString(),
    "outlierScore": 2.9,
    "niche": "🎮 Gaming/Baby Dragon Evolution",
    "whyOutlier": "2.9x outlier - 347K views on 3.6M sub channel. 'Evo' = evolution mechanic. Speed boost utility creates strategic gameplay value.",
    "contentAngle": "Create 'Evo Baby AI Dragon' - evolution mechanics with strategic abilities. Gameplay utility drives engagement.",
    "url": "https://www.youtube.com/watch?v=73ZdDY1z8tI",
    "researchStatus": "completed",
    "source": "viewstats outlier research - hourly cron"
  }
];

// Add new outliers to the array
data.outlierVideos.push(...newOutliers);

// Update meta timestamp
if (data.meta) {
  data.meta.lastUpdated = new Date().toISOString();
}

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`Added ${newOutliers.length} new outlier videos`);
console.log('New total count:', data.outlierVideos.length);
console.log('IDs added:', newOutliers.map(o => o.id).join(', '));
