/**
 * Minecraft Architecture Style Guide
 * Based on 2026 research: Medieval architecture (depth, asymmetry, material combinations),
 * gabled roofs, block palettes for cohesive builds
 */

class MinecraftArchitectureGuide {
  constructor() {
    this.styles = {
      medieval: {
        name: 'Medieval',
        icon: '🏰',
        description: 'European-inspired with depth and asymmetry',
        keyFeatures: ['Gabled roofs', 'Stone foundations', 'Wooden beams', 'Asymmetrical design'],
        blocks: ['Cobblestone', 'Stone Bricks', 'Oak Logs', 'Oak Planks', 'Terracotta', 'Spruce Wood'],
        colors: ['#8B7355', '#A0A0A0', '#6B4423', '#D2691E', '#CD853F'],
        tips: ['Use depth in walls', 'Mix stone types', 'Add wooden supports', 'Create irregular shapes']
      },
      modern: {
        name: 'Modern',
        icon: '🏢',
        description: 'Clean lines and minimalist design',
        keyFeatures: ['Flat roofs', 'Large windows', 'White concrete', 'Geometric shapes'],
        blocks: ['White Concrete', 'Glass', 'Quartz', 'Black Concrete', 'Iron Bars', 'Light Gray Wool'],
        colors: ['#FFFFFF', '#C0C0C0', '#404040', '#87CEEB', '#F5F5F5'],
        tips: ['Keep lines clean', 'Use glass extensively', 'Contrast white with black', 'Minimal decoration']
      },
      rustic: {
        name: 'Rustic/Cottage',
        icon: '🏡',
        description: 'Cozy and natural with warm materials',
        keyFeatures: ['Thatched roofs', 'Natural materials', 'Cozy interiors', 'Gardens'],
        blocks: ['Oak Planks', 'Spruce Logs', 'Hay Bales', 'Cobblestone', 'Mossy Stone', 'Flowers'],
        colors: ['#8B4513', '#556B2F', '#DAA520', '#F4A460', '#228B22'],
        tips: ['Use warm colors', 'Add overgrown elements', 'Mix wood types', 'Create cozy nooks']
      },
      japanese: {
        name: 'Japanese',
        icon: '⛩️',
        description: 'Traditional Asian architecture with harmony',
        keyFeatures: ['Curved roofs', 'Cherry blossoms', 'Paper walls', 'Zen gardens'],
        blocks: ['Dark Oak', 'Spruce Planks', 'Pink Wool', 'White Wool', 'Bamboo', 'Stone'],
        colors: ['#8B0000', '#FFB6C1', '#2F4F4F', '#F5F5DC', '#8B4513'],
        tips: ['Use red and black accents', 'Create curved roof lines', 'Add water features', 'Use lanterns']
      },
      fantasy: {
        name: 'Fantasy/Elven',
        icon: '🧝',
        description: 'Magical and organic with nature integration',
        keyFeatures: ['Organic shapes', 'Nature integration', 'Glowing elements', 'Tall spires'],
        blocks: ['Mossy Stone', 'Glowstone', 'Leaves', 'White Terracotta', 'Prismarine', 'Warped Wood'],
        colors: ['#98FB98', '#9370DB', '#FFD700', '#20B2AA', '#87CEFA'],
        tips: ['Integrate with terrain', 'Use glowing blocks', 'Create flowing shapes', 'Add magical touches']
      },
      steampunk: {
        name: 'Steampunk',
        icon: '⚙️',
        description: 'Industrial Victorian with brass and copper',
        keyFeatures: ['Brass/copper accents', 'Gears and pipes', 'Industrial elements', 'Victorian base'],
        blocks: ['Copper Block', 'Orange Terracotta', 'Dark Oak', 'Iron Bars', 'Lanterns', 'Chains'],
        colors: ['#B87333', '#8B4513', '#CD853F', '#4A4A4A', '#FFD700'],
        tips: ['Use copper oxidation', 'Add industrial details', 'Mix wood and metal', 'Use warm lighting']
      }
    };
    
    this.palettes = [
      { name: 'Medieval Castle', blocks: ['Stone Bricks', 'Cobblestone', 'Oak Logs', 'Oak Planks', 'Terracotta'], theme: 'medieval' },
      { name: 'Modern Villa', blocks: ['White Concrete', 'Glass', 'Quartz', 'Black Concrete', 'Water'], theme: 'modern' },
      { name: 'Cozy Cottage', blocks: ['Oak Planks', 'Spruce Logs', 'Cobblestone', 'Hay Bales', 'Flowers'], theme: 'rustic' },
      { name: 'Japanese Temple', blocks: ['Dark Oak', 'Spruce Planks', 'Pink Wool', 'Stone', 'Bamboo'], theme: 'japanese' },
      { name: 'Elven Treehouse', blocks: ['Dark Oak', 'Leaves', 'Glowstone', 'Vines', 'Mossy Stone'], theme: 'fantasy' },
      { name: 'Desert Oasis', blocks: ['Sandstone', 'Terracotta', 'Oak Wood', 'Water', 'Palm Leaves'], theme: 'rustic' },
      { name: 'Winter Cabin', blocks: ['Spruce Planks', 'Snow', 'Cobblestone', 'Dark Oak', 'Glass'], theme: 'rustic' },
      { name: 'Underwater Base', blocks: ['Prismarine', 'Sea Lanterns', 'Glass', 'Coral', 'Sand'], theme: 'fantasy' }
    ];
    
    this.currentStyle = 'medieval';
    this.savedPalettes = [];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="architecture-guide-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-purple">🏛️ Minecraft Architecture Style Guide</h3>
            <p class="text-sm text-gray-400">Build stunning structures with proper techniques and palettes</p>
          </div>
          <div class="flex gap-2">
            <button onclick="archGuide.randomPalette()" class="px-3 py-1 bg-accent-purple rounded text-sm hover:bg-purple-600">🎲 Random</button>
          </div>
        </div>

        <!-- Style Selector -->
        <div class="mb-4">
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            ${Object.entries(this.styles).map(([key, style]) => `
              <button onclick="archGuide.selectStyle('${key}')" 
                      class="style-btn p-3 rounded-lg text-center transition-all ${this.currentStyle === key ? 'bg-accent-purple text-white ring-2 ring-accent-purple' : 'bg-dark-700 hover:bg-dark-600'}"
                      data-style="${key}">
                <div class="text-2xl mb-1">${style.icon}</div>
                <div class="text-xs font-medium">${style.name}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Style Details -->
        <div id="style-content" class="card rounded-lg p-4 mb-4">${this.renderStyleDetails()}</div>

        <!-- Pre-made Palettes -->
        <div class="card rounded-lg p-4 mb-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">🎨 Pre-made Block Palettes</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${this.palettes.map((palette, idx) => `
              <div onclick="archGuide.selectPalette(${idx})" 
                   class="palette-card bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 ${palette.theme === this.currentStyle ? 'ring-2 ring-accent-purple' : ''}">
                <div class="font-medium text-sm mb-2">${palette.name}</div>
                <div class="flex flex-wrap gap-1">
                  ${palette.blocks.slice(0, 3).map(() => `<span class="w-4 h-4 rounded bg-gray-500"></span>`).join('')}
                  ${palette.blocks.length > 3 ? `<span class="text-xs text-gray-400">+${palette.blocks.length - 3}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Building Tips -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-yellow-500">
            <h4 class="text-sm font-semibold text-yellow-400 mb-2">⚠️ Common Building Mistakes</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Flat walls without depth or texture</li>
              <li>• Using only one block type</li>
              <li>• Ignoring roof design</li>
              <li>• Symmetrical everything (unnatural)</li>
              <li>• No interior detail</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="text-sm font-semibold text-green-400 mb-2">💡 Pro Building Tips</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Add 1-block depth variation to walls</li>
              <li>• Use stair blocks for smooth curves</li>
              <li>• Mix 2-3 similar blocks for texture</li>
              <li>• Plan gardens/landscaping early</li>
              <li>• Interior matters as much as exterior</li>
            </ul>
          </div>
        </div>

        <!-- 2026 Trends -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-accent-purple">
          <h4 class="text-sm font-semibold text-accent-purple mb-2">🔮 2026 Building Trends</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• AI-powered block palette generators trending</li>
            <li>• Gabled roofs remain classic choice</li>
            <li>• White walls + dark wood highlights (medieval)</li>
            <li>• Cathedral and church builds popular</li>
            <li>• Emphasis on depth, asymmetry, realistic materials</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderStyleDetails() {
    const style = this.styles[this.currentStyle];
    return `
      <div class="flex items-center gap-3 mb-4">
        <span class="text-4xl">${style.icon}</span>
        <div>
          <h4 class="text-xl font-bold">${style.name} Architecture</h4>
          <div class="text-sm text-gray-400">${style.description}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 class="text-sm font-semibold text-gray-400 mb-2">🎯 Key Features</h5>
          <ul class="text-sm text-gray-300 space-y-1">
            ${style.keyFeatures.map(f => `<li>• ${f}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h5 class="text-sm font-semibold text-gray-400 mb-2">🧱 Recommended Blocks</h5>
          <div class="flex flex-wrap gap-1">
            ${style.blocks.map(b => `<span class="px-2 py-1 bg-dark-700 rounded text-xs">${b}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h5 class="text-sm font-semibold text-green-400 mb-2">💡 Style Tips</h5>
        <ul class="text-sm text-gray-300 space-y-1">
          ${style.tips.map(t => `<li>• ${t}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  selectStyle(key) {
    this.currentStyle = key;
    this.refreshUI();
  }

  selectPalette(idx) {
    const palette = this.palettes[idx];
    this.currentStyle = palette.theme;
    this.refreshUI();
    
    // Show palette details
    alert(`Palette: ${palette.name}\n\nBlocks: ${palette.blocks.join(', ')}`);
  }

  randomPalette() {
    const randomIdx = Math.floor(Math.random() * this.palettes.length);
    this.selectPalette(randomIdx);
  }

  refreshUI() {
    document.querySelectorAll('.style-btn').forEach(btn => {
      const isActive = btn.dataset.style === this.currentStyle;
      btn.className = `style-btn p-3 rounded-lg text-center transition-all ${isActive ? 'bg-accent-purple text-white ring-2 ring-accent-purple' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    
    document.getElementById('style-content').innerHTML = this.renderStyleDetails();
    
    // Update palette highlights
    document.querySelectorAll('.palette-card').forEach((card, idx) => {
      const palette = this.palettes[idx];
      card.classList.toggle('ring-2', palette.theme === this.currentStyle);
      card.classList.toggle('ring-accent-purple', palette.theme === this.currentStyle);
    });
  }
}

// Initialize global instance
window.MinecraftArchitectureGuide = MinecraftArchitectureGuide;
window.archGuide = new MinecraftArchitectureGuide();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('architecture-guide-container')) {
    window.archGuide.render('architecture-guide-container');
  }
});
