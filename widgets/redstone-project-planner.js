/**
 * Redstone Project Planner
 * Based on 2026 research: Redstone mega builds rely on chunk mechanics and simulation distance
 * Challenge format trending with "30 Days" style content
 */

class RedstoneProjectPlanner {
  constructor() {
    this.components = [
      { name: 'Redstone Dust', icon: '⚡', category: 'basic', description: 'Transmits power up to 15 blocks' },
      { name: 'Redstone Torch', icon: '🔥', category: 'basic', description: 'Power source and inverter' },
      { name: 'Repeater', icon: '⏱️', category: 'timing', description: 'Delays signal and extends range' },
      { name: 'Comparator', icon: '📊', category: 'logic', description: 'Compares signal strengths' },
      { name: 'Piston', icon: '📦', category: 'mechanical', description: 'Pushes blocks when powered' },
      { name: 'Sticky Piston', icon: '🧲', category: 'mechanical', description: 'Pushes and pulls blocks' },
      { name: 'Observer', icon: '👁️', category: 'detection', description: 'Detects block updates' },
      { name: 'Hopper', icon: '⬇️', category: 'transport', description: 'Transfers items between containers' },
      { name: 'Dropper', icon: '📮', category: 'transport', description: 'Ejects items when powered' },
      { name: 'Dispenser', icon: '💨', category: 'transport', description: 'Uses items when powered' },
      { name: 'Note Block', icon: '🎵', category: 'creative', description: 'Produces sounds when powered' },
      { name: 'TNT', icon: '💣', category: 'creative', description: 'Explodes when powered' }
    ];
    
    this.projects = [
      { name: 'Auto Farm', difficulty: 'Easy', time: '2-3 hours', category: 'farming' },
      { name: 'Sorting System', difficulty: 'Medium', time: '4-6 hours', category: 'storage' },
      { name: 'Piston Door', difficulty: 'Easy', time: '1-2 hours', category: 'mechanics' },
      { name: 'Hidden Staircase', difficulty: 'Medium', time: '3-4 hours', category: 'mechanics' },
      { name: 'Item Elevator', difficulty: 'Medium', time: '2-3 hours', category: 'transport' },
      { name: 'TNT Cannon', difficulty: 'Hard', time: '4-5 hours', category: 'creative' },
      { name: 'Redstone Clock', difficulty: 'Easy', time: '30 min', category: 'timing' },
      { name: 'Combination Lock', difficulty: 'Hard', time: '5-7 hours', category: 'security' },
      { name: 'Auto Brewing', difficulty: 'Medium', time: '3-4 hours', category: 'farming' },
      { name: 'Minecart Station', difficulty: 'Medium', time: '3-5 hours', category: 'transport' }
    ];
    
    this.currentProject = null;
    this.inventory = [];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="redstone-planner-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-red-400">⚡ Redstone Project Planner</h3>
            <p class="text-sm text-gray-400">Plan your redstone mega builds with chunk optimization</p>
          </div>
          <div class="flex gap-2">
            <button onclick="redstonePlanner.exportProject()" class="px-3 py-1 bg-red-500 rounded text-sm hover:bg-red-600">📋 Export</button>
            <button onclick="redstonePlanner.reset()" class="px-3 py-1 bg-dark-700 rounded text-sm hover:bg-dark-600">Reset</button>
          </div>
        </div>

        <!-- Chunk Optimization Info -->
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div class="flex items-start gap-2">
            <span class="text-xl">🧩</span>
            <div>
              <div class="font-medium text-red-400">2026 Redstone Mega Build Tips</div>
              <div class="text-sm text-gray-300">Mega builds rely on chunk mechanics and simulation distance. Keep redstone within simulation distance (10 chunks default) for consistent operation.</div>
            </div>
          </div>
        </div>

        <!-- Project Templates -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-2">📁 Project Templates</h4>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
            ${this.projects.map((proj, idx) => `
              <button onclick="redstonePlanner.loadProject(${idx})" 
                      class="project-btn p-2 rounded bg-dark-700 hover:bg-dark-600 text-left text-sm ${this.currentProject?.name === proj.name ? 'ring-2 ring-red-400' : ''}"
                      data-project="${idx}">
                <div class="font-medium">${proj.name}</div>
                <div class="text-xs text-gray-400">${proj.difficulty} • ${proj.time}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Project Details -->
        <div id="project-details" class="card rounded-lg p-4 mb-4 ${this.currentProject ? '' : 'hidden'}">
          ${this.currentProject ? this.renderProjectDetails() : ''}
        </div>

        <!-- Component Library -->
        <div class="card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">🔧 Component Library</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${this.components.map((comp, idx) => `
              <div onclick="redstonePlanner.addToInventory(${idx})" 
                   class="bg-dark-700 rounded p-2 cursor-pointer hover:bg-dark-600">
                <div class="text-xl">${comp.icon}</div>
                <div class="text-sm font-medium">${comp.name}</div>
                <div class="text-xs text-gray-400">${comp.category}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Inventory -->
        <div class="mt-4 card rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-gray-400">🎒 Inventory (${this.inventory.length})</h4>
            <button onclick="redstonePlanner.clearInventory()" class="text-xs text-red-400">Clear</button>
          </div>
          <div id="inventory-list" class="flex flex-wrap gap-2">
            ${this.inventory.length === 0 
              ? '<div class="text-sm text-gray-500">Click components to add to inventory</div>'
              : this.inventory.map((item, idx) => `
                <span class="px-2 py-1 bg-dark-700 rounded text-sm flex items-center gap-1">
                  ${item.icon} ${item.name}
                  <button onclick="redstonePlanner.removeFromInventory(${idx})" class="text-red-400 ml-1">×</button>
                </span>
              `).join('')
            }
          </div>
        </div>

        <!-- Build Tips -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-yellow-500">
            <h4 class="text-sm font-semibold text-yellow-400 mb-2">⚠️ Common Mistakes</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Exceeding 15-block redstone signal limit</li>
              <li>• Forgetting to account for chunk loading</li>
              <li>• Not using repeaters for long distances</li>
              <li>• Overlooking update order issues</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="text-sm font-semibold text-green-400 mb-2">💡 Pro Tips</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Use observers for instant detection</li>
              <li>• Plan chunk boundaries with F3+G</li>
              <li>• Test components before full build</li>
              <li>• Document with screenshots</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderProjectDetails() {
    if (!this.currentProject) return '';
    return `
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-lg font-bold">${this.currentProject.name}</div>
          <div class="text-sm text-gray-400">${this.currentProject.difficulty} • ${this.currentProject.time}</div>
        </div>
        <span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">${this.currentProject.category}</span>
      </div>
      <input type="text" placeholder="Add notes..." 
             onchange="redstonePlanner.updateNotes(this.value)"
             class="w-full bg-dark-700 rounded px-3 py-2 text-sm">
    `;
  }

  loadProject(idx) {
    this.currentProject = this.projects[idx];
    this.refreshUI();
  }

  addToInventory(idx) {
    const comp = this.components[idx];
    this.inventory.push(comp);
    this.refreshInventory();
  }

  removeFromInventory(idx) {
    this.inventory.splice(idx, 1);
    this.refreshInventory();
  }

  clearInventory() {
    this.inventory = [];
    this.refreshInventory();
  }

  updateNotes(notes) {
    if (this.currentProject) {
      this.currentProject.notes = notes;
    }
  }

  refreshUI() {
    const details = document.getElementById('project-details');
    if (details) {
      details.innerHTML = this.renderProjectDetails();
      details.classList.toggle('hidden', !this.currentProject);
    }
    
    document.querySelectorAll('.project-btn').forEach((btn, idx) => {
      const isActive = this.currentProject?.name === this.projects[idx].name;
      btn.classList.toggle('ring-2', isActive);
      btn.classList.toggle('ring-red-400', isActive);
    });
  }

  refreshInventory() {
    const list = document.getElementById('inventory-list');
    const header = list.previousElementSibling.querySelector('h4');
    header.textContent = `🎒 Inventory (${this.inventory.length})`;
    
    list.innerHTML = this.inventory.length === 0
      ? '<div class="text-sm text-gray-500">Click components to add to inventory</div>'
      : this.inventory.map((item, idx) => `
          <span class="px-2 py-1 bg-dark-700 rounded text-sm flex items-center gap-1">
            ${item.icon} ${item.name}
            <button onclick="redstonePlanner.removeFromInventory(${idx})" class="text-red-400 ml-1">×</button>
          </span>
        `).join('');
  }

  exportProject() {
    if (!this.currentProject) {
      alert('Select a project first!');
      return;
    }
    
    let text = `REDSTONE PROJECT: ${this.currentProject.name}\n`;
    text += "=".repeat(40) + "\n\n";
    text += `Difficulty: ${this.currentProject.difficulty}\n`;
    text += `Est. Time: ${this.currentProject.time}\n`;
    text += `Category: ${this.currentProject.category}\n\n`;
    
    if (this.inventory.length > 0) {
      text += "Components:\n";
      this.inventory.forEach(item => {
        text += `- ${item.icon} ${item.name}\n`;
      });
    }
    
    if (this.currentProject.notes) {
      text += `\nNotes:\n${this.currentProject.notes}\n`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Project exported to clipboard!');
    });
  }

  reset() {
    this.currentProject = null;
    this.inventory = [];
    this.refreshUI();
    this.refreshInventory();
  }
}

// Initialize global instance
window.RedstoneProjectPlanner = RedstoneProjectPlanner;
window.redstonePlanner = new RedstoneProjectPlanner();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('redstone-planner-container')) {
    window.redstonePlanner.render('redstone-planner-container');
  }
});
