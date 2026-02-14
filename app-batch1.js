
// ==================== BATCH 1: CRM & Pipeline Functions ====================

// CRM Data Cache
let crmData = { contacts: [], stats: {} };
let pipelineData = { ideas: [], stats: {} };
let usageData = { providers: [], projects: [] };
let servicesData = { services: [] };
let automationsData = { automations: [], stats: {} };

/**
 * Load CRM data from JSON
 */
async function loadCRMData() {
  try {
    const response = await fetch('data/crm.json?v=' + Date.now());
    crmData = await response.json();
    return crmData;
  } catch (error) {
    console.error('[CRM] Error loading data:', error);
    return { contacts: [], stats: {} };
  }
}

/**
 * Load Pipeline data from JSON
 */
async function loadPipelineData() {
  try {
    const response = await fetch('data/pipeline.json?v=' + Date.now());
    pipelineData = await response.json();
    return pipelineData;
  } catch (error) {
    console.error('[Pipeline] Error loading data:', error);
    return { ideas: [], stats: {} };
  }
}

/**
 * Load Usage data from JSON
 */
async function loadUsageData() {
  try {
    const response = await fetch('data/usage.json?v=' + Date.now());
    usageData = await response.json();
    return usageData;
  } catch (error) {
    console.error('[Usage] Error loading data:', error);
    return { providers: [], projects: [] };
  }
}

/**
 * Load Services data from JSON
 */
async function loadServicesData() {
  try {
    const response = await fetch('data/services.json?v=' + Date.now());
    servicesData = await response.json();
    return servicesData;
  } catch (error) {
    console.error('[Services] Error loading data:', error);
    return { services: [] };
  }
}

/**
 * Load Automations data from JSON
 */
async function loadAutomationsData() {
  try {
    const response = await fetch('data/automations.json?v=' + Date.now());
    automationsData = await response.json();
    return automationsData;
  } catch (error) {
    console.error('[Automations] Error loading data:', error);
    return { automations: [], stats: {} };
  }
}

/**
 * Render CRM Kanban Board
 */
function renderCRM() {
  const statusFilter = document.getElementById('crm-status-filter')?.value || 'all';
  const priorityFilter = document.getElementById('crm-priority-filter')?.value || 'all';
  
  const stages = ['applied', 'screening', 'test_project', 'interview', 'hired', 'active'];
  
  stages.forEach(stage => {
    const container = document.getElementById(`crm-cards-${stage}`);
    const countBadge = document.getElementById(`crm-count-${stage}`);
    if (!container) return;
    
    // Filter contacts for this stage
    let contacts = crmData.contacts?.filter(c => c.status === stage) || [];
    
    // Apply filters
    if (statusFilter !== 'all' && stage !== statusFilter) {
      contacts = [];
    }
    if (priorityFilter !== 'all') {
      contacts = contacts.filter(c => c.priority === priorityFilter);
    }
    
    // Update count badge
    if (countBadge) {
      countBadge.textContent = contacts.length;
    }
    
    // Render cards
    if (contacts.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-500 text-xs py-4">No contacts</div>`;
      return;
    }
    
    container.innerHTML = contacts.map(contact => `
      <div class="crm-card bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 transition-colors" onclick="showContactDetail('${contact.id}')">
        <div class="flex justify-between items-start mb-2">
          <div class="font-medium text-sm">${contact.name}</div>
          <span class="text-xs px-1.5 py-0.5 rounded ${getPriorityColor(contact.priority)}">${contact.priority}</span>
        </div>
        <div class="text-xs text-gray-400 mb-1">${contact.location} • ${contact.earnings}</div>
        <div class="flex flex-wrap gap-1 mb-2">
          ${(contact.skills || []).slice(0, 3).map(skill => `<span class="text-xs bg-dark-800 px-1.5 py-0.5 rounded">${skill}</span>`).join('')}
        </div>
        <div class="text-xs text-accent-blue">→ ${contact.nextAction}</div>
      </div>
    `).join('');
  });
}

function getPriorityColor(priority) {
  switch(priority) {
    case 'high': return 'bg-red-900/50 text-red-400';
    case 'medium': return 'bg-yellow-900/50 text-yellow-400';
    case 'low': return 'bg-green-900/50 text-green-400';
    default: return 'bg-gray-800 text-gray-400';
  }
}

function showContactDetail(contactId) {
  const contact = crmData.contacts?.find(c => c.id === contactId);
  if (!contact) return;
  
  document.getElementById('modal-title').textContent = contact.name;
  document.getElementById('modal-content').innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-gray-400">Location:</span> ${contact.location}</div>
        <div><span class="text-gray-400">Earnings:</span> ${contact.earnings}</div>
        <div><span class="text-gray-400">Rate:</span> ${contact.hourlyRate}</div>
        <div><span class="text-gray-400">Source:</span> ${contact.source}</div>
      </div>
      <div>
        <span class="text-gray-400">Skills:</span>
        <div class="flex flex-wrap gap-2 mt-1">
          ${(contact.skills || []).map(s => `<span class="bg-dark-700 px-2 py-1 rounded text-sm">${s}</span>`).join('')}
        </div>
      </div>
      <div>
        <span class="text-gray-400">Notes:</span>
        <p class="mt-1 text-sm">${contact.notes}</p>
      </div>
      <div>
        <span class="text-gray-400">Next Action:</span>
        <p class="mt-1 text-accent-blue">${contact.nextAction}</p>
      </div>
    </div>
  `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

/**
 * Render Video Idea Pipeline
 */
function renderPipeline() {
  const statsEl = document.getElementById('pipeline-stats');
  if (statsEl) {
    const total = pipelineData.ideas?.length || 0;
    const avgScore = pipelineData.stats?.avgViralScore || 0;
    statsEl.textContent = `${total} ideas • Avg Score: ${avgScore}`;
  }
  
  const stages = ['idea_captured', 'validated', 'ready_to_produce', 'in_production'];
  
  stages.forEach(stage => {
    const container = document.getElementById(`pipeline-cards-${stage}`);
    const countBadge = document.getElementById(`pipeline-count-${stage}`);
    if (!container) return;
    
    const ideas = pipelineData.ideas?.filter(i => i.stage === stage) || [];
    
    if (countBadge) {
      countBadge.textContent = ideas.length;
    }
    
    if (ideas.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-500 text-xs py-4">No ideas</div>`;
      return;
    }
    
    container.innerHTML = ideas.map(idea => `
      <div class="pipeline-card bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 transition-colors" onclick="showIdeaDetail('${idea.id}')">
        <div class="font-medium text-sm mb-2">${idea.title}</div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-yellow-400">⭐ ${idea.viralScore}</span>
          <span class="text-green-400">$${idea.estimatedCost}</span>
        </div>
        <div class="text-xs text-gray-400 mt-1">${idea.estimatedViews} views</div>
      </div>
    `).join('');
  });
}

function showIdeaDetail(ideaId) {
  const idea = pipelineData.ideas?.find(i => i.id === ideaId);
  if (!idea) return;
  
  document.getElementById('modal-title').textContent = idea.title;
  document.getElementById('modal-content').innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-gray-400">Viral Score:</span> <span class="text-yellow-400">${idea.viralScore}</span></div>
        <div><span class="text-gray-400">Est. Cost:</span> <span class="text-green-400">$${idea.estimatedCost}</span></div>
        <div><span class="text-gray-400">Est. Views:</span> ${idea.estimatedViews}</div>
        <div><span class="text-gray-400">Channel:</span> ${idea.targetChannel}</div>
      </div>
      <div>
        <span class="text-gray-400">Validation:</span>
        <p class="mt-1 text-sm">${idea.validation?.competitorAnalysis || 'No analysis'}</p>
      </div>
      ${idea.briefId ? `<div class="text-accent-blue">📄 Content brief available</div>` : ''}
    </div>
  `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

/**
 * Render Usage Tracker
 */
function renderUsage() {
  const budgetEl = document.getElementById('usage-budget');
  const spendEl = document.getElementById('usage-spend');
  const projectedEl = document.getElementById('usage-projected');
  const avgCostEl = document.getElementById('usage-avg-cost');
  const budgetBar = document.getElementById('usage-budget-bar');
  const budgetText = document.getElementById('usage-budget-text');
  
  if (budgetEl) budgetEl.textContent = `$${(usageData.monthlyBudget || 0).toLocaleString()}`;
  if (spendEl) spendEl.textContent = `$${(usageData.currentSpend || 0).toLocaleString()}`;
  if (projectedEl) projectedEl.textContent = `Projected: $${(usageData.projections?.projectedTotal || 0).toLocaleString()}`;
  if (avgCostEl) avgCostEl.textContent = `$${Math.round(usageData.projects?.reduce((a, p) => a + p.costs.total, 0) / (usageData.projects?.length || 1)) || 0}`;
  
  const pct = Math.round(((usageData.currentSpend || 0) / (usageData.monthlyBudget || 1)) * 100);
  if (budgetBar) {
    budgetBar.style.width = `${Math.min(pct, 100)}%`;
    budgetBar.className = `h-2 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`;
  }
  if (budgetText) budgetText.textContent = `${pct}% used ($${(usageData.currentSpend || 0).toLocaleString()})`;
  
  // Render providers
  const providersContainer = document.getElementById('usage-providers');
  if (providersContainer && usageData.providers) {
    providersContainer.innerHTML = usageData.providers.map(p => `
      <div class="flex justify-between items-center p-3 bg-dark-700 rounded">
        <div>
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-gray-400">${p.usage}</div>
        </div>
        <div class="text-lg font-bold text-accent-blue">$${p.monthlyCost}</div>
      </div>
    `).join('');
  }
  
  // Render projects
  const projectsContainer = document.getElementById('usage-projects');
  if (projectsContainer && usageData.projects) {
    projectsContainer.innerHTML = usageData.projects.map(p => `
      <div class="p-3 bg-dark-700 rounded">
        <div class="flex justify-between items-start mb-2">
          <div class="font-medium">${p.name}</div>
          <span class="text-xs px-2 py-0.5 rounded ${p.status === 'in_production' ? 'bg-accent-blue/30 text-accent-blue' : 'bg-green-900/30 text-green-400'}">${p.status}</span>
        </div>
        <div class="grid grid-cols-4 gap-2 text-xs text-gray-400">
          <div>Higgsfield: $${p.costs.higgsfield}</div>
          <div>Kling: $${p.costs.kling}</div>
          <div>OpenAI: $${p.costs.openai}</div>
          <div>Editor: $${p.costs.editor}</div>
        </div>
        <div class="flex justify-between items-center mt-2 text-sm">
          <span>Total: <span class="text-white font-bold">$${p.costs.total}</span></span>
          <span class="text-gray-400">CPM: $${p.cpm}</span>
        </div>
      </div>
    `).join('');
  }
}

/**
 * Render Services Directory
 */
function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container || !servicesData.services) return;
  
  container.innerHTML = servicesData.services.map(s => `
    <div class="card rounded-lg p-4 ${s.status !== 'available' ? 'opacity-50' : ''}">
      <div class="flex justify-between items-start mb-2">
        <div class="font-medium">${s.name}</div>
        <span class="text-xs px-2 py-0.5 rounded ${s.status === 'available' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}">${s.status}</span>
      </div>
      <div class="text-sm text-gray-400 mb-3">${s.description}</div>
      <div class="flex justify-between items-center text-xs text-gray-500 mb-3">
        <span>Used ${s.usageCount} times</span>
        <span class="text-gray-400">${s.category}</span>
      </div>
      <button onclick="launchService('${s.id}')" class="w-full px-3 py-2 bg-accent-blue rounded text-sm hover:bg-blue-600 transition-colors ${s.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}" ${s.status !== 'available' ? 'disabled' : ''}>
        Launch
      </button>
    </div>
  `).join('');
}

function launchService(serviceId) {
  const service = servicesData.services?.find(s => s.id === serviceId);
  if (!service) return;
  alert(`Launching ${service.name}...\n\nIn production, this would open: ${service.path}`);
}

/**
 * Render Automations Hub
 */
function renderAutomations() {
  const container = document.getElementById('automations-grid');
  if (!container || !automationsData.automations) return;
  
  container.innerHTML = automationsData.automations.map(a => `
    <div class="card rounded-lg p-4">
      <div class="flex justify-between items-start mb-2">
        <div class="font-medium">${a.name}</div>
        <span class="text-xs px-2 py-0.5 rounded ${a.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}">${a.status}</span>
      </div>
      <div class="text-sm text-gray-400 mb-2">${a.schedule}</div>
      <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <div>Runs: ${a.runCount}</div>
        <div>Success: ${a.successRate}%</div>
      </div>
      <div class="text-xs text-gray-400">Last: ${new Date(a.lastRun).toLocaleString()}</div>
      <div class="text-xs text-accent-blue mt-1">Next: ${a.nextAction}</div>
    </div>
  `).join('');
  
  // Update stats
  const stats = automationsData.stats || {};
  const totalEl = document.getElementById('auto-total');
  const activeEl = document.getElementById('auto-active');
  const runsEl = document.getElementById('auto-total-runs');
  const successEl = document.getElementById('auto-success-rate');
  
  if (totalEl) totalEl.textContent = stats.totalAutomations || 0;
  if (activeEl) activeEl.textContent = stats.active || 0;
  if (runsEl) runsEl.textContent = stats.totalRuns || 0;
  if (successEl) successEl.textContent = `${stats.avgSuccessRate || 0}%`;
}

// ==================== Integration Hooks ====================

// Store reference to original functions before overriding
const _originalInitDashboard = window.initDashboard;

// Override initDashboard to load new data
window.initDashboard = async function() {
  // Load new data files
  await Promise.all([
    loadCRMData(),
    loadPipelineData(),
    loadUsageData(),
    loadServicesData(),
    loadAutomationsData()
  ]);
  
  console.log('[Nox Dashboard] CRM, Pipeline, Usage, Services, Automations data loaded');
  
  // Call original init
  if (_originalInitDashboard) {
    await _originalInitDashboard();
  }
};

console.log('[Nox Dashboard] Batch 1 features loaded: CRM, Pipeline, Usage, Services, Automations');
