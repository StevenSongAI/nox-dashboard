class ContentWorkflowAutomation {
  constructor() {
    this.workflows = [
      {
        name: 'Video Production Pipeline',
        description: 'Complete workflow from idea to published video',
        stages: [
          { name: 'Ideation', tools: ['Content Ideas Generator', 'Trend Research'], auto: false },
          { name: 'Scripting', tools: ['AI Writing Assistant', 'Storyboard Generator'], auto: true },
          { name: 'Recording', tools: ['OBS', 'Screen Capture'], auto: false },
          { name: 'Editing', tools: ['AI Video Editor', 'CapCut'], auto: false },
          { name: 'Thumbnails', tools: ['Thumbnail Preview Tool', 'AI Image Gen'], auto: true },
          { name: 'Publishing', tools: ['YouTube Studio', 'Scheduler'], auto: true },
          { name: 'Analytics', tools: ['Retention Analyzer', 'Engagement Optimizer'], auto: true }
        ],
        timeSaved: '40%',
        difficulty: 'Medium'
      },
      {
        name: 'Minecraft Content Factory',
        description: 'Specialized workflow for Minecraft creators',
        stages: [
          { name: 'Update Research', tools: ['26.1 Planner', 'Wiki Scraper'], auto: true },
          { name: 'World Prep', tools: ['BBS Planner', 'Chunker'], auto: false },
          { name: 'Cinematic Capture', tools: ['BBS Mod', 'Replay Mod'], auto: false },
          { name: 'Build Showcase', tools: ['Speedrun Tracker', 'Builder Explorer'], auto: false },
          { name: 'Post-Production', tools: ['AI Video Editor', 'BBS Planner'], auto: false },
          { name: 'Distribution', tools: ['Shorts Mixer', 'YouTube Studio'], auto: true }
        ],
        timeSaved: '35%',
        difficulty: 'High'
      },
      {
        name: 'Multi-Platform Distribution',
        description: 'Repurpose one video for multiple platforms',
        stages: [
          { name: 'Source Video', tools: ['YouTube Video'], auto: false },
          { name: 'Clip Extraction', tools: ['AI Clip Detection'], auto: true },
          { name: 'Shorts Creation', tools: ['Shorts Calculator', 'CapCut'], auto: false },
          { name: 'Thumbnail Adapt', tools: ['Thumbnail Preview', 'Platform Specs'], auto: true },
          { name: 'Cross-Post', tools: ['Scheduler', 'Multi-Platform'], auto: true },
          { name: 'Track Performance', tools: ['Analytics Dashboard'], auto: true }
        ],
        timeSaved: '50%',
        difficulty: 'Low'
      },
      {
        name: 'Series Content Planning',
        description: 'Plan and execute episodic content series',
        stages: [
          { name: 'Series Concept', tools: ['Series Planner', 'Trend Analysis'], auto: false },
          { name: 'Episode Breakdown', tools: ['Episode Templates', 'Content Calendar'], auto: true },
          { name: 'Batch Production', tools: ['Storyboard Gen', 'Voiceover Gen'], auto: true },
          { name: 'Scheduled Release', tools: ['Auto-Scheduler', 'YouTube Studio'], auto: true },
          { name: 'Audience Retention', tools: ['Retention Analyzer', 'Hook Optimizer'], auto: true }
        ],
        timeSaved: '45%',
        difficulty: 'Medium'
      }
    ];

    this.automationTools = [
      { name: 'Activepieces', category: 'Workflow', useCase: 'No-code automation between apps', free: true },
      { name: 'Zapier', category: 'Workflow', useCase: 'Connect 5000+ apps', free: false },
      { name: 'Make', category: 'Workflow', useCase: 'Visual workflow builder', free: true },
      { name: 'Planable', category: 'Collaboration', useCase: 'Content approval workflow', free: false },
      { name: 'Later', category: 'Scheduling', useCase: 'Instagram/TikTok scheduling', free: true },
      { name: 'StoryChief', category: 'Content Hub', useCase: 'Centralized content creation', free: false }
    ];

    this.selectedWorkflow = null;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Workflow Templates -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">🔄 Pre-built Workflows</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${this.workflows.map((wf, idx) => `
              <div class="bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 transition-colors" 
                   onclick="window.contentWorkflow.selectWorkflow(${idx})">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold">${wf.name}</span>
                  <span class="text-xs px-2 py-0.5 bg-accent-green rounded">${wf.timeSaved} saved</span>
                </div>
                <div class="text-xs text-gray-400">${wf.description}</div>
                <div class="text-xs text-gray-500 mt-1">Difficulty: ${wf.difficulty}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Workflow Detail -->
        <div id="workflow-detail" class="card rounded-lg p-4 ${this.selectedWorkflow !== null ? '' : 'hidden'}">
          ${this.selectedWorkflow !== null ? this.renderWorkflowDetail() : ''}
        </div>

        <!-- Automation Tools Directory -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">🛠️ Automation Tools Directory</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${this.automationTools.map(tool => `
              <div class="bg-dark-700 rounded p-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold">${tool.name}</span>
                  ${tool.free ? '<span class="text-xs px-2 py-0.5 bg-accent-green rounded">Free</span>' : '<span class="text-xs px-2 py-0.5 bg-accent-blue rounded">Paid</span>'}
                </div>
                <div class="text-xs text-gray-400">${tool.category}</div>
                <div class="text-xs text-gray-500 mt-1">${tool.useCase}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Tips -->
        <div class="card rounded-lg p-4">
          <h3 class="font-semibold mb-3">💡 2026 Workflow Automation Tips</h3>
          <ul class="text-sm text-gray-300 space-y-2">
            <li>• Start with one repetitive task (e.g., thumbnail creation) before automating entire pipelines</li>
            <li>• Use no-code tools like Activepieces to connect apps without developer resources</li>
            <li>• Schedule content in batches — 2-3 hours of planning saves 10+ hours weekly</li>
            <li>• Automate analytics collection but keep creative decisions human</li>
            <li>• Test workflows with small content pieces before applying to flagship videos</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderWorkflowDetail() {
    const wf = this.workflows[this.selectedWorkflow];
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">${wf.name}</h2>
          <button onclick="window.contentWorkflow.closeDetail()" class="text-sm px-3 py-1 bg-dark-600 rounded hover:bg-dark-500">Close</button>
        </div>
        
        <div class="text-sm text-gray-400">${wf.description}</div>
        
        <div class="bg-dark-800 rounded-lg p-3">
          <div class="text-sm font-semibold mb-2">📊 Expected Impact</div>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-green">${wf.timeSaved}</div>
              <div class="text-xs text-gray-500">Time Saved</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-blue">${wf.stages.length}</div>
              <div class="text-xs text-gray-500">Stages</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-yellow">${wf.difficulty}</div>
              <div class="text-xs text-gray-500">Difficulty</div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm font-semibold">📋 Workflow Stages</div>
          ${wf.stages.map((stage, idx) => `
            <div class="bg-dark-700 rounded p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center text-xs font-bold">${idx + 1}</span>
                  <span class="font-semibold">${stage.name}</span>
                </div>
                ${stage.auto ? '<span class="text-xs px-2 py-0.5 bg-accent-green rounded">🤖 Auto</span>' : '<span class="text-xs px-2 py-0.5 bg-accent-yellow rounded">👤 Manual</span>'}
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                ${stage.tools.map(tool => `<span class="text-xs px-2 py-1 bg-dark-600 rounded">${tool}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="bg-dark-800 rounded-lg p-3">
          <div class="text-sm font-semibold mb-2">🚀 Implementation Steps</div>
          <ol class="text-sm text-gray-300 space-y-1">
            <li>1. Map your current workflow against this template</li>
            <li>2. Identify which stages are bottlenecks</li>
            <li>3. Start automating one stage at a time</li>
            <li>4. Measure time savings after each automation</li>
            <li>5. Refine and optimize based on results</li>
          </ol>
        </div>
      </div>
    `;
  }

  selectWorkflow(index) {
    this.selectedWorkflow = index;
    const detailEl = document.getElementById('workflow-detail');
    if (detailEl) {
      detailEl.innerHTML = this.renderWorkflowDetail();
      detailEl.classList.remove('hidden');
      detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  closeDetail() {
    this.selectedWorkflow = null;
    const detailEl = document.getElementById('workflow-detail');
    if (detailEl) {
      detailEl.classList.add('hidden');
    }
  }
}

// Export to global
window.ContentWorkflowAutomation = ContentWorkflowAutomation;
