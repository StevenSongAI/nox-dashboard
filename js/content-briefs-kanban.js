/**
 * Content Briefs Kanban Widget
 * Dashboard component for managing YouTube content briefs
 */

class ContentBriefsKanban {
    constructor() {
        this.columns = {
            'idea': { label: '💡 Idea', color: '#64748b' },
            'script-ready': { label: '📝 Script Ready', color: '#3b82f6' },
            'in-production': { label: '🎬 In Production', color: '#f59e0b' },
            'published': { label: '✅ Published', color: '#10b981' },
            'archived': { label: '📁 Archived', color: '#475569' }
        };
        this.briefs = [];
        this.draggedCard = null;
        this.storageKey = 'nox-kanban-state';
        this.statusOverrides = {};
    }

    // Persistence Layer - localStorage sync
    loadKanbanState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const state = JSON.parse(saved);
                this.statusOverrides = state.statusOverrides || {};
                console.log('[Kanban] Loaded state from localStorage:', Object.keys(this.statusOverrides).length, 'overrides');
            }
        } catch (e) {
            console.error('[Kanban] Failed to load state:', e);
            this.statusOverrides = {};
        }
    }

    saveKanbanState() {
        try {
            const state = {
                statusOverrides: this.statusOverrides,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            console.log('[Kanban] Saved state to localStorage');
        } catch (e) {
            console.error('[Kanban] Failed to save state:', e);
        }
    }

    applyStatusOverrides() {
        // Merge localStorage overrides with JSON data
        this.briefs = this.briefs.map(brief => {
            if (this.statusOverrides[brief.id]) {
                return { ...brief, status: this.statusOverrides[brief.id] };
            }
            return brief;
        });
    }

    clearKanbanState() {
        this.statusOverrides = {};
        localStorage.removeItem(this.storageKey);
        console.log('[Kanban] State cleared');
        this.render('content-briefs-kanban');
    }

    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Load persisted state first
        this.loadKanbanState();

        // Fetch content briefs from data
        this.briefs = await this.fetchBriefs();

        // Apply localStorage overrides to JSON data
        this.applyStatusOverrides();

        // Group by status
        const grouped = this.groupByStatus(this.briefs);

        container.innerHTML = `
            <div class="briefs-kanban">
                <div class="kanban-header">
                    <h3>🎬 Content Briefs Pipeline</h3>
                    <span class="kanban-count">${this.briefs.length} briefs</span>
                </div>
                <div class="kanban-board">
                    ${Object.entries(this.columns).map(([status, config]) => `
                        <div class="kanban-column" data-status="${status}">
                            <div class="column-header" style="border-color: ${config.color}">
                                <span class="column-title">${config.label}</span>
                                <span class="column-count" data-count="${status}">${grouped[status]?.length || 0}</span>
                            </div>
                            <div class="column-cards" data-column="${status}">
                                ${(grouped[status] || []).map(brief => this.renderCard(brief)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Initialize drag and drop
        this.initDragAndDrop();
    }

    async fetchBriefs() {
        try {
            const response = await fetch('data/youtube.json');
            const data = await response.json();
            return data.contentBriefs || [];
        } catch (e) {
            console.error('Failed to load content briefs:', e);
            return [];
        }
    }

    groupByStatus(briefs) {
        const grouped = {};
        briefs.forEach(brief => {
            const status = brief.status || 'idea';
            if (!grouped[status]) grouped[status] = [];
            grouped[status].push(brief);
        });
        return grouped;
    }

    renderCard(brief) {
        const priorityColor = {
            'HIGH': '#ef4444',
            'MEDIUM': '#f59e0b',
            'LOW': '#64748b'
        }[brief.priority] || '#64748b';

        return `
            <div class="kanban-card" draggable="true" data-id="${brief.id}" data-status="${brief.status || 'idea'}">
                <div class="card-priority" style="background: ${priorityColor}">${brief.priority || 'MEDIUM'}</div>
                <div class="card-title">${brief.title}</div>
                <div class="card-meta">
                    <span class="card-niche">${brief.niche || 'General'}</span>
                    ${brief.targetLength ? `<span class="card-length">${brief.targetLength}</span>` : ''}
                </div>
                ${brief.hook ? `<div class="card-hook" title="${brief.hook}">${brief.hook.substring(0, 80)}...</div>` : ''}
                <div class="card-footer">
                    <span class="card-date">${new Date(brief.dateAdded).toLocaleDateString()}</span>
                    <button class="card-expand" onclick="contentBriefsKanban.showDetail('${brief.id}')">Details →</button>
                </div>
            </div>
        `;
    }

    initDragAndDrop() {
        // Card drag events
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                this.draggedCard = null;
                document.querySelectorAll('.kanban-column').forEach(col => {
                    col.classList.remove('drag-over');
                });
            });
        });

        // Column drop events
        document.querySelectorAll('.column-cards').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.closest('.kanban-column').classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.closest('.kanban-column').classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const columnEl = column.closest('.kanban-column');
                columnEl.classList.remove('drag-over');
                
                const newStatus = column.dataset.column;
                const briefId = e.dataTransfer.getData('text/plain');
                
                if (this.draggedCard && newStatus) {
                    // Move card to new column
                    column.appendChild(this.draggedCard);
                    this.draggedCard.dataset.status = newStatus;
                    
                    // Update counts
                    this.updateColumnCounts();
                    
                    // Save the change (in-memory for now, persist to backend later)
                    this.updateBriefStatus(briefId, newStatus);
                    
                    // Visual feedback
                    this.draggedCard.classList.add('dropped');
                    setTimeout(() => {
                        if (this.draggedCard) this.draggedCard.classList.remove('dropped');
                    }, 300);
                }
            });
        });
    }

    updateColumnCounts() {
        document.querySelectorAll('.column-cards').forEach(column => {
            const status = column.dataset.column;
            const count = column.querySelectorAll('.kanban-card').length;
            const countEl = document.querySelector(`.column-count[data-count="${status}"]`);
            if (countEl) countEl.textContent = count;
        });
    }

    updateBriefStatus(briefId, newStatus) {
        const brief = this.briefs.find(b => b.id === briefId);
        if (brief) {
            brief.status = newStatus;

            // Persist to localStorage immediately
            this.statusOverrides[briefId] = newStatus;
            this.saveKanbanState();

            console.log(`[Kanban] Updated brief ${briefId} to status: ${newStatus} (saved to localStorage)`);

            // Emit event for external sync
            window.dispatchEvent(new CustomEvent('briefStatusChanged', {
                detail: { briefId, newStatus, brief, persisted: true }
            }));
        }
    }

    showDetail(briefId) {
        // Emit event for detail view
        window.dispatchEvent(new CustomEvent('showBriefDetail', { detail: { briefId } }));
    }
}

window.ContentBriefsKanban = ContentBriefsKanban;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('content-briefs-kanban');
    if (container) {
        window.contentBriefsKanban = new ContentBriefsKanban();
        window.contentBriefsKanban.render('content-briefs-kanban');
    }
});
