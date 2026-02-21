/**
 * BBS Mod Content Planner
 * Based on research: BBS (Blockbuster Studio) mod for Minecraft cinematic content
 * Features: Blockbench support, keyframe editing, clip-based camera, BBS Reforge for 1.21.1
 */

class BBSContentPlanner {
  constructor() {
    this.scenes = [];
    this.currentScene = null;
    this.shotTypes = [
      { id: 'establishing', name: 'Establishing Shot', icon: '🏞️', description: 'Wide shot to set the scene location' },
      { id: 'closeup', name: 'Close-Up', icon: '👤', description: 'Focus on character face/emotion' },
      { id: 'wide', name: 'Wide Shot', icon: '🎬', description: 'Full character in environment' },
      { id: 'medium', name: 'Medium Shot', icon: '🚶', description: 'Character from waist up' },
      { id: 'overhead', name: 'Overhead', icon: '🦅', description: 'Bird\'s eye view of action' },
      { id: 'pov', name: 'POV Shot', icon: '👁️', description: 'Point of view from character' },
      { id: 'tracking', name: 'Tracking Shot', icon: '🏃', description: 'Camera follows movement' },
      { id: 'static', name: 'Static Shot', icon: '📷', description: 'Fixed camera position' }
    ];
    
    this.cameraMoves = [
      { id: 'pan', name: 'Pan', description: 'Horizontal rotation' },
      { id: 'tilt', name: 'Tilt', description: 'Vertical rotation' },
      { id: 'dolly', name: 'Dolly', description: 'Move camera forward/back' },
      { id: 'truck', name: 'Truck', description: 'Move camera left/right' },
      { id: 'crane', name: 'Crane', description: 'Vertical boom movement' },
      { id: 'orbit', name: 'Orbit', description: 'Circle around subject' }
    ];
    
    this.loadTemplate();
  }

  loadTemplate() {
    // Default template with 3 scenes
    this.scenes = [
      {
        id: 1,
        title: 'Opening - Establish World',
        duration: 10,
        shots: [
          { type: 'establishing', duration: 5, camera: 'pan', notes: 'Wide landscape establishing shot' },
          { type: 'wide', duration: 5, camera: 'static', notes: 'Character enters frame' }
        ],
        blockbenchModels: [],
        keyframeActions: []
      },
      {
        id: 2,
        title: 'Build-Up - Character Moment',
        duration: 15,
        shots: [
          { type: 'medium', duration: 8, camera: 'dolly', notes: 'Push in on character' },
          { type: 'closeup', duration: 7, camera: 'static', notes: 'Emotional reaction' }
        ],
        blockbenchModels: [],
        keyframeActions: []
      },
      {
        id: 3,
        title: 'Climax - Action Sequence',
        duration: 20,
        shots: [
          { type: 'tracking', duration: 10, camera: 'truck', notes: 'Follow running character' },
          { type: 'overhead', duration: 5, camera: 'orbit', notes: 'Reveal scale of scene' },
          { type: 'wide', duration: 5, camera: 'crane', description: 'Dramatic pull back' }
        ],
        blockbenchModels: [],
        keyframeActions: []
      }
    ];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="bbs-planner-container">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h3 class="text-lg font-semibold text-accent-purple">🎬 BBS Mod Content Planner</h3>
            <p class="text-sm text-gray-400">Plan cinematic sequences with Blockbuster Studio mod</p>
          </div>
          <div class="flex gap-2">
            <button onclick="bbsPlanner.exportScript()" class="px-3 py-1 bg-accent-green rounded text-sm hover:bg-green-600">📋 Export Script</button>
            <button onclick="bbsPlanner.reset()" class="px-3 py-1 bg-dark-700 rounded text-sm hover:bg-dark-600">Reset</button>
          </div>
        </div>

        <!-- BBS Info Banner -->
        <div class="mb-4 p-3 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
          <div class="flex items-start gap-2">
            <span class="text-xl">🎥</span>
            <div>
              <div class="font-medium text-accent-purple">Blockbuster Studio Mod Features</div>
              <div class="text-sm text-gray-300">Blockbench model support • Keyframe replay editor • Clip-based camera • BBS Reforge for 1.21.1</div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-accent-blue" id="total-scenes">${this.scenes.length}</div>
            <div class="text-xs text-gray-400">Scenes</div>
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-accent-green" id="total-duration">${this.getTotalDuration()}s</div>
            <div class="text-xs text-gray-400">Duration</div>
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-accent-purple" id="total-shots">${this.getTotalShots()}</div>
            <div class="text-xs text-gray-400">Shots</div>
          </div>
          <div class="bg-dark-800 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-yellow-400" id="est-time">${this.getEstTime()}</div>
            <div class="text-xs text-gray-400">Est. Edit Time</div>
          </div>
        </div>

        <!-- Scenes -->
        <div id="scenes-container" class="space-y-4">
          ${this.scenes.map((scene, idx) => this.renderScene(scene, idx)).join('')}
        </div>

        <!-- Add Scene Button -->
        <button onclick="bbsPlanner.addScene()" class="mt-4 w-full py-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors">
          + Add Scene
        </button>

        <!-- Shot Library -->
        <div class="mt-6 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">🎬 Shot Type Library</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${this.shotTypes.map(shot => `
              <div class="bg-dark-800 rounded p-2 text-center cursor-pointer hover:bg-dark-700"
                       onclick="bbsPlanner.addShotToCurrent('${shot.id}')">
                <div class="text-xl mb-1">${shot.icon}</div>
                <div class="text-xs font-medium">${shot.name}</div>
                <div class="text-xs text-gray-500">${shot.description}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Camera Moves -->
        <div class="mt-4 card rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-3">📹 Camera Movements</h4>
          <div class="flex flex-wrap gap-2">
            ${this.cameraMoves.map(move => `
              <div class="px-3 py-1 bg-dark-800 rounded text-sm">
                <span class="font-medium">${move.name}</span>
                <span class="text-gray-500 ml-1">— ${move.description}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- BBS Tips -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="text-sm font-semibold text-green-400 mb-2">✅ BBS Best Practices</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• Import Blockbench models for custom characters</li>
              <li>• Use keyframes for smooth camera movements</li>
              <li>• Record player actions then edit timing</li>
              <li>• Combine multiple clips for complex sequences</li>
            </ul>
          </div>
          
          <div class="card rounded-lg p-4 border-l-4 border-blue-500">
            <h4 class="text-sm font-semibold text-blue-400 mb-2">🔗 Resources</h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• <a href="https://www.curseforge.com/minecraft/mc-mods/bbs-mod" target="_blank" class="text-accent-blue hover:underline">BBS Mod on CurseForge</a></li>
              <li>• <a href="https://modrinth.com/modpack/bbs-movie-studio" target="_blank" class="text-accent-blue hover:underline">BBS Movie Studio Modpack</a></li>
              <li>• <a href="https://www.curseforge.com/minecraft/mc-mods/bbsreforge" target="_blank" class="text-accent-blue hover:underline">BBS Reforge (1.21.1)</a></li>
              <li>• Blockbench for model creation</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderScene(scene, idx) {
    const shotTypesMap = Object.fromEntries(this.shotTypes.map(s => [s.id, s]));
    
    return `
      <div class="card rounded-lg p-4" data-scene-id="${scene.id}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold text-accent-purple">${idx + 1}</span>
            <input type="text" value="${scene.title}" 
                   onchange="bbsPlanner.updateSceneTitle(${scene.id}, this.value)"
                   class="bg-dark-700 rounded px-3 py-1 text-sm w-64">
          </div>
          <button onclick="bbsPlanner.deleteScene(${scene.id})" class="text-red-400 hover:text-red-300">🗑️</button>
        </div>

        <!-- Shots -->
        <div class="space-y-2 mb-3">
          ${scene.shots.map((shot, shotIdx) => {
            const shotType = shotTypesMap[shot.type] || { name: shot.type, icon: '🎬' };
            return `
              <div class="flex items-center gap-2 bg-dark-800 rounded p-2">
                <span>${shotType.icon}</span>
                <span class="text-sm font-medium w-24">${shotType.name}</span>
                <input type="number" value="${shot.duration}" min="1" max="60"
                       onchange="bbsPlanner.updateShotDuration(${scene.id}, ${shotIdx}, this.value)"
                       class="bg-dark-700 rounded px-2 py-1 text-sm w-16 text-center">
                <span class="text-xs text-gray-400">s</span>
                <select onchange="bbsPlanner.updateShotCamera(${scene.id}, ${shotIdx}, this.value)"
                        class="bg-dark-700 rounded px-2 py-1 text-sm">
                  ${this.cameraMoves.map(m => `
                    <option value="${m.id}" ${shot.camera === m.id ? 'selected' : ''}>${m.name}</option>
                  `).join('')}
                </select>
                <input type="text" value="${shot.notes || ''}" placeholder="Notes..."
                       onchange="bbsPlanner.updateShotNotes(${scene.id}, ${shotIdx}, this.value)"
                       class="flex-1 bg-dark-700 rounded px-2 py-1 text-sm">
                <button onclick="bbsPlanner.deleteShot(${scene.id}, ${shotIdx})" class="text-red-400 hover:text-red-300">×</button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Add Shot Button -->
        <button onclick="bbsPlanner.addShot(${scene.id})" class="text-sm text-accent-blue hover:text-blue-400">
          + Add Shot
        </button>
      </div>
    `;
  }

  getTotalDuration() {
    return this.scenes.reduce((total, scene) => {
      return total + scene.shots.reduce((sum, shot) => sum + (parseInt(shot.duration) || 0), 0);
    }, 0);
  }

  getTotalShots() {
    return this.scenes.reduce((total, scene) => total + scene.shots.length, 0);
  }

  getEstTime() {
    const minutes = Math.ceil(this.getTotalDuration() / 60 * 3); // 3x recording time for editing
    return `${minutes}m`;
  }

  updateStats() {
    document.getElementById('total-scenes').textContent = this.scenes.length;
    document.getElementById('total-duration').textContent = this.getTotalDuration() + 's';
    document.getElementById('total-shots').textContent = this.getTotalShots();
    document.getElementById('est-time').textContent = this.getEstTime();
  }

  addScene() {
    const newId = Math.max(...this.scenes.map(s => s.id), 0) + 1;
    this.scenes.push({
      id: newId,
      title: `Scene ${newId}`,
      duration: 10,
      shots: [
        { type: 'wide', duration: 10, camera: 'static', notes: '' }
      ],
      blockbenchModels: [],
      keyframeActions: []
    });
    this.refreshScenes();
  }

  deleteScene(id) {
    this.scenes = this.scenes.filter(s => s.id !== id);
    this.refreshScenes();
  }

  updateSceneTitle(id, title) {
    const scene = this.scenes.find(s => s.id === id);
    if (scene) scene.title = title;
  }

  addShot(sceneId) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene) {
      scene.shots.push({ type: 'medium', duration: 5, camera: 'static', notes: '' });
      this.refreshScenes();
    }
  }

  addShotToCurrent(shotTypeId) {
    // Add to last scene or create new
    if (this.scenes.length === 0) {
      this.addScene();
    }
    const scene = this.scenes[this.scenes.length - 1];
    scene.shots.push({ type: shotTypeId, duration: 5, camera: 'static', notes: '' });
    this.refreshScenes();
  }

  deleteShot(sceneId, shotIdx) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene && scene.shots[shotIdx]) {
      scene.shots.splice(shotIdx, 1);
      this.refreshScenes();
    }
  }

  updateShotDuration(sceneId, shotIdx, duration) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene && scene.shots[shotIdx]) {
      scene.shots[shotIdx].duration = parseInt(duration) || 1;
      this.updateStats();
    }
  }

  updateShotCamera(sceneId, shotIdx, camera) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene && scene.shots[shotIdx]) {
      scene.shots[shotIdx].camera = camera;
    }
  }

  updateShotNotes(sceneId, shotIdx, notes) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene && scene.shots[shotIdx]) {
      scene.shots[shotIdx].notes = notes;
    }
  }

  refreshScenes() {
    const container = document.getElementById('scenes-container');
    if (container) {
      container.innerHTML = this.scenes.map((scene, idx) => this.renderScene(scene, idx)).join('');
      this.updateStats();
    }
  }

  exportScript() {
    let script = "BBS MOD CINEMATIC SCRIPT\n";
    script += "=" .repeat(40) + "\n\n";
    
    this.scenes.forEach((scene, idx) => {
      script += `SCENE ${idx + 1}: ${scene.title}\n`;
      script += `-`.repeat(30) + "\n";
      
      scene.shots.forEach((shot, sIdx) => {
        const shotType = this.shotTypes.find(s => s.id === shot.type) || { name: shot.type };
        script += `${sIdx + 1}. ${shotType.name} (${shot.duration}s) - ${shot.camera}\n`;
        if (shot.notes) script += `   Note: ${shot.notes}\n`;
      });
      script += "\n";
    });
    
    script += `\nTotal Duration: ${this.getTotalDuration()} seconds\n`;
    script += `Total Shots: ${this.getTotalShots()}\n`;
    script += `Est. Edit Time: ${this.getEstTime()}\n`;
    
    navigator.clipboard.writeText(script).then(() => {
      alert('Script copied to clipboard!');
    });
  }

  reset() {
    if (confirm('Reset to default template?')) {
      this.loadTemplate();
      this.refreshScenes();
    }
  }
}

// Initialize global instance
window.BBSContentPlanner = BBSContentPlanner;
window.bbsPlanner = new BBSContentPlanner();

// Auto-load if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bbs-planner-container')) {
    window.bbsPlanner.render('bbs-planner-container');
  }
});
