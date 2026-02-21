/**
 * Minecraft Content Ideas Generator 2026
 * Based on research: Packapop 45 ideas, viral formula (horror+memes+Minecraft),
 * 26.1 baby mobs, 26.2 Biomes & Botany rumors, craftable name tags
 */

class MinecraftContentIdeasGenerator {
  constructor() {
    this.categories = {
      survival: {
        name: 'Survival Challenge',
        icon: '⛏️',
        ideas: [
          { title: 'Minecraft but I can\'t touch the color red', viral: true },
          { title: 'Hardcore 100 Days in a Single Chunk', viral: true },
          { title: 'Surviving with Only One Heart', viral: false },
          { title: 'Minecraft but Gravity is Random', viral: true },
          { title: 'Beating Minecraft Upside Down', viral: false },
          { title: '100 Players vs 1 Hunter', viral: true },
          { title: 'Minecraft but I\'m Being Hunted', viral: false },
          { title: 'Surviving 100 Days in the Nether', viral: true }
        ]
      },
      building: {
        name: 'Building/Creative',
        icon: '🏗️',
        ideas: [
          { title: 'Building a Secret Base Under the Ocean', viral: true },
          { title: 'Recreating Famous Landmarks in Minecraft', viral: false },
          { title: 'Building the Perfect Survival House', viral: true },
          { title: 'Transforming a Village into a City', viral: true },
          { title: 'Building a Working Computer in Minecraft', viral: false },
          { title: '15+ Build Hacks You Need to Know', viral: true },
          { title: 'Building a Base in Every Biome', viral: false },
          { title: 'Modern House Tutorial with New 26.1 Blocks', viral: true }
        ]
      },
      horror: {
        name: 'Horror/Satire',
        icon: '👻',
        ideas: [
          { title: 'Minecraft but with Horror Movie Logic', viral: true },
          { title: 'Surviving the Backrooms in Minecraft', viral: true },
          { title: 'Minecraft Meme House at 3AM', viral: true },
          { title: 'The Caves Have Eyes (Horror Mod)', viral: false },
          { title: 'Minecraft but Every Sound is Cursed', viral: true },
          { title: 'Found Footage: Lost Minecraft World', viral: false },
          { title: 'The Pale Garden is Actually Haunted', viral: true },
          { title: 'Reacting to Scary Minecraft Seeds', viral: false }
        ]
      },
      mods: {
        name: 'Mods/Technical',
        icon: '⚙️',
        ideas: [
          { title: 'Beating Minecraft with ONLY Create Mod', viral: true },
          { title: 'I Added Every Mod to Minecraft', viral: true },
          { title: 'Minecraft but Everything is Random', viral: false },
          { title: 'Beating Minecraft with RTX Shaders', viral: false },
          { title: 'The BEST Mods for Minecraft 26.1', viral: true },
          { title: 'Minecraft but I\'m Tiny', viral: true },
          { title: 'I Downloaded the WORST Mods', viral: false },
          { title: 'Minecraft but It\'s Realistic Physics', viral: true }
        ]
      },
      baby_mobs: {
        name: '26.1 Baby Mobs',
        icon: '🐣',
        ideas: [
          { title: 'Every Baby Mob in Minecraft 26.1 Ranked', viral: true },
          { title: 'Building a Zoo for All Baby Mobs', viral: false },
          { title: 'Baby Mob Challenge: Can I Survive?', viral: true },
          { title: 'The Cutest Baby Mob in Minecraft', viral: false },
          { title: 'Collecting Every Baby Mob in Hardcore', viral: true },
          { title: 'Reacting to the New Baby Mob Models', viral: true },
          { title: 'Baby Mob Speedrun Any%', viral: false },
          { title: 'Building Homes for Every Baby Mob', viral: false }
        ]
      },
      updates: {
        name: '26.1/26.2 Updates',
        icon: '🆕',
        ideas: [
          { title: 'Everything New in Minecraft 26.1', viral: true },
          { title: 'Testing Craftable Name Tags', viral: true },
          { title: 'Golden Dandelion Farm Tutorial', viral: false },
          { title: 'Biomes & Botany: What We Know', viral: true },
          { title: '26.2 Leaks and Rumors Explained', viral: true },
          { title: 'Speedrunning the New Update', viral: false },
          { title: 'Building with New 26.1 Features', viral: false },
          { title: 'All Baby Mobs Compared: Old vs New', viral: true }
        ]
      }
    };
    
    this.currentCategory = 'survival';
    this.selectedIdeas = [];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="mc-content-generator">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-green">💡 Minecraft Content Ideas Generator 2026</h3>
            <p class="text-sm text-gray-400">Fresh video ideas based on 2026 trends and updates</p>
          </div>
          <div class="flex gap-2">
            <button onclick="mcGenerator.randomizeAll()" class="px-3 py-1 bg-accent-purple rounded text-sm hover:bg-purple-600">🎲 Randomize</button>
            <button onclick="mcGenerator.exportIdeas()" class="px-3 py-1 bg-accent-blue rounded text-sm hover:bg-blue-600">📋 Export</button>
          </div>
        </div>

        <!-- 2026 Trends Banner -->
        <div class="mb-4 p-3 bg-accent-green/10 border border-accent-green/30 rounded-lg">
          <div class="flex items-start gap-2">
            <span class="text-xl">🔥</span>
            <div>
              <div class="font-medium text-accent-green">2026 Viral Formula</div>
              <div class="text-sm text-gray-300">Horror satire + Minecraft + meme characters = sticky, rewatchable content (Packapop/Filmora 2026 research)</div>
            </div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-2 mb-4">
          ${Object.entries(this.categories).map(([key, cat]) => `
            <button onclick="mcGenerator.selectCategory('${key}')" 
                    class="cat-btn px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${this.currentCategory === key ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}"
                    data-category="${key}">
              <span>${cat.icon}</span>${cat.name}
            </button>
          `).join('')}
        </div>

        <!-- Ideas Grid -->
        <div id="ideas-grid" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${this.renderIdeas()}
        </div>

        <!-- Selected Ideas -->
        <div class="mt-6 card rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-400">📝 Selected Ideas (${this.selectedIdeas.length})</h4>
            <button onclick="mcGenerator.clearSelected()" class="text-xs text-red-400 hover:text-red-300">Clear</button>
          </div>
          <div id="selected-list" class="space-y-2">
            ${this.selectedIdeas.length === 0 ? '<div class="text-sm text-gray-500 italic">Click ideas above to select them</div>' : this.selectedIdeas.map(i => `
              <div class="flex items-center justify-between bg-dark-800 rounded p-2">
                <span class="text-sm">${i.title}</span>
                <button onclick="mcGenerator.removeSelected('${i.title}')" class="text-red-400">×</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2026 Update Info -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="text-sm font-semibold text-green-400 mb-2">🆕 Minecraft 26.1 (First Drop)</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• New textures/models for baby mobs</li>
              <li>• Golden dandelion added</li>
              <li>• Craftable name tags</li>
              <li>• Bug fixes and optimizations</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-blue-500">
            <h4 class="text-sm font-semibold text-blue-400 mb-2">🔮 26.2 Rumors (Spring Drop)</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• "Biomes & Botany" theme</li>
              <li>• Pale Garden expansion</li>
              <li>• New plant mechanics</li>
              <li>• Moobloom possibly returning</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderIdeas() {
    const category = this.categories[this.currentCategory];
    if (!category) return '';
    
    return category.ideas.map((idea, idx) => {
      const isSelected = this.selectedIdeas.some(i => i.title === idea.title);
      return `
        <div onclick="mcGenerator.toggleIdea(${idx})" 
             class="card rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-2 border-accent-green bg-accent-green/10' : 'hover:bg-dark-700'}">
          <div class="flex items-start gap-2">
            <span class="text-xl">${isSelected ? '✅' : '⭕'}</span>
            <div class="flex-1">
              <div class="font-medium text-sm">${idea.title}</div>
              <div class="flex items-center gap-2 mt-1">
                ${idea.viral ? '<span class="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">🔥 Viral Potential</span>' : ''}
                <span class="text-xs text-gray-500">${category.name}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  selectCategory(key) {
    this.currentCategory = key;
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
      const isActive = btn.dataset.category === key;
      btn.className = `cat-btn px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${isActive ? 'bg-accent-green text-white' : 'bg-dark-700 hover:bg-dark-600'}`;
    });
    
    document.getElementById('ideas-grid').innerHTML = this.renderIdeas();
  }

  toggleIdea(idx) {
    const category = this.categories[this.currentCategory];
    const idea = category.ideas[idx];
    
    const existingIdx = this.selectedIdeas.findIndex(i => i.title === idea.title);
    if (existingIdx >= 0) {
      this.selectedIdeas.splice(existingIdx, 1);
    } else {
      this.selectedIdeas.push({ ...idea, category: category.name });
    }
    
    this.refreshUI();
  }

  removeSelected(title) {
    this.selectedIdeas = this.selectedIdeas.filter(i => i.title !== title);
    this.refreshUI();
  }

  clearSelected() {
    this.selectedIdeas = [];
    this.refreshUI();
  }

  refreshUI() {
    document.getElementById('ideas-grid').innerHTML = this.renderIdeas();
    
    const selectedContainer = document.getElementById('selected-list');
    const header = selectedContainer.previousElementSibling.querySelector('h4');
    header.textContent = `📝 Selected Ideas (${this.selectedIdeas.length})`;
    
    selectedContainer.innerHTML = this.selectedIdeas.length === 0 
      ? '<div class="text-sm text-gray-500 italic">Click ideas above to select them</div>'
      : this.selectedIdeas.map(i => `
          <div class="flex items-center justify-between bg-dark-800 rounded p-2">
            <span class="text-sm">${i.title}</span>
            <button onclick="mcGenerator.removeSelected('${i.title}')" class="text-red-400">×</button>
          </div>
        `).join('');
  }

  randomizeAll() {
    // Pick 4 random ideas from different categories
    const allIdeas = Object.entries(this.categories).flatMap(([key, cat]) =
003e 
      cat.ideas.map(i => ({ ...i, category: cat.name }))
    );
    
    // Shuffle and pick 4
    const shuffled = allIdeas.sort(() => Math.random() - 0.5);
    this.selectedIdeas = shuffled.slice(0, 4);
    this.refreshUI();
  }

  exportIdeas() {
    if (this.selectedIdeas.length === 0) {
      alert('Select some ideas first!');
      return;
    }
    
    let text = "MINECRAFT CONTENT IDEAS 2026\n";
    text += "=".repeat(40) + "\n\n";
    
    this.selectedIdeas.forEach((idea, idx) => {
      text += `${idx + 1}. ${idea.title}\n`;
      text += `   Category: ${idea.category}\n`;
      text += `   Viral Potential: ${idea.viral ? 'High 🔥' : 'Medium'}\n\n`;
    });
    
    text += `\nGenerated: ${new Date().toLocaleDateString()}\n`;
    text += "Source: nox-dashboard Content Ideas Generator\n";
    
    navigator.clipboard.writeText(text).then(() => {
      alert(`${this.selectedIdeas.length} ideas copied to clipboard!`);
    });
  }
}

// Initialize global instance
window.MinecraftContentIdeasGenerator = MinecraftContentIdeasGenerator;
window.mcGenerator = new MinecraftContentIdeasGenerator();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mc-content-generator-container')) {
    window.mcGenerator.render('mc-content-generator-container');
  }
});
