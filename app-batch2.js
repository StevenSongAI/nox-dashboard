// ==================== BATCH 2: Tasks, Knowledge Base, Analytics ====================

// Data caches
let tasksData = { tasks: [], stats: {} };
let knowledgeBaseData = { stats: {}, recentSources: [], topTags: [] };
let analyticsData = { dailyStats: [], movingAverages: {}, competitorSnapshots: [], trends: {} };

/**
 * Load Tasks data from JSON
 */
async function loadTasksData() {
  try {
    const response = await fetch('data/tasks.json?v=' + Date.now());
    tasksData = await response.json();
    return tasksData;
  } catch (error) {
    console.error('[Tasks] Error loading data:', error);
    return { tasks: [], stats: {} };
  }
}

/**
 * Load Knowledge Base data from JSON
 */
async function loadKnowledgeBaseData() {
  try {
    const response = await fetch('data/knowledge-base.json?v=' + Date.now());
    knowledgeBaseData = await response.json();
    return knowledgeBaseData;
  } catch (error) {
    console.error('[Knowledge Base] Error loading data:', error);
    return { stats: {}, recentSources: [], topTags: [] };
  }
}

/**
 * Load Analytics data from JSON
 */
async function loadAnalyticsData() {
  try {
    const response = await fetch('data/analytics.json?v=' + Date.now());
    analyticsData = await response.json();
    return analyticsData;
  } catch (error) {
    console.error('[Analytics] Error loading data:', error);
    return { dailyStats: [], movingAverages: {}, competitorSnapshots: [], trends: {} };
  }
}

/**
 * Render Tasks Kanban Board
 */
function renderTasks() {
  const statusFilter = document.getElementById('tasks-status-filter')?.value || 'all';
  const priorityFilter = document.getElementById('tasks-priority-filter')?.value || 'all';
  
  // Update summary cards
  const stats = tasksData.stats || {};
  const pendingEl = document.getElementById('tasks-count-pending');
  const inProgressEl = document.getElementById('tasks-count-in_progress');
  const doneEl = document.getElementById('tasks-count-done');
  const dueTodayEl = document.getElementById('tasks-count-due-today');
  
  if (pendingEl) pendingEl.textContent = stats.byStatus?.pending || 0;
  if (inProgressEl) inProgressEl.textContent = stats.byStatus?.in_progress || 0;
  if (doneEl) doneEl.textContent = stats.byStatus?.done || 0;
  if (dueTodayEl) dueTodayEl.textContent = stats.dueToday || 0;
  
  // Render kanban columns
  const stages = ['pending', 'approved', 'in_progress', 'done'];
  
  stages.forEach(stage => {
    const container = document.getElementById(`tasks-cards-${stage}`);
    const badge = document.getElementById(`tasks-badge-${stage}`);
    if (!container) return;
    
    let tasks = tasksData.tasks?.filter(t => t.status === stage) || [];
    
    // Apply filters
    if (statusFilter !== 'all' && stage !== statusFilter) {
      tasks = [];
    }
    if (priorityFilter !== 'all') {
      tasks = tasks.filter(t => t.priority === priorityFilter);
    }
    
    if (badge) badge.textContent = tasks.length;
    
    if (tasks.length === 0) {
      container.innerHTML = `<div class="text-center text-gray-500 text-xs py-4">No tasks</div>`;
      return;
    }
    
    container.innerHTML = tasks.map(task => `
      <div class="task-card bg-dark-700 rounded p-3 cursor-pointer hover:bg-dark-600 transition-colors" onclick="showTaskDetail('${task.id}')">
        <div class="flex justify-between items-start mb-2">
          <div class="font-medium text-sm">${task.title}</div>
          <span class="text-xs px-1.5 py-0.5 rounded ${getTaskPriorityColor(task.priority)}">${task.priority}</span>
        </div>
        <div class="text-xs text-gray-400 mb-2">${task.assignee} • ${formatDate(task.dueDate)}</div>
        <div class="flex flex-wrap gap-1">
          ${(task.tags || []).slice(0, 2).map(tag => `<span class="text-xs bg-dark-800 px-1.5 py-0.5 rounded">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
  });
}

function getTaskPriorityColor(priority) {
  switch(priority) {
    case 'high': return 'bg-red-900/50 text-red-400';
    case 'medium': return 'bg-yellow-900/50 text-yellow-400';
    case 'low': return 'bg-green-900/50 text-green-400';
    default: return 'bg-gray-800 text-gray-400';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `in ${diff}d`;
}

function showTaskDetail(taskId) {
  const task = tasksData.tasks?.find(t => t.id === taskId);
  if (!task) return;
  
  document.getElementById('modal-title').textContent = task.title;
  document.getElementById('modal-content').innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><span class="text-gray-400">Status:</span> ${task.status}</div>
        <div><span class="text-gray-400">Priority:</span> <span class="${getTaskPriorityColor(task.priority)}">${task.priority}</span></div>
        <div><span class="text-gray-400">Assignee:</span> ${task.assignee}</div>
        <div><span class="text-gray-400">Due:</span> ${formatDate(task.dueDate)}</div>
        <div><span class="text-gray-400">Source:</span> ${task.source}</div>
        <div><span class="text-gray-400">Created:</span> ${new Date(task.createdAt).toLocaleDateString()}</div>
      </div>
      <div>
        <span class="text-gray-400">Description:</span>
        <p class="mt-1 text-sm">${task.description}</p>
      </div>
      <div>
        <span class="text-gray-400">Tags:</span>
        <div class="flex flex-wrap gap-2 mt-1">
          ${(task.tags || []).map(tag => `<span class="bg-dark-700 px-2 py-1 rounded text-sm">${tag}</span>`).join('')}
        </div>
      </div>
      ${task.linkedIds?.length ? `
        <div>
          <span class="text-gray-400">Linked:</span>
          <div class="flex flex-wrap gap-2 mt-1">
            ${task.linkedIds.map(id => `<span class="text-accent-blue text-sm">${id}</span>`).join(', ')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

/**
 * Render Knowledge Base
 */
function renderKnowledgeBase() {
  const stats = knowledgeBaseData.stats || {};
  const sources = knowledgeBaseData.recentSources || [];
  
  // Update stats cards
  const totalEl = document.getElementById('kb-total-sources');
  const chunksEl = document.getElementById('kb-total-chunks');
  const lastEl = document.getElementById('kb-last-added');
  const summaryEl = document.getElementById('kb-stats-summary');
  
  if (totalEl) totalEl.textContent = stats.totalSources || 0;
  if (chunksEl) chunksEl.textContent = stats.totalChunks || 0;
  if (lastEl) {
    const last = sources[0]?.addedAt;
    lastEl.textContent = last ? formatDate(last) : '-';
  }
  if (summaryEl) {
    summaryEl.textContent = `${stats.totalSources || 0} sources • ${stats.totalChunks || 0} chunks indexed`;
  }
  
  // Render tags
  const tagsContainer = document.getElementById('kb-tags');
  if (tagsContainer && knowledgeBaseData.topTags) {
    tagsContainer.innerHTML = knowledgeBaseData.topTags.map(tag => `
      <button onclick="filterKnowledgeByTag('${tag}')" class="px-2 py-1 bg-dark-700 rounded text-xs hover:bg-dark-600 transition-colors">${tag}</button>
    `).join('');
  }
  
  // Render sources list
  const listContainer = document.getElementById('kb-sources-list');
  if (listContainer) {
    if (sources.length === 0) {
      listContainer.innerHTML = `<div class="text-center text-gray-500 py-4">No sources yet</div>`;
      return;
    }
    
    listContainer.innerHTML = sources.map(source => `
      <div class="kb-source bg-dark-700 rounded p-3 hover:bg-dark-600 transition-colors">
        <div class="flex justify-between items-start mb-1">
          <div class="font-medium text-sm">${source.title}</div>
          <span class="text-xs px-1.5 py-0.5 rounded bg-dark-800">${source.sourceType}</span>
        </div>
        <div class="text-xs text-gray-400 mb-2">${source.url}</div>
        <div class="text-sm text-gray-300 mb-2">${source.summary}</div>
        <div class="flex flex-wrap gap-1">
          ${(source.tags || []).map(tag => `<span class="text-xs bg-dark-800 px-1.5 py-0.5 rounded">${tag}</span>`).join('')}
        </div>
        <div class="text-xs text-gray-500 mt-2">${source.chunkCount} chunks • Added ${formatDate(source.addedAt)}</div>
      </div>
    `).join('');
  }
}

function searchKnowledge() {
  const query = document.getElementById('kb-search')?.value;
  if (!query) return;
  alert(`RAG Search: "${query}"\n\nIn production, this would:\n1. Embed the query\n2. Search vector DB\n3. Return cited answers from knowledge base`);
}

function filterKnowledgeByTag(tag) {
  alert(`Filter by tag: ${tag}\n\nIn production, this would filter sources by the selected tag.`);
}

/**
 * Render Analytics Tab
 */
function renderAnalytics() {
  const stats = analyticsData.dailyStats || [];
  const ma = analyticsData.movingAverages || {};
  const competitors = analyticsData.competitorSnapshots || [];
  const trends = analyticsData.trends || {};
  
  // This would be enhanced with Chart.js in a full implementation
  // For now, just log that analytics data is loaded
  console.log('[Analytics] Data loaded:', {
    days: stats.length,
    views7d: ma.views7d,
    competitors: competitors.length
  });
}

// ==================== Data Loading Extension ====================

// Extend the existing load cycle
const _originalLoadBatch1 = window.loadAllData;
window.loadAllData = async function() {
  // Call original if it exists
  if (_originalLoadBatch1) {
    await _originalLoadBatch1();
  }
  
  // Load new data files
  await Promise.all([
    loadTasksData(),
    loadKnowledgeBaseData(),
    loadAnalyticsData()
  ]);
  
  console.log('[Nox Dashboard] Batch 2 data loaded: Tasks, Knowledge Base, Analytics');
};

// Render functions for tab switching
const _originalShowTabBatch1 = window.showTab;
window.showTab = function(tabId) {
  // Call original
  if (_originalShowTabBatch1) {
    _originalShowTabBatch1(tabId);
  }
  
  // Render new tabs when switched to
  setTimeout(() => {
    switch(tabId) {
      case 'tasks':
        renderTasks();
        break;
      case 'knowledge':
        renderKnowledgeBase();
        break;
      case 'analytics':
        renderAnalytics();
        break;
    }
  }, 50);
};

console.log('[Nox Dashboard] Batch 2 features loaded: Tasks, Knowledge Base, Analytics');
