class Minecraft2026Roadmap {
  constructor() {
    this.updates = [
      {
        name: '26.1 First Drop',
        date: 'Late March 2026',
        status: 'confirmed',
        features: [
          '15 baby mobs with new models/textures',
          'Craftable nametags',
          'Golden dandelion flower',
          'All baby mob variants redesigned'
        ],
        contentIdeas: [
          '"All 15 Baby Mobs Ranked"',
          '"I Built a Zoo for Every Baby Mob"',
          '"Craftable Nametags Finally!"'
        ]
      },
      {
        name: '26.2 Biomes & Botany',
        date: 'Spring 2026 (Rumored)',
        status: 'rumored',
        features: [
          'Pale Garden biome expansion',
          'New flora and vegetation',
          'Botanical items and crafting',
          'Biome-specific enhancements'
        ],
        contentIdeas: [
          '"Exploring the New Pale Garden"',
          '"Botany Guide for Survival"',
          '"Building in Biome-Specific Styles"'
        ]
      },
      {
        name: 'Minecraft Live 2026',
        date: 'March 2026 (Expected)',
        status: 'expected',
        features: [
          'Vibrant Visuals showcase',
          'Mob Vote 2026',
          '2026 roadmap beyond First Drop',
          'Potential new game announcements'
        ],
        contentIdeas: [
          '"Everything Announced at Minecraft Live"',
          '"I Voted For [Mob] - Here\'s Why"',
          '"Reacting to Live Announcements"'
        ]
      },
      {
        name: 'Vibrant Visuals',
        date: '2026 (TBD)',
        status: 'development',
        features: [
          'Enhanced lighting system',
          'Improved water effects',
          'biome_water_color_contribution parameter',
          'Visual effects configuration'
        ],
        contentIdeas: [
          '"Before/After: Vibrant Visuals"',
          '"Building with New Lighting"',
          '"Shader Comparison vs Vibrant Visuals"'
        ]
      }
    ];

    this.confirmedFeatures = [
      { name: 'Baby Mob Redesigns', category: 'Mobs', priority: 'high' },
      { name: 'Craftable Nametags', category: 'Crafting', priority: 'high' },
      { name: 'Golden Dandelion', category: 'Blocks', priority: 'medium' },
      { name: 'Vibrant Visuals System', category: 'Graphics', priority: 'high' }
    ];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- 2026 Timeline -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">📅 2026 Update Timeline</h3>
          <div class="space-y-3">
            ${this.updates.map((update, idx) => `
              <div class="bg-dark-700 rounded p-3 border-l-4 ${update.status === 'confirmed' ? 'border-accent-green' : update.status === 'rumored' ? 'border-accent-yellow' : 'border-accent-blue'}">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold">${update.name}</span>
                    <span class="text-xs px-2 py-0.5 rounded ${update.status === 'confirmed' ? 'bg-accent-green' : update.status === 'rumored' ? 'bg-accent-yellow' : 'bg-accent-blue'}">${update.status.toUpperCase()}</span>
                  </div>
                  <span class="text-sm text-gray-400">${update.date}</span>
                </div>
                
                <div class="mb-2">
                  <div class="text-xs text-gray-400 mb-1">Key Features:</div>
                  <ul class="text-sm text-gray-300 space-y-0.5">
                    ${update.features.map(f => `<li>• ${f}</li>`).join('')}
                  </ul>
                </div>
                
                <div class="bg-dark-800 rounded p-2">
                  <div class="text-xs text-gray-400 mb-1">🎬 Content Ideas:</div>
                  <div class="flex flex-wrap gap-1">
                    ${update.contentIdeas.map(idea => `<span class="text-xs px-2 py-0.5 bg-dark-600 rounded">${idea}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Confirmed Features Tracker -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">✅ Confirmed Features</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${this.confirmedFeatures.map(feature => `
              <div class="bg-dark-700 rounded p-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold">${feature.name}</div>
                  <div class="text-xs text-gray-400">${feature.category}</div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded ${feature.priority === 'high' ? 'bg-accent-red' : 'bg-accent-yellow'}">${feature.priority} priority</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Content Prep Checklist -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">✓ Content Prep Checklist</div>
          <div class="space-y-2">
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold mb-1">Before 26.1 Drops:</div>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>□ Prep world saves for baby mob showcase</li>
                <li>□ Research all 15 baby mob behaviors</li>
                <li>□ Build zoo/exhibit structures</li>
                <li>□ Script "All Baby Mobs" video outline</li>
              </ul>
            </div>
            
            <div class="bg-dark-700 rounded p-3">
              <div class="text-sm font-semibold mb-1">Before Minecraft Live:</div>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>□ Clear schedule for live event</li>
                <li>□ Set up recording for reactions</li>
                <li>□ Prep "Everything Announced" video template</li>
                <li>□ Research mob vote candidates</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Countdown -->
        <div class="card rounded-lg p-4 border-l-4 border-accent-green">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-400">Next Major Update</div>
              <div class="text-xl font-bold">26.1 First Drop</div>
              <div class="text-sm text-gray-400">Late March 2026</div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-accent-green">~30 days</div>
              <div class="text-xs text-gray-500">estimated</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Export to global
window.Minecraft2026Roadmap = Minecraft2026Roadmap;
