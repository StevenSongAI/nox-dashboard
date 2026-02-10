// ============================================
// INTEGRATED TOOLS: Storyboard & Voiceover Generators
// ============================================

// Tools Tab Navigation
function showToolsSection(section) {
  // Hide all sections
  document.querySelectorAll('.tools-section').forEach(s => s.classList.add('hidden'));
  // Show selected section
  document.getElementById(`tools-section-${section}`).classList.remove('hidden');
  
  // Update button states
  document.querySelectorAll('[id^="tools-btn-"]').forEach(btn => {
    btn.classList.remove('bg-accent-blue');
    btn.classList.add('bg-dark-700');
  });
  document.getElementById(`tools-btn-${section}`).classList.remove('bg-dark-700');
  document.getElementById(`tools-btn-${section}`).classList.add('bg-accent-blue');
}

// ============================================
// STORYBOARD GENERATOR
// ============================================

const storyboardPresets = {
  creature: {
    title: "I Got a Pet [Creature]",
    type: "creature",
    duration: "medium",
    concept: "Player discovers and raises an AI-generated creature from egg to adult. Shows feeding, training, and bonding moments.",
    hook: "I found something impossible in Minecraft today..."
  },
  comparison: {
    title: "[Tool A] vs [Tool B] - 30 Day Test",
    type: "comparison",
    duration: "long",
    concept: "Side-by-side comparison of two tools over 30 days. Daily progress tracking and final verdict.",
    hook: "I used both tools for 30 days. The results shocked me."
  },
  tutorial: {
    title: "How to [Achieve Result] in [Timeframe]",
    type: "tutorial",
    duration: "medium",
    concept: "Step-by-step guide teaching viewers a specific skill or technique with clear examples.",
    hook: "Stop doing this wrong. Here's the right way."
  }
};

function loadStoryboardPreset(type) {
  const preset = storyboardPresets[type];
  document.getElementById('sb-title').value = preset.title;
  document.getElementById('sb-type').value = preset.type;
  document.getElementById('sb-duration').value = preset.duration;
  document.getElementById('sb-concept').value = preset.concept;
  document.getElementById('sb-hook').value = preset.hook;
}

let generatedScenes = [];

function generateStoryboard() {
  const title = document.getElementById('sb-title').value || 'Untitled Video';
  const type = document.getElementById('sb-type').value;
  const duration = document.getElementById('sb-duration').value;
  const concept = document.getElementById('sb-concept').value;
  const hook = document.getElementById('sb-hook').value;

  const sceneCounts = { short: 4, medium: 6, long: 8 };
  const sceneCount = sceneCounts[duration];

  generatedScenes = [];
  let currentTime = 0;

  // Scene 1: Hook/Intro
  generatedScenes.push({
    number: 1,
    type: 'intro',
    title: 'Hook',
    description: hook || 'Attention-grabbing opening that sets up the video premise.',
    duration: '0:00-0:15',
    visual: 'Dynamic opening shot with text overlay'
  });

  // Scene 2: Setup
  generatedScenes.push({
    number: 2,
    type: 'action',
    title: 'Setup/Context',
    description: concept ? concept.substring(0, 80) + '...' : 'Introduce the main topic and set context.',
    duration: '0:15-1:00',
    visual: 'Wide establishing shot, intro graphics'
  });

  // Middle scenes
  for (let i = 3; i <= sceneCount - 1; i++) {
    const isClimax = i === Math.floor(sceneCount / 2) + 1;
    const segmentDuration = isClimax ? 120 : 90;
    
    generatedScenes.push({
      number: i,
      type: isClimax ? 'climax' : 'action',
      title: isClimax ? 'Climax/Main Event' : `Development ${i-2}`,
      description: isClimax 
        ? 'Peak moment of the video - the main reveal, challenge, or turning point.'
        : 'Build tension and develop the narrative. Show progression and key moments.',
      duration: formatDuration(currentTime, currentTime + segmentDuration),
      visual: isClimax ? 'Dramatic lighting, close-ups' : 'Gameplay footage, B-roll'
    });
    currentTime += segmentDuration;
  }

  // Final scene: Outro
  generatedScenes.push({
    number: sceneCount,
    type: 'outro',
    title: 'Outro/CTA',
    description: 'Wrap up the video with key takeaways, subscribe call-to-action, and tease next video.',
    duration: formatDuration(currentTime, currentTime + 30),
    visual: 'End screen with subscribe button, related videos'
  });

  renderStoryboard();
}

function formatDuration(start, end) {
  const format = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  return `${format(start)}-${format(end)}`;
}

function renderStoryboard() {
  const container = document.getElementById('sb-preview');
  container.innerHTML = generatedScenes.map(scene => `
    <div class="card rounded-lg overflow-hidden border border-dark-600 hover:border-accent-blue transition-colors">
      <div class="bg-dark-700 px-4 py-2 flex justify-between items-center">
        <span class="font-semibold text-accent-blue">Scene ${scene.number}</span>
        <span class="text-xs px-2 py-1 rounded bg-dark-600 text-gray-300 uppercase">${scene.type}</span>
      </div>
      <div class="h-24 bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center text-gray-500 text-sm">
        🎬 ${scene.visual}
      </div>
      <div class="p-4">
        <h4 class="font-semibold mb-1">${scene.title}</h4>
        <p class="text-sm text-gray-400 mb-2">${scene.description}</p>
        <div class="text-xs text-gray-500">⏱️ ${scene.duration}</div>
      </div>
    </div>
  `).join('');
}

function exportStoryboardJSON() {
  if (generatedScenes.length === 0) {
    alert('Generate a storyboard first!');
    return;
  }
  const data = {
    title: document.getElementById('sb-title').value,
    created: new Date().toISOString(),
    scenes: generatedScenes
  };
  downloadFile(JSON.stringify(data, null, 2), `storyboard-${data.title.replace(/\s+/g, '-').toLowerCase()}.json`, 'application/json');
}

function exportStoryboardMD() {
  if (generatedScenes.length === 0) {
    alert('Generate a storyboard first!');
    return;
  }
  const title = document.getElementById('sb-title').value || 'Storyboard';
  let md = `# ${title}\n\n`;
  md += `Generated: ${new Date().toLocaleString()}\n\n`;
  generatedScenes.forEach(scene => {
    md += `## Scene ${scene.number}: ${scene.title}\n`;
    md += `- **Type:** ${scene.type}\n`;
    md += `- **Duration:** ${scene.duration}\n`;
    md += `- **Visual:** ${scene.visual}\n`;
    md += `- **Description:** ${scene.description}\n\n`;
  });
  downloadFile(md, `storyboard-${title.replace(/\s+/g, '-').toLowerCase()}.md`, 'text/markdown');
}

// ============================================
// VOICEOVER GENERATOR
// ============================================

let currentVoiceStyle = 'energetic';
let generatedSegments = [];

const voiceoverTemplates = {
  intro: `[HOOK - 0:00-0:15]\nStart with a bold statement or question that grabs attention immediately.\n\n[SETUP - 0:15-0:45]\nBriefly introduce what the video is about and why it matters.\n\n[TEASER - 0:45-1:00]\nGive a hint about the main reveal or conclusion.`,
  
  story: `[OPENING - Set the scene and introduce characters/situation]\n\n[RISING ACTION - Build tension, introduce conflict or challenge]\n\n[CLIMAX - The turning point or main event]\n\n[RESOLUTION - How it ends, lessons learned]\n\n[OUTRO - Call to action and next video tease]`,
  
  list: `[INTRO - Hook with the promise of valuable information]\n\n[POINT 1 - First item with explanation and example]\n\n[POINT 2 - Second item with context]\n\n[POINT 3 - Third item with details]\n\n[BONUS - Extra tip or secret most people don't know]\n\n[OUTRO - Recap and encourage engagement]`,
  
  review: `[HOOK - Bold opinion statement about the product/topic]\n\n[OVERVIEW - What is it and who is it for]\n\n[THE GOOD - Positives and strengths]\n\n[THE BAD - Negatives and limitations]\n\n[VERDICT - Final recommendation with rating]\n\n[ALTERNATIVES - Other options to consider]`
};

const voiceStyleTips = {
  energetic: ['Use upward inflections to build excitement', 'Speed up during exciting moments', 'Project energy through your voice', 'Use punchy, action-oriented language'],
  calm: ['Speak slowly with longer pauses', 'Use lower pitch and steady volume', 'Let the content breathe', 'Focus on clarity over speed'],
  dramatic: ['Build tension through pacing', 'Use vocal variety - whisper, then project', 'Emphasize key words with flair', 'Create emotional peaks and valleys'],
  educational: ['Be precise with technical terms', 'Use consistent pacing', 'Repeat key concepts', 'Break complex ideas into chunks']
};

function setVoiceStyle(style) {
  currentVoiceStyle = style;
  document.querySelectorAll('.voice-preset-btn').forEach(btn => {
    btn.classList.remove('bg-accent-blue');
    btn.classList.add('bg-dark-700');
  });
  document.querySelector(`[data-voice="${style}"]`).classList.remove('bg-dark-700');
  document.querySelector(`[data-voice="${style}"]`).classList.add('bg-accent-blue');
  
  // Update tips
  const tips = voiceStyleTips[style];
  document.getElementById('vo-tips-list').innerHTML = tips.map(t => `<li>• ${t}</li>`).join('');
}

function loadVOTemplate(type) {
  document.getElementById('vo-content').value = voiceoverTemplates[type];
}

function generateVoiceoverScript() {
  const title = document.getElementById('vo-title').value || 'Voiceover Script';
  const content = document.getElementById('vo-content').value;
  const duration = parseInt(document.getElementById('vo-duration').value);

  if (!content.trim()) {
    alert('Please enter some content first!');
    return;
  }

  const lines = content.split('\n').filter(l => l.trim());
  generatedSegments = [];
  let currentTime = 0;
  const wordsPerMinute = 150;

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/\[.*?\]/g, '').trim();
    if (!cleanLine) return;

    const wordCount = cleanLine.split(/\s+/).length;
    const segmentDuration = (wordCount / wordsPerMinute) * 60;
    const type = detectSegmentType(line, index, lines.length);

    generatedSegments.push({
      type: type,
      text: cleanLine,
      wordCount: wordCount,
      startTime: formatVOTime(currentTime),
      endTime: formatVOTime(currentTime + segmentDuration),
      notes: getVODeliveryNotes(type)
    });
    currentTime += segmentDuration;
  });

  renderVoiceoverScript();
  updateVOStats();
}

function detectSegmentType(line, index, total) {
  const lower = line.toLowerCase();
  if (index === 0 || lower.includes('hook')) return 'Hook';
  if (index === total - 1 || lower.includes('outro')) return 'Outro';
  if (lower.includes('intro') || lower.includes('opening')) return 'Intro';
  if (lower.includes('climax') || lower.includes('reveal')) return 'Climax';
  if (lower.includes('point') || lower.includes('tip')) return 'Point';
  return 'Content';
}

function getVODeliveryNotes(type) {
  const notes = {
    'Hook': 'High energy, direct address, grab attention immediately',
    'Intro': 'Set context, build anticipation',
    'Climax': 'Peak energy, dramatic pause before reveal',
    'Outro': 'Clear CTA, thank viewers, tease next video',
    'Point': 'Clear articulation, brief pause after',
    'Content': 'Steady pace, maintain engagement'
  };
  return notes[type] || notes['Content'];
}

function formatVOTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderVoiceoverScript() {
  const container = document.getElementById('vo-preview');
  container.innerHTML = generatedSegments.map((seg, i) => `
    <div class="p-3 bg-dark-700/50 rounded border-l-4 border-accent-blue">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-semibold text-accent-blue uppercase">${seg.type}</span>
        <span class="text-xs text-gray-500">${seg.startTime} - ${seg.endTime}</span>
      </div>
      <p class="text-sm text-gray-200 mb-2">${seg.text}</p>
      <p class="text-xs text-gray-500 italic">💡 ${seg.notes}</p>
    </div>
  `).join('');
}

function updateVOStats() {
  const totalWords = generatedSegments.reduce((sum, seg) => sum + seg.wordCount, 0);
  const lastSeg = generatedSegments[generatedSegments.length - 1];
  
  document.getElementById('vo-stat-words').textContent = totalWords;
  document.getElementById('vo-stat-time').textContent = lastSeg ? lastSeg.endTime : '0:00';
  document.getElementById('vo-stat-segments').textContent = generatedSegments.length;
  document.getElementById('vo-stats').classList.remove('hidden');
}

function exportVOText() {
  if (generatedSegments.length === 0) return;
  const title = document.getElementById('vo-title').value || 'Voiceover';
  let text = `${title}\n\n`;
  generatedSegments.forEach(seg => {
    text += `[${seg.type}] ${seg.startTime}\n${seg.text}\n\n`;
  });
  downloadFile(text, `${title.replace(/\s+/g, '-').toLowerCase()}-voiceover.txt`, 'text/plain');
}

function exportVOJSON() {
  if (generatedSegments.length === 0) return;
  const data = {
    title: document.getElementById('vo-title').value || 'Voiceover Script',
    voiceStyle: currentVoiceStyle,
    generated: new Date().toISOString(),
    segments: generatedSegments
  };
  downloadFile(JSON.stringify(data, null, 2), `${data.title.replace(/\s+/g, '-').toLowerCase()}-voiceover.json`, 'application/json');
}

function copyVOToClipboard() {
  if (generatedSegments.length === 0) return;
  const title = document.getElementById('vo-title').value || 'Voiceover';
  let text = `${title}\n\n`;
  generatedSegments.forEach(seg => {
    text += `[${seg.type}] ${seg.startTime}\n${seg.text}\n\n`;
  });
  navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
}

// Utility function for downloads
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Initialize tools when tab is shown
document.addEventListener('DOMContentLoaded', function() {
  // Set default voice style
  if (document.getElementById('vo-tips-list')) {
    setVoiceStyle('energetic');
  }
});
