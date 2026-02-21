/**
 * BBS Cinematic Toolkit Widget
 * Professional filming tools for Blockbuster Studio (BBS) mod content creators
 * Research: BBS Reforge adds dynamic lighting, Blockbench model import workflow
 */

(function() {
  const widget = document.createElement('div');
  widget.className = 'widget bbs-cinematic-toolkit';
  widget.innerHTML = `
    <style>
      .bbs-cinematic-toolkit { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 20px; color: #fff; }
      .bbs-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .bbs-header h3 { margin: 0; font-size: 1.3em; color: #ffd700; }
      .bbs-badge { background: #ff6b6b; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 0.7em; font-weight: bold; }
      .bbs-tabs { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
      .bbs-tab { background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
      .bbs-tab:hover, .bbs-tab.active { background: #ffd700; color: #1a1a2e; }
      .bbs-content { display: none; }
      .bbs-content.active { display: block; animation: fadeIn 0.3s; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .shot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px; }
      .shot-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
      .shot-card:hover { background: rgba(255,215,0,0.1); border-color: #ffd700; transform: translateY(-2px); }
      .shot-card.selected { background: rgba(255,215,0,0.2); border-color: #ffd700; }
      .shot-icon { font-size: 1.5em; margin-bottom: 5px; }
      .shot-name { font-weight: bold; font-size: 0.9em; color: #fff; }
      .shot-desc { font-size: 0.75em; color: #aaa; margin-top: 3px; }
      .tool-section { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 15px; margin-bottom: 12px; }
      .tool-section h4 { margin: 0 0 10px 0; color: #4ecdc4; font-size: 0.95em; }
      .speed-slider { width: 100%; margin: 10px 0; }
      .speed-display { text-align: center; font-size: 1.2em; color: #ffd700; font-weight: bold; }
      .speed-labels { display: flex; justify-content: space-between; font-size: 0.7em; color: #888; }
      .checklist { list-style: none; padding: 0; margin: 0; }
      .checklist li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
      .checklist li:hover { background: rgba(255,255,255,0.03); }
      .checklist li.checked { opacity: 0.5; }
      .checklist li.checked span { text-decoration: line-through; }
      .checkbox { width: 18px; height: 18px; border: 2px solid #4ecdc4; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; }
      .checklist li.checked .checkbox { background: #4ecdc4; color: #1a1a2e; }
      .workflow-step { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
      .step-num { background: #ffd700; color: #1a1a2e; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85em; flex-shrink: 0; }
      .step-content { flex: 1; }
      .step-title { font-weight: bold; color: #fff; margin-bottom: 3px; }
      .step-desc { font-size: 0.85em; color: #aaa; line-height: 1.4; }
      .lighting-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .lighting-card { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; text-align: center; }
      .lighting-name { font-size: 0.85em; font-weight: bold; color: #ffd700; }
      .lighting-desc { font-size: 0.75em; color: #aaa; margin-top: 4px; }
      .scene-planner { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .planner-field { display: flex; flex-direction: column; gap: 4px; }
      .planner-field label { font-size: 0.75em; color: #888; text-transform: uppercase; }
      .planner-field input, .planner-field textarea { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 6px 8px; color: #fff; font-size: 0.85em; }
      .planner-field input:focus, .planner-field textarea:focus { outline: none; border-color: #ffd700; }
      .scene-actions { display: flex; gap: 8px; margin-top: 10px; }
      .btn { background: #4ecdc4; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85em; transition: all 0.2s; }
      .btn:hover { background: #3dbdb4; transform: translateY(-1px); }
      .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }
      .btn-secondary:hover { background: rgba(255,255,255,0.2); }
      .scenes-list { margin-top: 15px; max-height: 200px; overflow-y: auto; }
      .scene-item { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
      .scene-info { flex: 1; }
      .scene-title { font-weight: bold; color: #fff; font-size: 0.9em; }
      .scene-meta { font-size: 0.75em; color: #888; }
      .scene-delete { background: #ff6b6b; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75em; }
      .crowd-spanner-tip { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 12px; margin-top: 15px; }
      .crowd-spanner-tip h4 { margin: 0 0 8px 0; color: #fff; font-size: 0.9em; }
      .crowd-spanner-tip p { margin: 0; font-size: 0.8em; color: rgba(255,255,255,0.9); line-height: 1.4; }
      .tip-code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #ffd700; }
    </style>
    
    <div class="bbs-header">
      <span style="font-size: 1.5em;">🎬</span>
      <div>
        <h3>BBS Cinematic Toolkit</h3>
        <span style="font-size: 0.8em; color: #888;">Professional filming for Blockbuster Studio</span>
      </div>
      <span class="bbs-badge">BBS v3.0+</span>
    </div>
    
    <div class="bbs-tabs">
      <button class="bbs-tab active" data-tab="shots">Shot Types</button>
      <button class="bbs-tab" data-tab="camera">Camera</button>
      <button class="bbs-tab" data-tab="lighting">Lighting</button>
      <button class="bbs-tab" data-tab="workflow">Workflow</button>
      <button class="bbs-tab" data-tab="planner">Scene Planner</button>
      <button class="bbs-tab" data-tab="checklist">Checklist</button>
    </div>
    
    <div class="bbs-content active" id="shots-tab">
      <div class="shot-grid">
        <div class="shot-card" data-shot="static">
          <div class="shot-icon">📷</div>
          <div class="shot-name">Static</div>
          <div class="shot-desc">Fixed position, no movement</div>
        </div>
        <div class="shot-card" data-shot="pan">
          <div class="shot-icon">↔️</div>
          <div class="shot-name">Pan</div>
          <div class="shot-desc">Horizontal rotation</div>
        </div>
        <div class="shot-card" data-shot="tilt">
          <div class="shot-icon">↕️</div>
          <div class="shot-name">Tilt</div>
          <div class="shot-desc">Vertical rotation</div>
        </div>
        <div class="shot-card" data-shot="dolly">
          <div class="shot-icon">🎥</div>
          <div class="shot-name">Dolly</div>
          <div class="shot-desc">Camera moves in/out</div>
        </div>
        <div class="shot-card" data-shot="truck">
          <div class="shot-icon">⬅️➡️</div>
          <div class="shot-name">Truck</div>
          <div class="shot-desc">Moves left/right</div>
        </div>
        <div class="shot-card" data-shot="crane">
          <div class="shot-icon">🏗️</div>
          <div class="shot-name">Crane</div>
          <div class="shot-desc">Vertical boom movement</div>
        </div>
        <div class="shot-card" data-shot="orbit">
          <div class="shot-icon">🔄</div>
          <div class="shot-name">Orbit</div>
          <div class="shot-desc">Circle around subject</div>
        </div>
        <div class="shot-card" data-shot="handheld">
          <div class="shot-icon">📹</div>
          <div class="shot-name">Handheld</div>
          <div class="shot-desc">Slight random shake</div>
        </div>
      </div>
      <div class="tool-section">
        <h4>💡 Pro Tip</h4>
        <p style="font-size: 0.85em; color: #aaa; margin: 0;">Combine shots for dynamic sequences: Start with a <strong>dolly in</strong>, then <strong>orbit</strong> around the subject, finish with a slow <strong>crane up</strong>.</p>
      </div>
    </div>
    
    <div class="bbs-content" id="camera-tab">
      <div class="tool-section">
        <h4>🎚️ Camera Speed Calculator</h4>
        <p style="font-size: 0.8em; color: #888; margin-bottom: 10px;">Adjust for dramatic or subtle movement</p>
        <input type="range" class="speed-slider" id="cameraSpeed" min="1" max="100" value="50">
        <div class="speed-display" id="speedValue">50% — Cinematic</div>
        <div class="speed-labels">
          <span>Slow-Mo</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>
      <div class="tool-section">
        <h4>📐 Field of View Guide</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.8em;">
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
            <div style="color: #ffd700; font-weight: bold;">30°</div>
            <div style="color: #888;">Telephoto</div>
            <div style="font-size: 0.75em;">Tight, compressed</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(78,205,196,0.2); border-radius: 4px; border: 1px solid #4ecdc4;">
            <div style="color: #4ecdc4; font-weight: bold;">60°</div>
            <div style="color: #fff;">Standard</div>
            <div style="font-size: 0.75em;">Natural view</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
            <div style="color: #ffd700; font-weight: bold;">90°+</div>
            <div style="color: #888;">Wide</div>
            <div style="font-size: 0.75em;">Expansive, dramatic</div>
          </div>
        </div>
      </div>
      <div class="tool-section">
        <h4>⏱️ Recording Duration</h4>
        <p style="font-size: 0.8em; color: #aaa; margin: 0;">BBS records player actions in real-time. Plan your scene timing:</p>
        <ul style="font-size: 0.8em; color: #888; margin: 8px 0 0 0; padding-left: 18px;">
          <li>Short clips: 5-15 seconds (B-roll)</li>
          <li>Dialogue scenes: 30-60 seconds</li>
          <li>Action sequences: 10-30 seconds</li>
          <li>Timelapse: 2-5 minutes real-time</li>
        </ul>
      </div>
    </div>
    
    <div class="bbs-content" id="lighting-tab">
      <div class="tool-section">
        <h4>💡 BBS Reforge Dynamic Lighting</h4>
        <p style="font-size: 0.8em; color: #888; margin-bottom: 10px;">Real-time light rendering for cinematic quality</p>
        <div class="lighting-grid">
          <div class="lighting-card">
            <div class="lighting-name">🔥 Torch</div>
            <div class="lighting-desc">Warm orange, flickering</div>
          </div>
          <div class="lighting-card">
            <div class="lighting-name">💎 Glowstone</div>
            <div class="lighting-desc">Bright white, steady</div>
          </div>
          <div class="lighting-card">
            <div class="lighting-name">🌊 Sea Lantern</div>
            <div class="lighting-desc">Cool cyan, subtle pulse</div>
          </div>
          <div class="lighting-card">
            <div class="lighting-name">🕯️ Redstone</div>
            <div class="lighting-desc">Red glow, warning tone</div>
          </div>
        </div>
      </div>
      <div class="tool-section">
        <h4>🎨 Lighting Setups</h4>
        <div style="font-size: 0.85em; color: #aaa; line-height: 1.6;">
          <p><strong style="color: #4ecdc4;">Three-Point Lighting:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li><strong>Key Light:</strong> Main illumination, 45° angle</li>
            <li><strong>Fill Light:</strong> Softens shadows, opposite key</li>
            <li><strong>Rim Light:</strong> Separates subject from background</li>
          </ul>
          <p style="margin-top: 10px;"><strong style="color: #ffd700;">Mood Lighting:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Horror: Low key, harsh shadows, red accents</li>
            <li>Drama: High contrast, single strong source</li>
            <li>Comedy: Bright, even lighting everywhere</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="bbs-content" id="workflow-tab">
      <div class="tool-section">
        <h4>📥 Blockbench → BBS Workflow</h4>
        <div class="workflow-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Model in Blockbench</div>
            <div class="step-desc">Create or import model. Use <strong>File → Export → Export Bedrock Geometry</strong></div>
          </div>
        </div>
        <div class="workflow-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Place in BBS Models Folder</div>
            <div class="step-desc">Put .json geometry and texture in <code style="background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 3px;">.minecraft/bbs/models/</code></div>
          </div>
        </div>
        <div class="workflow-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Spawn in Game</div>
            <div class="step-desc">Use <code style="background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 3px;">/bbs model spawn</code> or Director block</div>
          </div>
        </div>
        <div class="workflow-step">
          <div class="step-num">4</div>
          <div class="step-content">
            <div class="step-title">Animate & Record</div>
            <div class="step-desc">Use Director block to create animation paths, then record with camera</div>
          </div>
        </div>
      </div>
      <div class="crowd-spanner-tip">
        <h4>⚡ Crowd Spawner Integration</h4>
        <p>Use the <strong>BBS Crowd Spawner Mod</strong> to quickly populate scenes with NPC crowds. Perfect for battle sequences, market scenes, or background characters.</p>
        <p style="margin-top: 8px;">Example: <span class="tip-code">/crowd spawn 20 "villager" 10</span></p>
      </div>
    </div>
    
    <div class="bbs-content" id="planner-tab">
      <div class="scene-planner">
        <div class="planner-field" style="grid-column: 1 / -1;">
          <label>Scene Title</label>
          <input type="text" id="sceneTitle" placeholder="e.g., Village Attack Opening">
        </div>
        <div class="planner-field">
          <label>Shot Type</label>
          <select id="sceneShot" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 6px 8px; color: #fff; font-size: 0.85em;">
            <option value="static">Static</option>
            <option value="pan">Pan</option>
            <option value="tilt">Tilt</option>
            <option value="dolly">Dolly</option>
            <option value="truck">Truck</option>
            <option value="crane">Crane</option>
            <option value="orbit">Orbit</option>
            <option value="handheld">Handheld</option>
          </select>
        </div>
        <div class="planner-field">
          <label>Duration (sec)</label>
          <input type="number" id="sceneDuration" placeholder="15" min="1" max="300">
        </div>
        <div class="planner-field" style="grid-column: 1 / -1;">
          <label>Notes / Action</label>
          <textarea id="sceneNotes" rows="2" placeholder="What happens in this scene?"></textarea>
        </div>
      </div>
      <div class="scene-actions">
        <button class="btn" id="addScene">➕ Add Scene</button>
        <button class="btn btn-secondary" id="clearPlanner">Clear</button>
      </div>
      <div class="scenes-list" id="scenesList"></div>
    </div>
    
    <div class="bbs-content" id="checklist-tab">
      <div class="tool-section">
        <h4>✅ Pre-Recording Checklist</h4>
        <ul class="checklist" id="preChecklist">
          <li data-checked="false"><div class="checkbox"></div><span>Set up camera position and angle</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Verify lighting is adequate</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Clear unwanted entities from frame</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Position actors/models</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Test camera path (if animated)</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Set time of day (/time set)</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Disable UI (F1)</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Enable smooth camera</span></li>
        </ul>
      </div>
      <div class="tool-section">
        <h4>🎬 Recording Checklist</h4>
        <ul class="checklist" id="recordingChecklist">
          <li data-checked="false"><div class="checkbox"></div><span>Start camera recording</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Wait 2s before action (lead-in)</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Execute planned action</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Wait 2s after action (lead-out)</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Stop recording</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Review playback</span></li>
          <li data-checked="false"><div class="checkbox"></div><span>Export clip</span></li>
        </ul>
      </div>
    </div>
  `;
  
  // Tab switching
  widget.querySelectorAll('.bbs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      widget.querySelectorAll('.bbs-tab').forEach(t => t.classList.remove('active'));
      widget.querySelectorAll('.bbs-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      widget.querySelector(`#${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Shot selection
  widget.querySelectorAll('.shot-card').forEach(card => {
    card.addEventListener('click', () => {
      widget.querySelectorAll('.shot-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  
  // Camera speed slider
  const speedSlider = widget.querySelector('#cameraSpeed');
  const speedValue = widget.querySelector('#speedValue');
  speedSlider.addEventListener('input', () => {
    const val = parseInt(speedSlider.value);
    let label = 'Cinematic';
    if (val < 25) label = 'Slow-Mo Dramatic';
    else if (val < 45) label = 'Slow';
    else if (val > 75) label = 'Fast Action';
    else if (val > 55) label = 'Quick';
    speedValue.textContent = `${val}% — ${label}`;
  });
  
  // Checklist toggle
  widget.querySelectorAll('.checklist li').forEach(item => {
    item.addEventListener('click', () => {
      const checked = item.dataset.checked === 'true';
      item.dataset.checked = (!checked).toString();
      item.classList.toggle('checked', !checked);
      const checkbox = item.querySelector('.checkbox');
      checkbox.textContent = !checked ? '✓' : '';
    });
  });
  
  // Scene planner
  const scenes = JSON.parse(localStorage.getItem('bbsScenes') || '[]');
  const scenesList = widget.querySelector('#scenesList');
  
  function renderScenes() {
    scenesList.innerHTML = scenes.length === 0 
      ? '<p style="text-align: center; color: #666; font-size: 0.85em;">No scenes planned yet</p>'
      : '';
    scenes.forEach((scene, idx) => {
      const div = document.createElement('div');
      div.className = 'scene-item';
      div.innerHTML = `
        <div class="scene-info">
          <div class="scene-title">${scene.title}</div>
          <div class="scene-meta">${scene.shot} · ${scene.duration}s</div>
        </div>
        <button class="scene-delete" data-idx="${idx}">🗑️</button>
      `;
      scenesList.appendChild(div);
    });
    
    widget.querySelectorAll('.scene-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        scenes.splice(parseInt(btn.dataset.idx), 1);
        localStorage.setItem('bbsScenes', JSON.stringify(scenes));
        renderScenes();
      });
    });
  }
  
  widget.querySelector('#addScene').addEventListener('click', () => {
    const title = widget.querySelector('#sceneTitle').value;
    const shot = widget.querySelector('#sceneShot').value;
    const duration = widget.querySelector('#sceneDuration').value;
    const notes = widget.querySelector('#sceneNotes').value;
    
    if (!title) return alert('Please enter a scene title');
    
    scenes.push({ title, shot, duration: duration || '15', notes, id: Date.now() });
    localStorage.setItem('bbsScenes', JSON.stringify(scenes));
    renderScenes();
    
    widget.querySelector('#sceneTitle').value = '';
    widget.querySelector('#sceneDuration').value = '';
    widget.querySelector('#sceneNotes').value = '';
  });
  
  widget.querySelector('#clearPlanner').addEventListener('click', () => {
    widget.querySelector('#sceneTitle').value = '';
    widget.querySelector('#sceneDuration').value = '';
    widget.querySelector('#sceneNotes').value = '';
  });
  
  renderScenes();
  
  return widget;
})();
