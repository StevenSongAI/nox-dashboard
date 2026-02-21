/**
 * Create Mod Build Ideas Generator Widget
 * Research: Create Mod by simibubi - contraptions, rotational power, aesthetic automation
 * Features: Build categories, difficulty filters, rotational power calculator, material lists
 */

(function() {
  const widget = document.createElement('div');
  widget.className = 'widget create-mod-generator';
  widget.innerHTML = `
    <style>
      .create-mod-generator { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); border-radius: 12px; padding: 20px; color: #fff; }
      .create-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .create-header h3 { margin: 0; font-size: 1.3em; color: #ffd700; }
      .create-badge { background: #ff6b6b; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 0.7em; font-weight: bold; }
      .create-tabs { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
      .create-tab { background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
      .create-tab:hover, .create-tab.active { background: #ffd700; color: #1e3c72; }
      .create-content { display: none; }
      .create-content.active { display: block; animation: fadeIn 0.3s; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 15px; }
      .category-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; text-align: center; }
      .category-card:hover { background: rgba(255,215,0,0.1); border-color: #ffd700; transform: translateY(-2px); }
      .category-card.selected { background: rgba(255,215,0,0.2); border-color: #ffd700; }
      .category-icon { font-size: 1.8em; margin-bottom: 8px; }
      .category-name { font-weight: bold; font-size: 0.85em; color: #fff; }
      .idea-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 3px solid #ffd700; }
      .idea-title { font-weight: bold; color: #ffd700; font-size: 1em; margin-bottom: 5px; }
      .idea-desc { font-size: 0.85em; color: #ccc; margin-bottom: 10px; line-height: 1.4; }
      .idea-meta { display: flex; gap: 10px; font-size: 0.75em; }
      .difficulty { padding: 2px 8px; border-radius: 4px; }
      .difficulty.easy { background: #4ecdc4; color: #1a1a2e; }
      .difficulty.medium { background: #ffd700; color: #1a1a2e; }
      .difficulty.hard { background: #ff6b6b; color: #fff; }
      .rpm-tag { background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; color: #aaa; }
      .generate-btn { background: #4ecdc4; color: #1a1a2e; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.9em; width: 100%; margin: 10px 0; transition: all 0.2s; }
      .generate-btn:hover { background: #3dbdb4; transform: translateY(-1px); }
      .rpm-calculator { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; }
      .rpm-input { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
      .rpm-input label { font-size: 0.8em; color: #aaa; min-width: 100px; }
      .rpm-input input { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 6px 10px; color: #fff; width: 80px; }
      .rpm-result { background: rgba(78,205,196,0.2); border: 1px solid #4ecdc4; border-radius: 6px; padding: 10px; text-align: center; margin-top: 10px; }
      .rpm-result-value { font-size: 1.5em; font-weight: bold; color: #4ecdc4; }
      .component-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .component-item { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px; font-size: 0.8em; display: flex; align-items: center; gap: 8px; }
      .component-icon { font-size: 1.2em; }
      .material-section { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px; }
      .material-section h4 { margin: 0 0 10px 0; color: #4ecdc4; font-size: 0.9em; }
      .material-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
      .material-item { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px 10px; font-size: 0.75em; display: flex; justify-content: space-between; }
      .material-count { color: #ffd700; font-weight: bold; }
      .tip-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 12px; margin-top: 15px; }
      .tip-box h4 { margin: 0 0 8px 0; color: #fff; font-size: 0.9em; }
      .tip-box p { margin: 0; font-size: 0.8em; color: rgba(255,255,255,0.9); line-height: 1.4; }
      .saved-ideas { max-height: 200px; overflow-y: auto; }
      .saved-idea-item { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
      .saved-idea-title { font-weight: bold; font-size: 0.85em; }
      .saved-idea-delete { background: #ff6b6b; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.7em; }
    </style>
    
    <div class="create-header">
      <span style="font-size: 1.5em;">⚙️</span>
      <div>
        <h3>Create Mod Build Ideas</h3>
        <span style="font-size: 0.8em; color: #888;">Contraptions & Rotational Power</span>
      </div>
      <span class="create-badge">Create 0.5+</span>
    </div>
    
    <div class="create-tabs">
      <button class="create-tab active" data-tab="ideas">💡 Ideas</button>
      <button class="create-tab" data-tab="rpm">⚙️ RPM Calc</button>
      <button class="create-tab" data-tab="components">🔧 Components</button>
      <button class="create-tab" data-tab="saved">💾 Saved</button>
    </div>
    
    <div class="create-content active" id="ideas-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Select a category to generate build ideas:</p>
      <div class="category-grid">
        <div class="category-card" data-category="factory">
          <div class="category-icon">🏭</div>
          <div class="category-name">Factory</div>
        </div>
        <div class="category-card" data-category="transport">
          <div class="category-icon">🚂</div>
          <div class="category-name">Transport</div>
        </div>
        <div class="category-card" data-category="processing">
          <div class="category-icon">⚙️</div>
          <div class="category-name">Processing</div>
        </div>
        <div class="category-card" data-category="power">
          <div class="category-icon">💨</div>
          <div class="category-name">Power Gen</div>
        </div>
        <div class="category-card" data-category="aesthetic">
          <div class="category-icon">🎨</div>
          <div class="category-name">Aesthetic</div>
        </div>
        <div class="category-card" data-category="automated">
          <div class="category-icon">🤖</div>
          <div class="category-name">Automated</div>
        </div>
      </div>
      <button class="generate-btn" id="generateIdea">✨ Generate Random Idea</button>
      <div id="ideaOutput"></div>
    </div>
    
    <div class="create-content" id="rpm-tab">
      <div class="rpm-calculator">
        <h4 style="margin: 0 0 15px 0; color: #ffd700;">Rotational Speed Calculator</h4>
        <div class="rpm-input">
          <label>Input Speed (RPM):</label>
          <input type="number" id="inputRpm" value="32" min="1" max="256">
        </div>
        <div class="rpm-input">
          <label>Large Cogwheels:</label>
          <input type="number" id="largeCogs" value="1" min="0" max="5">
        </div>
        <div class="rpm-input">
          <label>Small Cogwheels:</label>
          <input type="number" id="smallCogs" value="0" min="0" max="5">
        </div>
        <div class="rpm-result">
          <div style="font-size: 0.8em; color: #aaa;">Output Speed</div>
          <div class="rpm-result-value" id="rpmOutput">32 RPM</div>
        </div>
        <div class="tip-box" style="margin-top: 15px;">
          <h4>💡 Gear Ratio Rules</h4>
          <p>• Large → Small: Speed doubles (2x)<br>• Small → Large: Speed halves (0.5x)<br>• Same size: Speed unchanged</p>
        </div>
      </div>
    </div>
    
    <div class="create-content" id="components-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Essential Create Mod components:</p>
      <div class="component-list">
        <div class="component-item"><span class="component-icon">⚙️</span> Cogwheel</div>
        <div class="component-item"><span class="component-icon">🔩</span> Large Cogwheel</div>
        <div class="component-item"><span class="component-icon">⛓️</span> Chain Drive</div>
        <div class="component-item"><span class="component-icon">🛤️</span> Encased Chain</div>
        <div class="component-item"><span class="component-icon">📦</span> Mechanical Belt</div>
        <div class="component-item"><span class="component-icon">🔄</span> Gearbox</div>
        <div class="component-item"><span class="component-icon">⚡</span> Speed Controller</div>
        <div class="component-item"><span class="component-icon">🔧</span> Shaft</div>
        <div class="component-item"><span class="component-icon">🏗️</span> Mechanical Piston</div>
        <div class="component-item"><span class="component-icon">🎡</span> Windmill Bearing</div>
        <div class="component-item"><span class="component-icon">💨</span> Steam Engine</div>
        <div class="component-item"><span class="component-icon">⚙️</span> Rotation Speed Controller</div>
      </div>
      <div class="tip-box" style="margin-top: 15px;">
        <h4>🔗 Power Transmission</h4>
        <p>Use shafts for short distances, chains for medium, and mechanical belts for long runs. Remember: each junction loses a small amount of stress capacity!</p>
      </div>
    </div>
    
    <div class="create-content" id="saved-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Your saved build ideas:</p>
      <div class="saved-ideas" id="savedIdeasList">
        <p style="text-align: center; color: #666; font-size: 0.85em;">No saved ideas yet</p>
      </div>
    </div>
  `;
  
  // Tab switching
  widget.querySelectorAll('.create-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      widget.querySelectorAll('.create-tab').forEach(t => t.classList.remove('active'));
      widget.querySelectorAll('.create-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      widget.querySelector(`#${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Category selection
  let selectedCategory = null;
  widget.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      widget.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCategory = card.dataset.category;
    });
  });
  
  // Build ideas database
  const buildIdeas = {
    factory: [
      { title: "Automated Ore Processing Plant", desc: "Crush, wash, and smelt ores automatically using mechanical belts and funnels.", difficulty: "medium", rpm: "64-128 RPM" },
      { title: "Tree Farm with Mechanical Saws", desc: "Automatically chop trees and collect saplings using deployers and saws.", difficulty: "hard", rpm: "32-64 RPM" },
      { title: "Bulk Storage Warehouse", desc: "Organize items into categorized storage drawers with automatic sorting.", difficulty: "medium", rpm: "16-32 RPM" }
    ],
    transport: [
      { title: "Elevated Railway System", desc: "Build a train network connecting multiple bases with stations.", difficulty: "hard", rpm: "Train-based" },
      { title: "Minecart Contraption Elevator", desc: "Vertical transport using minecarts on mechanical bearings.", difficulty: "medium", rpm: "Variable" },
      { title: "Rope Pulley Lift System", desc: "Simple vertical transport for players and items.", difficulty: "easy", rpm: "16-32 RPM" }
    ],
    processing: [
      { title: "Mechanical Press Assembly Line", desc: "Automated crafting using mechanical presses and deployers.", difficulty: "medium", rpm: "32-64 RPM" },
      { title: "Fluid Processing Station", desc: "Mix, heat, and process fluids with mechanical mixers and blaze burners.", difficulty: "hard", rpm: "32 RPM" },
      { title: "Compacting Drawer System", desc: "Automatically compact nuggets to ingots to blocks.", difficulty: "easy", rpm: "16 RPM" }
    ],
    power: [
      { title: "Water Wheel Array", desc: "Stack multiple water wheels for early-game power generation.", difficulty: "easy", rpm: "Water flow" },
      { title: "Windmill Power Station", desc: "Massive windmill with sails for high stress capacity.", difficulty: "medium", rpm: "Wind-based" },
      { title: "Steam Engine Boiler Room", desc: "Efficient steam power using blaze burners and boilers.", difficulty: "hard", rpm: "64+ RPM" }
    ],
    aesthetic: [
      { title: "Clocktower with Working Hands", desc: "Mechanical clock using gearshifts and redstone links.", difficulty: "medium", rpm: "1 RPM" },
      { title: "Rotating Display Cases", desc: "Showcase items on rotating platforms using turntables.", difficulty: "easy", rpm: "4-8 RPM" },
      { title: "Mechanical Door System", desc: "Impressive sliding or rotating doors for your base.", difficulty: "medium", rpm: "16-32 RPM" }
    ],
    automated: [
      { title: "Mob Grinder with Deployers", desc: "Kill mobs automatically and collect drops.", difficulty: "hard", rpm: "32-64 RPM" },
      { title: "Crop Harvesting Machine", desc: "Harvest and replant crops using mechanical harvesters.", difficulty: "medium", rpm: "16-32 RPM" },
      { title: "Cobblestone Generator", desc: "Generate infinite cobble using lava and water.", difficulty: "easy", rpm: "8-16 RPM" }
    ]
  };
  
  // Generate idea
  const savedIdeas = JSON.parse(localStorage.getItem('createModIdeas') || '[]');
  
  function renderSavedIdeas() {
    const list = widget.querySelector('#savedIdeasList');
    if (savedIdeas.length === 0) {
      list.innerHTML = '<p style="text-align: center; color: #666; font-size: 0.85em;">No saved ideas yet</p>';
      return;
    }
    list.innerHTML = '';
    savedIdeas.forEach((idea, idx) => {
      const div = document.createElement('div');
      div.className = 'saved-idea-item';
      div.innerHTML = `
        <span class="saved-idea-title">${idea.title}</span>
        <button class="saved-idea-delete" data-idx="${idx}">🗑️</button>
      `;
      list.appendChild(div);
    });
    
    widget.querySelectorAll('.saved-idea-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        savedIdeas.splice(parseInt(btn.dataset.idx), 1);
        localStorage.setItem('createModIdeas', JSON.stringify(savedIdeas));
        renderSavedIdeas();
      });
    });
  }
  
  widget.querySelector('#generateIdea').addEventListener('click', () => {
    let ideas = [];
    if (selectedCategory && buildIdeas[selectedCategory]) {
      ideas = buildIdeas[selectedCategory];
    } else {
      // Random from all categories
      Object.values(buildIdeas).forEach(cat => ideas.push(...cat));
    }
    
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    const output = widget.querySelector('#ideaOutput');
    
    const diffClass = idea.difficulty;
    output.innerHTML = `
      <div class="idea-card">
        <div class="idea-title">${idea.title}</div>
        <div class="idea-desc">${idea.desc}</div>
        <div class="idea-meta">
          <span class="difficulty ${diffClass}">${idea.difficulty.toUpperCase()}</span>
          <span class="rpm-tag">⚙️ ${idea.rpm}</span>
        </div>
        <button class="generate-btn" id="saveIdea" style="margin-top: 10px; padding: 8px;">💾 Save Idea</button>
      </div>
    `;
    
    widget.querySelector('#saveIdea').addEventListener('click', () => {
      savedIdeas.push(idea);
      localStorage.setItem('createModIdeas', JSON.stringify(savedIdeas));
      renderSavedIdeas();
      widget.querySelector('#saveIdea').textContent = '✅ Saved!';
    });
  });
  
  // RPM Calculator
  function calculateRpm() {
    const inputRpm = parseInt(widget.querySelector('#inputRpm').value) || 32;
    const largeCogs = parseInt(widget.querySelector('#largeCogs').value) || 0;
    const smallCogs = parseInt(widget.querySelector('#smallCogs').value) || 0;
    
    let outputRpm = inputRpm;
    // Each large->small doubles, each small->large halves
    // Net effect: (2^large) * (0.5^small)
    outputRpm = inputRpm * Math.pow(2, largeCogs) * Math.pow(0.5, smallCogs);
    outputRpm = Math.round(outputRpm * 10) / 10;
    
    widget.querySelector('#rpmOutput').textContent = `${outputRpm} RPM`;
  }
  
  widget.querySelector('#inputRpm').addEventListener('input', calculateRpm);
  widget.querySelector('#largeCogs').addEventListener('input', calculateRpm);
  widget.querySelector('#smallCogs').addEventListener('input', calculateRpm);
  
  renderSavedIdeas();
  
  return widget;
})();
