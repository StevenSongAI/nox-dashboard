/**
 * Minecraft Speedrun Strategy Tracker
 * Based on 2026 research: Random Seed Glitchless category, one-cycling dragon,
 * villager trading strats, precise movement optimization
 */

class SpeedrunStrategyTracker {
  constructor() {
    this.categories = [
      { id: 'rsg', name: 'Random Seed Glitchless', version: '1.16+', wr: '6:50', difficulty: 'Hard', popular: true },
      { id: 'ssa', name: 'Set Seed Any%', version: '1.16+', wr: '~2:30', difficulty: 'Medium', popular: false },
      { id: 'fsg', name: 'Filter Seed Glitchless', version: '1.16+', wr: 'N/A', difficulty: 'Medium', popular: false },
      { id: 'aa', name: 'Any% All Advancements', version: '1.16+', wr: '~45:00', difficulty: 'Very Hard', popular: false }
    ];
    
    this.strategies = [
      {
        phase: 'Early Game',
        time: '0:00-2:00',
        keyActions: [
          'Gather wood (3-4 logs)',
          'Craft crafting table, wooden pickaxe',
          'Mine stone for stone tools',
          'Gather food (village/animals)',
          'Locate village or ruined portal'
        ],
        tips: ['Minimize inventory time', 'Move in straight lines', 'Don\'t stop for unnecessary resources']
      },
      {
        phase: 'Village/Nether Prep',
        time: '2:00-4:00',
        keyActions: [
          'Trade with villagers for pearls (1.16+)',
          'Gather beds for dragon fight',
          'Find obsidian for portal',
          'Get iron pickaxe',
          'Prepare food supply'
        ],
        tips: ['Reset if poor village trades', 'Prioritize Fletcher/Cleric', 'Gather 12+ pearls minimum']
      },
      {
        phase: 'Nether Entry',
        time: '4:00-8:00',
        keyActions: [
          'Light portal and enter',
          'Locate fortress',
          'Gather blaze rods (6-8)',
          'Exit or find bastion for gold',
          'Trade with Piglins for pearls'
        ],
        tips: ['Learn fortress spawn patterns', 'Barter efficiently', 'Track coordinates']
      },
      {
        phase: 'Stronghold Location',
        time: '8:00-12:00',
        keyActions: [
          'Use eyes of ender to triangulate',
          'Travel to stronghold coordinates',
          'Dig down to locate portal room',
          'Fill portal frames',
          'Prepare for dragon fight'
        ],
        tips: ['Triangulate from 2+ positions', 'Bring extra pearls', 'Practice pearl throws']
      },
      {
        phase: 'Dragon Fight',
        time: '12:00-End',
        keyActions: [
          'Enter End dimension',
          'Destroy crystals quickly',
          'Setup bed bombing position',
          'Execute one-cycle or multi-cycle',
          'Land final blows'
        ],
        tips: ['Master bed placement timing', 'Practice one-cycling', 'Stay calm under pressure']
      }
    ];
    
    this.pb = { minutes: 15, seconds: 30 };
    this.target = { minutes: 12, seconds: 0 };
    this.splits = [];
    this.initSplits();
  }

  initSplits() {
    this.splits = this.strategies.map(s => ({
      phase: s.phase,
      target: this.parseTime(s.time.split('-')[1]),
      pb: null,
      best: null
    }));
  }

  parseTime(timeStr) {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="speedrun-tracker-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-green">⏱️ Minecraft Speedrun Tracker</h3>
            <p class="text-sm text-gray-400">Track your Random Seed Glitchless runs and improve your PB</p>
          </div>
          <div class="flex gap-2">
            <button onclick="speedrunTracker.exportSplits()" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">📋 Export</button>
            <button onclick="speedrunTracker.resetSplits()" class="px-3 py-1 bg-dark-700 rounded text-sm hover:bg-dark-600">Reset</button>
          </div>
        </div>

        <!-- WR Banner -->
        <div class="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">🏆</span>
              <div>
                <div class="font-medium text-yellow-400">World Record: 6:50 by lowk3y_</div>
                <div class="text-sm text-gray-300">Random Seed Glitchless (1.16+) — Updated 2026</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-400">Top Category</div>
              <div class="text-sm font-medium">Japanese players pioneered most strats</div>
            </div>
          </div>
        </div>

        <!-- PB Tracker -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-xs text-gray-400">Your PB</div>
            <div class="text-2xl font-bold text-accent-green" id="pb-display">${this.formatTime(this.pb.minutes * 60 + this.pb.seconds)}</div>
            <input type="time" id="pb-input" value="${String(this.pb.minutes).padStart(2,'0')}:${String(this.pb.seconds).padStart(2,'0')}"
                   onchange="speedrunTracker.updatePB(this.value)" class="mt-1 bg-dark-700 rounded text-sm">
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-xs text-gray-400">Target</div>
            <div class="text-2xl font-bold text-accent-blue" id="target-display">${this.formatTime(this.target.minutes * 60 + this.target.seconds)}</div>
            <input type="time" id="target-input" value="${String(this.target.minutes).padStart(2,'0')}:${String(this.target.seconds).padStart(2,'0')}"
                   onchange="speedrunTracker.updateTarget(this.value)" class="mt-1 bg-dark-700 rounded text-sm">
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-xs text-gray-400">Gap to WR</div>
            <div class="text-2xl font-bold text-red-400" id="gap-wr">${this.formatTime((this.pb.minutes * 60 + this.pb.seconds) - 410)}</div>
            <div class="text-xs text-gray-500">behind</div>
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-xs text-gray-400">Improvement Needed</div>
            <div class="text-2xl font-bold text-yellow-400" id="gap-target">${this.formatTime((this.pb.minutes * 60 + this.pb.seconds) - (this.target.minutes * 60 + this.target.seconds))}</div>
            <div class="text-xs text-gray-500">to hit target</div>
          </div>
        </div>

        <!-- Strategy Phases -->
        <div class="space-y-3">
          ${this.strategies.map((strat, idx) => `
            <div class="card rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl font-bold text-accent-purple">${idx + 1}</span>
                  <div>
                    <div class="font-semibold">${strat.phase}</div>
                    <div class="text-xs text-gray-400">Target: ${strat.time}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input type="text" placeholder="PB time" 
                         onchange="speedrunTracker.setSplit(${idx}, this.value)"
                         class="w-20 bg-dark-700 rounded px-2 py-1 text-sm text-center">
                  <button onclick="speedrunTracker.markSplit(${idx})" class="px-2 py-1 bg-accent-green rounded text-xs">Mark</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-dark-800 rounded p-3">
                  <div class="text-xs font-medium text-gray-400 mb-2">🎯 Key Actions</div>
                  <ul class="text-sm text-gray-300 space-y-1">
                    ${strat.keyActions.map(a => `<li>• ${a}</li>`).join('')}
                  </ul>
                </div>

                <div class="bg-dark-800 rounded p-3">
                  <div class="text-xs font-medium text-yellow-400 mb-2">💡 Pro Tips</div>
                  <ul class="text-sm text-gray-300 space-y-1">
                    ${strat.tips.map(t => `<li>• ${t}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Advanced Techniques -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-red-500">
          <h4 class="text-sm font-semibold text-red-400 mb-3">🔥 Advanced Techniques (2026 Meta)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium mb-1">One-Cycling the Dragon</div>
              <div class="text-xs text-gray-400">Defeat the dragon in a single perch phase using perfectly timed bed explosions. Saves 30-60 seconds. Mastered by top runners.</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium mb-1">Village Trading Optimization</div>
              <div class="text-xs text-gray-400">1.16+ strats focus on Fletcher/Cleric trades. Reset if poor trades. 12+ pearls minimum before entering Nether.</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium mb-1">Fortress Spawn Pattern Recognition</div>
              <div class="text-xs text-gray-400">Learn common fortress spawn locations relative to portal. Use F3 coordinates efficiently. Practice navigation blindfolded.</div>
            </div>
            <div class="bg-dark-800 rounded p-3">
              <div class="font-medium mb-1">Pearl Throw Consistency</div>
              <div class="text-xs text-gray-400">Practice eye of ender throws for stronghold triangulation. Two-position triangulation saves 20-30 seconds vs guessing.</div>
            </div>
          </div>
        </div>

        <!-- Category Info -->
        <div class="mt-6 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">📊 Speedrun Categories</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-dark-700">
                  <th class="pb-2">Category</th>
                  <th class="pb-2">Version</th>
                  <th class="pb-2">WR</th>
                  <th class="pb-2">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                ${this.categories.map(c => `
                  <tr class="border-b border-dark-700/50 ${c.popular ? 'bg-accent-blue/10' : ''}">
                    <td class="py-2 font-medium">${c.name} ${c.popular ? '⭐' : ''}</td>
                    <td class="py-2">${c.version}</td>
                    <td class="py-2 font-mono">${c.wr}</td>
                    <td class="py-2">${c.difficulty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  updatePB(value) {
    const [min, sec] = value.split(':').map(Number);
    this.pb = { minutes: min, seconds: sec };
    this.refreshStats();
  }

  updateTarget(value) {
    const [min, sec] = value.split(':').map(Number);
    this.target = { minutes: min, seconds: sec };
    this.refreshStats();
  }

  refreshStats() {
    const pbSeconds = this.pb.minutes * 60 + this.pb.seconds;
    const targetSeconds = this.target.minutes * 60 + this.target.seconds;
    
    document.getElementById('pb-display').textContent = this.formatTime(pbSeconds);
    document.getElementById('target-display').textContent = this.formatTime(targetSeconds);
    document.getElementById('gap-wr').textContent = this.formatTime(pbSeconds - 410);
    document.getElementById('gap-target').textContent = this.formatTime(pbSeconds - targetSeconds);
  }

  setSplit(idx, time) {
    // Parse time input (M:SS or MM:SS)
    const parts = time.split(':');
    const seconds = parts.length === 2 
      ? parseInt(parts[0]) * 60 + parseInt(parts[1])
      : parseInt(time);
    
    if (this.splits[idx]) {
      this.splits[idx].pb = seconds;
    }
  }

  markSplit(idx) {
    // In a real implementation, this would capture current run time
    alert(`Split marked for ${this.strategies[idx].phase}!`);
  }

  exportSplits() {
    const data = {
      pb: this.pb,
      target: this.target,
      splits: this.splits,
      exportDate: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      alert('Splits data copied to clipboard!');
    });
  }

  resetSplits() {
    if (confirm('Reset all splits?')) {
      this.initSplits();
      this.refreshStats();
    }
  }
}

// Initialize global instance
window.SpeedrunStrategyTracker = SpeedrunStrategyTracker;
window.speedrunTracker = new SpeedrunStrategyTracker();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('speedrun-tracker-container')) {
    window.speedrunTracker.render('speedrun-tracker-container');
  }
});
