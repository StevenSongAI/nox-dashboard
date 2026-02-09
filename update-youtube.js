const fs = require('fs');
const path = require('path');

// Read the youtube.json file
const youtubePath = path.join(__dirname, 'data', 'youtube.json');
const youtube = JSON.parse(fs.readFileSync(youtubePath, 'utf8'));

// Add new content brief for "Old vs New" comparison format
const newBrief = {
  id: "brief-old-vs-new-001",
  title: "AI Creatures: Old vs New Comparison Format",
  summary: "Comparison format (Old vs New) drives massive engagement - foxboyhorror achieved 188x outlier score with Trevor Henderson creature comparison. Viewers love seeing evolution and comparing iterations.",
  hook: "I compared my first AI creature to my latest... the difference is terrifying",
  outline: [
    "Show earliest AI creature attempt (crude, basic)",
    "Reveal current generation capabilities (detailed, realistic)",
    "Side-by-side comparison of same prompts",
    "Evolution timeline - what changed each generation",
    "Try to recreate original creature with new tools",
    "Final verdict: How far we've come"
  ],
  targetLength: "12-16 min",
  difficulty: "low",
  urgency: "high",
  basedOn: [
    "yt-viewstats-009 (188x outlier - Old Vs New Trevor Henderson)",
    "memedokies (11.6x - drawing progression)"
  ],
  expectedOutlierScore: 80,
  status: "ready",
  createdAt: new Date().toISOString()
};

// Add new synthesized insight for comparison format
const newInsight = {
  id: "insight-012",
  pattern: "Old vs New Comparison Format = Nostalgia + Progress Visualized",
  evidence: "foxboyhorror 'Old Vs New Trevor Henderson Monsters' (188x outlier, 2.64M views on 336K subs). memedokies 'drawing my dog until she becomes incomprehensible' (11.6x, 2.71M views).",
  finding: "Comparison format leverages nostalgia for older content while showcasing improvement/progression. Creates dual emotional hooks: recognition of the old + surprise at the new. 'Then vs Now' structure is endlessly repeatable across niches.",
  actionable: "Create 'AI Creatures: First Try vs Latest' series. Each episode compares early AI generation attempts with current state-of-the-art using identical prompts. Document the evolution of AI tools through creature generation lens.",
  confidence: "high",
  addedAt: new Date().toISOString()
};

// Append to arrays
youtube.contentBriefs.push(newBrief);
youtube.trendAnalysis.synthesizedInsights.push(newInsight);

// Write back
fs.writeFileSync(youtubePath, JSON.stringify(youtube, null, 2));

console.log('Added new content brief:', newBrief.id);
console.log('Added new synthesized insight:', newInsight.id);
console.log('Total content briefs:', youtube.contentBriefs.length);
console.log('Total synthesized insights:', youtube.trendAnalysis.synthesizedInsights.length);
