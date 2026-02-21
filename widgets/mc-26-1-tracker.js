/**
 * Minecraft 26.1 First Drop 2026 Tracker Widget
 * Research: First Drop 2026 features - baby mob variants, craftable name tags, golden dandelion, bundles
 */

(function() {
  const widget = document.createElement('div');
  widget.className = 'widget mc-26-1-tracker';
  widget.innerHTML = `
    <style>
      .mc-26-1-tracker { background: linear-gradient(135deg, #2d5016 0%, #3a6b1f 100%); border-radius: 12px; padding: 20px; color: #fff; }
      .mc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .mc-header h3 { margin: 0; font-size: 1.3em; color: #ffd700; }
      .mc-badge { background: #ff6b6b; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 0.7em; font-weight: bold; }
      .mc-tabs { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
      .mc-tab { background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
      .mc-tab:hover, .mc-tab.active { background: #ffd700; color: #2d5016; }
      .mc-content { display: none; }
      .mc-content.active { display: block; animation: fadeIn 0.3s; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px; }
      .feature-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; border-left: 3px solid #ffd700; }
      .feature-icon { font-size: 1.8em; margin-bottom: 8px; }
      .feature-title { font-weight: bold; color: #ffd700; font-size: 0.95em; margin-bottom: 5px; }
      .feature-desc { font-size: 0.8em; color: #ccc; line-height: 1.4; }
      .recipe-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px; }
      .recipe-title { font-weight: bold; color: #4ecdc4; font-size: 1em; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
      .recipe-grid { display: grid; grid-template-columns: repeat(3, 40px); gap: 4px; margin: 10px 0; }
      .recipe-slot { width: 40px; height: 40px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.2em; }
      .recipe-output { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); }
      .recipe-arrow { font-size: 1.5em; color: #ffd700; }
      .mob-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
      .mob-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; text-align: center; }
      .mob-icon { font-size: 2em; margin-bottom: 5px; }
      .mob-name { font-size: 0.8em; color: #fff; }
      .mob-variant { font-size: 0.7em; color: #4ecdc4; }
      .countdown-box { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 15px; }
      .countdown-label { font-size: 0.8em; color: #aaa; margin-bottom: 5px; }
      .countdown-value { font-size: 2em; font-weight: bold; color: #ffd700; }
      .countdown-sub { font-size: 0.75em; color: #888; margin-top: 5px; }
      .tip-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 12px; margin-top: 15px; }
      .tip-box h4 { margin: 0 0 8px 0; color: #fff; font-size: 0.9em; }
      .tip-box p { margin: 0; font-size: 0.8em; color: rgba(255,255,255,0.9); line-height: 1.4; }
      .checklist { list-style: none; padding: 0; margin: 0; }
      .checklist li { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
      .checklist li:hover { background: rgba(255,255,255,0.03); }
      .checklist li.checked { opacity: 0.5; }
      .checklist li.checked span { text-decoration: line-through; }
      .checkbox { width: 18px; height: 18px; border: 2px solid #4ecdc4; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; }
      .checklist li.checked .checkbox { background: #4ecdc4; color: #2d5016; }
    </style>
    
    <div class="mc-header">
      <span style="font-size: 1.5em;">🌸</span>
      <div>
        <h3>Minecraft 26.1 First Drop</h3>
        <span style="font-size: 0.8em; color: #888;">Spring 2026 Update Tracker</span>
      </div>
      <span class="mc-badge">Coming Soon</span>
    </div>
    
    <div class="mc-tabs">
      <button class="mc-tab active" data-tab="overview">📋 Overview</button>
      <button class="mc-tab" data-tab="recipes">🔨 New Recipes</button>
      <button class="mc-tab" data-tab="mobs">🐷 Baby Mobs</button>
      <button class="mc-tab" data-tab="checklist">✅ Checklist</button>
    </div>
    
    <div class="mc-content active" id="overview-tab">
      <div class="countdown-box">
        <div class="countdown-label">Expected Release</div>
        <div class="countdown-value" id="countdown">March 2026</div>
        <div class="countdown-sub">Late March 2026 (estimated)</div>
      </div>
      
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Key features coming in First Drop 2026:</p>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🏷️</div>
          <div class="feature-title">Craftable Name Tags</div>
          <div class="feature-desc">Name tags can finally be crafted! No more dungeon hunting required.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌼</div>
          <div class="feature-title">Golden Dandelion</div>
          <div class="feature-desc">New flower variant added to the game. Decorative and breeding uses.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎒</div>
          <div class="feature-title">Bundles in Villages</div>
          <div class="feature-desc">Bundles now spawn in village chests. Early game storage solution!</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🧭</div>
          <div class="feature-title">New Lodestone Recipe</div>
          <div class="feature-desc">Lodestones now craftable and found in Ruined Portals.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🥚</div>
          <div class="feature-title">Updated Spawn Eggs</div>
          <div class="feature-desc">All spawn egg textures updated with new designs.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👶</div>
          <div class="feature-title">Baby Mob Models</div>
          <div class="feature-desc">Unique textures and models for every baby mob variant.</div>
        </div>
      </div>
      
      <div class="tip-box">
        <h4>💡 Content Idea</h4>
        <p>Create a "First Drop Survival" series starting fresh in 26.1! Showcase the new craftable name tags, find bundles in villages, and collect all the new baby mob variants.</p>
      </div>
    </div>
    
    <div class="mc-content" id="recipes-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">New crafting recipes in 26.1:</p>
      
      <div class="recipe-card">
        <div class="recipe-title">🏷️ Name Tag</div>
        <div style="font-size: 0.8em; color: #888; margin-bottom: 10px;">Finally craftable! String + Paper</div>
        <div class="recipe-grid">
          <div class="recipe-slot">🧵</div>
          <div class="recipe-slot">📄</div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
          <div class="recipe-slot"></div>
        </div>
        <div class="recipe-output">
          <span>Yields:</span>
          <span class="recipe-arrow">→</span>
          <span style="font-size: 1.5em;">🏷️</span>
          <span>1 Name Tag</span>
        </div>
      </div>
      
      <div class="recipe-card">
        <div class="recipe-title">🧭 Lodestone</div>
        <div style="font-size: 0.8em; color: #888; margin-bottom: 10px;">New cheaper recipe + found in Ruined Portals</div>
        <div class="recipe-output" style="border-top: none; padding-top: 0;">
          <span style="color: #ffd700;">💡 Tip:</span>
          <span style="font-size: 0.8em; color: #ccc;">Check Ruined Portals for free Lodestones before crafting!</span>
        </div>
      </div>
      
      <div class="recipe-card">
        <div class="recipe-title">🎒 Bundle (Found in Villages)</div>
        <div style="font-size: 0.8em; color: #888; margin-bottom: 10px;">Now spawns in Village chests</div>
        <div class="recipe-output" style="border-top: none; padding-top: 0;">
          <span style="color: #ffd700;">💡 Locations:</span>
          <span style="font-size: 0.8em; color: #ccc;">Plains, Desert, Savanna village chests</span>
        </div>
      </div>
    </div>
    
    <div class="mc-content" id="mobs-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Baby mobs getting unique models:</p>
      
      <div class="mob-grid">
        <div class="mob-card">
          <div class="mob-icon">🐷</div>
          <div class="mob-name">Baby Pig</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐮</div>
          <div class="mob-name">Baby Cow</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐔</div>
          <div class="mob-name">Baby Chicken</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐑</div>
          <div class="mob-name">Baby Sheep</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐰</div>
          <div class="mob-name">Baby Rabbit</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐺</div>
          <div class="mob-name">Baby Wolf</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🐱</div>
          <div class="mob-name">Baby Cat</div>
          <div class="mob-variant">New Model</div>
        </div>
        <div class="mob-card">
          <div class="mob-icon">🦊</div>
          <div class="mob-name">Baby Fox</div>
          <div class="mob-variant">New Model</div>
        </div>
      </div>
      
      <div class="tip-box" style="margin-top: 15px;">
        <h4>🎥 Content Goldmine</h4>
        <p>Build a "Baby Zoo" showcasing all the new baby mob models! Each variant can be a short video. The cute factor = high engagement.</p>
      </div>
    </div>
    
    <div class="mc-content" id="checklist-tab">
      <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Content prep checklist for 26.1 launch:</p>
      
      <ul class="checklist" id="prepChecklist">
        <li data-checked="false"><div class="checkbox"></div><span>Plan "First Drop Survival" series outline</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Prepare craftable name tag tutorial script</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Research bundle village spawn locations</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Script baby mob model showcase</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Plan Ruined Portal lodestone hunting video</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Design golden dandelion garden build</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Create spawn egg collection showcase</span></li>
        <li data-checked="false"><div class="checkbox"></div><span>Schedule release day stream/video</span></li>
      </ul>
    </div>
  `;
  
  // Tab switching
  widget.querySelectorAll('.mc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      widget.querySelectorAll('.mc-tab').forEach(t => t.classList.remove('active'));
      widget.querySelectorAll('.mc-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      widget.querySelector(`#${tab.dataset.tab}-tab`).classList.add('active');
    });
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
  
  return widget;
})();
