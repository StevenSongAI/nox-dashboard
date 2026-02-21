/**
 * Minecraft Mod Loader Comparison Tool
 * Based on 2026 research: Fabric vs Forge vs NeoForge comparison
 * Research: Fabric = speed/performance/quick updates, Forge = extensive modpacks/stability
 * NeoForge = modern Forge alternative, Sinytra Connector = compatibility layer
 */

class ModLoaderComparison {
  constructor() {
    this.loaders = {
      fabric: {
        name: 'Fabric',
        icon: '🧵',
        bestFor: 'Performance, quick updates',
        website: 'https://fabricmc.net',
        strengths: [
          'Lightweight and fast',
          'First to support new Minecraft versions',
          'Quick updates after MC releases',
          'Improved performance',
          'Modular design',
          'Easy to set up'
        ],
        weaknesses: [
          'Smaller mod ecosystem than Forge',
          'Fewer large modpacks',
          'Less documentation for beginners',
          'Some complex mods not available'
        ],
        versions: '1.14+',
        performance: 95,
        ecosystem: 75,
        easeOfUse: 85,
        updateSpeed: 98,
        stability: 80
      },
      forge: {
        name: 'Forge',
        icon: '⚒️',
        bestFor: 'Extensive modpacks, stability',
        website: 'https://minecraftforge.net',
        strengths: [
          'Massive mod ecosystem',
          'Proven stability over 10+ years',
          'Extensive documentation',
          'Large community support',
          'Best for complex modpacks',
          'Event-driven API'
        ],
        weaknesses: [
          'Slower updates than Fabric',
          'Heavier resource usage',
          'More complex to develop for',
          'Internal changes between versions'
        ],
        versions: '1.1+',
        performance: 70,
        ecosystem: 95,
        easeOfUse: 70,
        updateSpeed: 60,
        stability: 95
      },
      neoforge: {
        name: 'NeoForge',
        icon: '🔧',
        bestFor: 'Modern Forge alternative',
        website: 'https://neoforged.net',
        strengths: [
          'Fork of Forge with modern features',
          'Better for newer MC versions',
          'Active development post-split',
          'Improved codebase',
          'Community-driven',
          'Most Forge mods compatible'
        ],
        weaknesses: [
          'Newer (less history than Forge)',
          'Some older mods not ported',
          'Smaller community than original Forge',
          'Documentation still growing'
        ],
        versions: '1.20.1+',
        performance: 75,
        ecosystem: 85,
        easeOfUse: 75,
        updateSpeed: 75,
        stability: 85
      }
    };
    
    this.currentLoader = 'fabric';
    this.compareMode = false;
    this.selectedLoaders = ['fabric', 'neoforge'];
    this.mcVersion = '1.21.1';
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="mod-loader-comparison-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">🔧 Minecraft Mod Loader Comparison</h3>
            <p class="text-sm text-gray-400">Choose the right loader for your mods in 2026</p>
          </div>
          <div class="flex gap-2">
            <button onclick="modLoaderComparison.toggleMode()" id="loader-mode-toggle" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">
              📊 Compare Mode
            </button>
          </div>
        </div>

        <!-- Version Selector -->
        <div class="mb-4 card rounded-lg p-4">
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-400">Minecraft Version:</label>
            <select onchange="modLoaderComparison.updateVersion(this.value)" 
                    class="bg-dark-700 rounded px-3 py-1 text-sm">
              <option value="1.21.1" selected>1.21.1 (Latest Stable)</option>
              <option value="1.20.4">1.20.4</option>
              <option value="1.20.1">1.20.1</option>
              <option value="1.19.4">1.19.4</option>
            </select>
            <div id="version-recommendation" class="text-sm text-accent-green">${this.getVersionRecommendation()}</div>
          </div>
        </div>

        <!-- Loader Selector -->
        <div class="mb-4">
          <div class="grid grid-cols-3 gap-2">
            ${Object.entries(this.loaders).map(([key, loader]) => `
              <button onclick="modLoaderComparison.selectLoader('${key}')" 
                      class="loader-btn p-3 rounded-lg text-left transition-all ${this.currentLoader === key ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-loader="${key}">
                <div class="text-2xl mb-1">${loader.icon}</div>
                <div class="font-medium text-sm">${loader.name}</div>
                <div class="text-xs opacity-70">${loader.bestFor}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Content -->
        <div id="loader-content">${this.renderSingleView()}</div>

        <!-- Compatibility Note -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-purple-500">
          <h4 class="text-sm font-semibold text-purple-400 mb-2">🔗 Cross-Loader Compatibility</h4>
          <div class="text-sm text-gray-300">
            <strong>Sinytra Connector</strong> allows many Fabric mods to run on Forge/NeoForge. 
            Combined with <strong>Forgified Fabric API</strong>, this bridges the gap between loaders.
            Great for running Fabric-only mods on NeoForge modpacks.
          </div>
        </div>

        <!-- 2026 Recommendations -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="text-sm font-semibold text-green-400 mb-2">🚀 For Speed/Performance</h4>
            <div class="text-sm text-gray-300"><strong>Use Fabric</strong> if you want the fastest loader with quickest updates and best performance. Ideal for smaller mod lists and newer Minecraft versions.</div>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-orange-500">
            <h4 class="text-sm font-semibold text-orange-400 mb-2">📦 For Large Modpacks</h4>
            <div class="text-sm text-gray-300"><strong>Use NeoForge</strong> for modern Minecraft versions with extensive mod lists. Most stable for complex interactions between many mods.</div>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-blue-500">
            <h4 class="text-sm font-semibold text-blue-400 mb-2">🔧 For Legacy/Specific Mods</h4>
            <div class="text-sm text-gray-300"><strong>Use Forge</strong> if you need specific older mods that haven't been ported. Still best for 1.12.2 and earlier versions.</div>
          </div>
        </div>
      </div>
    `;
  }

  renderSingleView() {
    const loader = this.loaders[this.currentLoader];
    return `
      <div class="card rounded-lg p-4">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-4xl">${loader.icon}</span>
          <div>
            <h4 class="text-xl font-bold">${loader.name}</h4>
            <div class="text-sm text-gray-400">${loader.bestFor} • ${loader.versions}</div>
          </div>
          <a href="${loader.website}" target="_blank" rel="noopener" 
             class="ml-auto px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">Visit →</a>
        </div>

        <div class="grid grid-cols-5 gap-2 mb-4">
          <div class="bg-dark-800 rounded p-2 text-center">
            <div class="text-lg font-bold text-accent-green">${loader.performance}</div>
            <div class="text-xs text-gray-400">Performance</div>
          </div>
          <div class="bg-dark-800 rounded p-2 text-center">
            <div class="text-lg font-bold text-accent-blue">${loader.ecosystem}</div>
            <div class="text-xs text-gray-400">Ecosystem</div>
          </div>
          <div class="bg-dark-800 rounded p-2 text-center">
            <div class="text-lg font-bold text-accent-purple">${loader.easeOfUse}</div>
            <div class="text-xs text-gray-400">Ease of Use</div>
          </div>
          <div class="bg-dark-800 rounded p-2 text-center">
            <div class="text-lg font-bold text-yellow-400">${loader.updateSpeed}</div>
            <div class="text-xs text-gray-400">Update Speed</div>
          </div>
          <div class="bg-dark-800 rounded p-2 text-center">
            <div class="text-lg font-bold text-red-400">${loader.stability}</div>
            <div class="text-xs text-gray-400">Stability</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-semibold text-green-400 mb-2">✅ Strengths</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${loader.strengths.map(s => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>
          
          <div>
            <h5 class="text-sm font-semibold text-red-400 mb-2">❌ Weaknesses</h5>
            <ul class="text-sm text-gray-300 space-y-1">
              ${loader.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderCompareView() {
    const [loader1Key, loader2Key] = this.selectedLoaders;
    const loader1 = this.loaders[loader1Key];
    const loader2 = this.loaders[loader2Key];

    const metrics = [
      { name: 'Performance', key: 'performance' },
      { name: 'Ecosystem', key: 'ecosystem' },
      { name: 'Ease of Use', key: 'easeOfUse' },
      { name: 'Update Speed', key: 'updateSpeed' },
      { name: 'Stability', key: 'stability' }
    ];

    return `
      <div class="card rounded-lg p-4">
        <div class="flex justify-between mb-4">
          ${[loader1, loader2].map(l => `
            <div class="text-center flex-1">
              <div class="text-3xl">${l.icon}</div>
              <div class="font-bold">${l.name}</div>
            </div>
          `).join('')}
        </div>

        <table class="w-full text-sm">
          <tbody>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">Best For</td><td>${loader1.bestFor}</td><td>${loader2.bestFor}</td></tr>
            <tr class="border-b border-dark-700"><td class="py-2 text-gray-400">MC Versions</td><td>${loader1.versions}</td><td>${loader2.versions}</td></tr>
            ${metrics.map(m => `
              <tr class="border-b border-dark-700">
                <td class="py-2 text-gray-400">${m.name}</td>
                <td class="${loader1[m.key] > loader2[m.key] ? 'text-green-400 font-bold' : ''}">${loader1[m.key]}/100</td>
                <td class="${loader2[m.key] > loader1[m.key] ? 'text-green-400 font-bold' : ''}">${loader2[m.key]}/100</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  getVersionRecommendation() {
    if (this.mcVersion.startsWith('1.21')) {
      return '✅ Fabric or NeoForge recommended for 1.21+';
    } else if (this.mcVersion.startsWith('1.20')) {
      return '✅ All loaders support 1.20.x';
    } else {
      return '⚠️ Consider updating for better mod support';
    }
  }

  updateVersion(version) {
    this.mcVersion = version;
    document.getElementById('version-recommendation').textContent = this.getVersionRecommendation();
  }

  selectLoader(key) {
    this.currentLoader = key;
    this.refreshUI();
  }

  toggleMode() {
    this.compareMode = !this.compareMode;
    document.getElementById('loader-mode-toggle').textContent = this.compareMode ? '👁️ Single View' : '📊 Compare Mode';
    document.getElementById('loader-content').innerHTML = this.compareMode ? this.renderCompareView() : this.renderSingleView();
  }

  refreshUI() {
    document.querySelectorAll('.loader-btn').forEach(btn => {
      const isActive = btn.dataset.loader === this.currentLoader;
      btn.className = `loader-btn p-3 rounded-lg text-left transition-all ${isActive ? 'bg-accent-blue text-white ring-2 ring-accent-blue' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    if (!this.compareMode) {
      document.getElementById('loader-content').innerHTML = this.renderSingleView();
    }
  }
}

// Initialize global instance
window.ModLoaderComparison = ModLoaderComparison;
window.modLoaderComparison = new ModLoaderComparison();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mod-loader-comparison-container')) {
    window.modLoaderComparison.render('mod-loader-comparison-container');
  }
});
