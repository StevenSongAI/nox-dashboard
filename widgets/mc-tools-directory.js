/**
 * Minecraft Creator Tools Directory
 * Based on 2026 research: Chunker (world conversion), Mojang Creator Tools (Bedrock),
 * OLC Bedrock Dev Helper (scripting), magus.gg (automation), Media AI Generator (content)
 */

class MinecraftCreatorToolsDirectory {
  constructor() {
    this.tools = [
      {
        id: 'chunker',
        name: 'Chunker',
        company: 'Hive Games',
        category: 'world',
        icon: '🌍',
        description: 'Free, open-source world conversion tool with UI and CLI versions',
        features: ['Java to Bedrock conversion', 'Bedrock to Java conversion', 'Command-line automation', 'Desktop app interface'],
        pricing: 'Free',
        license: 'Open Source',
        url: 'https://github.com/HiveGamesOSS/Chunker',
        tags: ['world conversion', 'cross-platform', 'automation']
      },
      {
        id: 'mctoolsoverview',
        name: 'Minecraft Creator Tools',
        company: 'Mojang/Microsoft',
        category: 'official',
        icon: '🛠️',
        description: 'Official tools for creating Bedrock Edition content and add-ons',
        features: ['TypeScript editing', 'JSON editing', '.mcworld export', '.mcproject export', 'In-game testing'],
        pricing: 'Free',
        license: 'Microsoft',
        url: 'https://github.com/Mojang/minecraft-creator-tools',
        tags: ['official', 'bedrock', 'add-ons']
      },
      {
        id: 'olc-bedrock',
        name: 'OLC Bedrock Dev Helper',
        company: 'OLC',
        category: 'scripting',
        icon: '📜',
        description: 'Scripting and modding automation support for Bedrock Edition',
        features: ['Script generation', 'Mod templates', 'API helpers', 'Debugging tools'],
        pricing: 'Free',
        license: 'Open Source',
        url: 'https://github.com/OLC',
        tags: ['scripting', 'automation', 'bedrock']
      },
      {
        id: 'magus',
        name: 'magus.gg',
        company: 'Magus',
        category: 'automation',
        icon: '⚡',
        description: 'Automation platform for Minecraft content workflows',
        features: ['Workflow automation', 'Build pipelines', 'Deployment tools', 'Integration APIs'],
        pricing: 'Freemium',
        license: 'Commercial',
        url: 'https://magus.gg',
        tags: ['automation', 'workflow', 'ci/cd']
      },
      {
        id: 'media-ai',
        name: 'Media AI Generator',
        company: 'Third-party',
        category: 'content',
        icon: '🎨',
        description: 'AI-powered multimedia content creation for Minecraft themes',
        features: ['Video generation', 'Music creation', 'Thumbnail design', 'Text-to-content'],
        pricing: 'Paid',
        license: 'Commercial',
        url: '#',
        tags: ['ai', 'content', 'multimedia']
      },
      {
        id: 'blockbench',
        name: 'Blockbench',
        company: 'JannisX11',
        category: 'modeling',
        icon: '📐',
        description: 'Free modern 3D model editor for low-poly and boxy models',
        features: ['Entity modeling', 'Block modeling', 'Texture mapping', 'Animation preview', 'Plugin support'],
        pricing: 'Free',
        license: 'Open Source',
        url: 'https://www.blockbench.net/',
        tags: ['3d modeling', 'textures', 'animations']
      },
      {
        id: 'amulet',
        name: 'Amulet Editor',
        company: 'Amulet Team',
        category: 'world',
        icon: '💎',
        description: 'World editor for Minecraft Java and Bedrock',
        features: ['NBT editing', 'Chunk editing', 'Biome editing', 'Import/export', 'Cross-platform'],
        pricing: 'Free',
        license: 'Open Source',
        url: 'https://www.amuletmc.com/',
        tags: ['world editing', 'nbt', 'cross-platform']
      },
      {
        id: 'worldpainter',
        name: 'WorldPainter',
        company: 'WorldPainter',
        category: 'world',
        icon: '🎨',
        description: 'Interactive map generator and terrain editor',
        features: ['Terrain painting', 'Biome painting', 'Custom brushes', 'Height mapping', 'Export to world'],
        pricing: 'Free / Donation',
        license: 'GPL',
        url: 'https://www.worldpainter.net/',
        tags: ['terrain', 'map generation', 'painting']
      }
    ];
    
    this.currentCategory = 'all';
    this.searchQuery = '';
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="mc-tools-directory">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-blue">🛠️ Minecraft Creator Tools Directory</h3>
            <p class="text-sm text-gray-400">Essential tools for Minecraft content creators and developers</p>
          </div>
          <div class="flex gap-2">
            <input type="text" id="tools-search" placeholder="🔍 Search tools..." 
                   class="px-3 py-1 bg-dark-700 rounded border border-dark-600 text-sm w-48"
                   oninput="mcToolsDirectory.search(this.value)">
          </div>
        </div>

        <!-- Category Filter -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button onclick="mcToolsDirectory.filterCategory('all')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'all' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="all">All</button>
          <button onclick="mcToolsDirectory.filterCategory('world')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'world' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="world">🌍 World</button>
          <button onclick="mcToolsDirectory.filterCategory('official')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'official' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="official">🛠️ Official</button>
          <button onclick="mcToolsDirectory.filterCategory('scripting')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'scripting' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="scripting">📜 Scripting</button>
          <button onclick="mcToolsDirectory.filterCategory('automation')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'automation' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="automation"
003e⚡ Automation</button>
          <button onclick="mcToolsDirectory.filterCategory('modeling')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'modeling' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="modeling">📐 Modeling</button>
          <button onclick="mcToolsDirectory.filterCategory('content')" 
                  class="cat-btn px-3 py-1 rounded text-sm ${this.currentCategory === 'content' ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                  data-category="content">🎨 Content</button>
        </div>

        <!-- Tools Grid -->
        <div id="tools-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.renderTools()}
        </div>

        <!-- Stats -->
        <div class="mt-6 card rounded-lg p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-accent-blue">${this.tools.length}</div>
              <div class="text-xs text-gray-400">Total Tools</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-accent-green">${this.tools.filter(t => t.pricing === 'Free').length}</div>
              <div class="text-xs text-gray-400">Free Tools</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-accent-purple">${this.tools.filter(t => t.license === 'Open Source').length}</div>
              <div class="text-xs text-gray-400">Open Source</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-400">${new Set(this.tools.map(t => t.category)).size}</div>
              <div class="text-xs text-gray-400">Categories</div>
            </div>
          </div>
        </div>

        <!-- 2026 Highlights -->
        <div class="mt-6 card rounded-lg p-4 border-l-4 border-green-500">
          <h4 class="text-sm font-semibold text-green-400 mb-2">🌟 2026 Creator Tool Highlights</h4>
          <ul class="text-sm text-gray-300 space-y-1">
            <li>• <strong>Chunker</strong> — Now the go-to for Java &harr; Bedrock world conversion</li>
            <li>• <strong>Mojang Creator Tools</strong> — Official TypeScript/JSON workflow for Bedrock add-ons</li>
            <li>• <strong>OLC Bedrock Dev Helper</strong> — Rising tool for scripting automation</li>
            <li>• <strong>AI Content Tools</strong> — Media AI Generator for Minecraft-themed multimedia</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderTools() {
    let filtered = this.tools;
    
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.currentCategory);
    }
    
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      return '<div class="col-span-full text-center py-8 text-gray-400">No tools found matching your criteria</div>';
    }

    return filtered.map(tool => `
      <div class="card rounded-lg p-4 hover:border-accent-blue transition-colors">
        <div class="flex items-start gap-3 mb-3">
          <span class="text-3xl">${tool.icon}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold">${tool.name}</h4>
              ${tool.pricing === 'Free' ? '<span class="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Free</span>' : ''}
            </div>
            <div class="text-xs text-gray-400">${tool.company}</div>
          </div>
        </div>
        
        <p class="text-sm text-gray-300 mb-3">${tool.description}</p>
        
        <div class="mb-3">
          <div class="text-xs text-gray-400 mb-1">Key Features:</div>
          <ul class="text-xs text-gray-300 space-y-0.5">
            ${tool.features.slice(0, 3).map(f => `<li>• ${f}</li>`).join('')}
          </ul>
        </div>
        
        <div class="flex flex-wrap gap-1 mb-3">
          ${tool.tags.map(tag => `
            <span class="text-xs px-2 py-0.5 bg-dark-700 rounded text-gray-400">${tag}</span>
          `).join('')}
        </div>
        
        <div class="flex items-center justify-between pt-3 border-t border-dark-700">
          <div class="text-xs text-gray-400">${tool.license}</div>
          <a href="${tool.url}" target="_blank" rel="noopener" 
             class="text-xs px-3 py-1 bg-accent-blue rounded hover:bg-blue-600 transition-colors">Visit →</a>
        </div>
      </div>
    `).join('');
  }

  filterCategory(category) {
    this.currentCategory = category;
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.className = `cat-btn px-3 py-1 rounded text-sm ${isActive ? 'bg-accent-blue text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    
    document.getElementById('tools-grid').innerHTML = this.renderTools();
  }

  search(query) {
    this.searchQuery = query;
    document.getElementById('tools-grid').innerHTML = this.renderTools();
  }
}

// Initialize global instance
window.MinecraftCreatorToolsDirectory = MinecraftCreatorToolsDirectory;
window.mcToolsDirectory = new MinecraftCreatorToolsDirectory();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mc-tools-directory-container')) {
    window.mcToolsDirectory.render('mc-tools-directory-container');
  }
});
