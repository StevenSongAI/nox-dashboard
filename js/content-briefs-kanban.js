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
        this.modalOpen = false;
    }

    // Modal - Show full brief details
    showBriefModal(briefId) {
        const brief = this.briefs.find(b => b.id === briefId);
        if (!brief) return;

        // Create modal if it doesn't exist
        let modal = document.getElementById('brief-detail-modal');
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = 'brief-detail-modal';
            modal.className = 'brief-modal';
            modal.setAttribute('aria-labelledby', 'brief-modal-title');
            document.body.appendChild(modal);
        }

        const priorityColor = {
            'HIGH': '#ef4444',
            'MEDIUM': '#f59e0b',
            'LOW': '#64748b'
        }[brief.priority] || '#64748b';

        const statusLabel = this.columns[brief.status]?.label || '💡 Idea';
        const statusColor = this.columns[brief.status]?.color || '#64748b';

        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-meta">
                    <span class="modal-priority" style="background: ${priorityColor}">${brief.priority || 'MEDIUM'}</span>
                    <span class="modal-status" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}">${statusLabel}</span>
                    <span class="modal-niche">${brief.niche || 'General'}</span>
                </div>
                <button class="modal-close" onclick="contentBriefsKanban.closeBriefModal()" aria-label="Close">×</button>
            </div>
            <div class="modal-content">
                <h2 id="brief-modal-title" class="modal-title">${brief.title}</h2>
                
                ${brief.hook ? `
                <div class="modal-section">
                    <h4>🎣 Hook</h4>
                    <p class="modal-hook">${brief.hook}</p>
                </div>
                ` : ''}
                
                ${brief.scriptOutline ? `
                <div class="modal-section">
                    <h4>📝 Script Outline</h4>
                    <div class="modal-script">${brief.scriptOutline.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                
                <div class="modal-grid">
                    ${brief.targetLength ? `
                    <div class="modal-field">
                        <span class="field-label">⏱️ Target Length</span>
                        <span class="field-value">${brief.targetLength}</span>
                    </div>
                    ` : ''}
                    ${brief.estimatedViews ? `
                    <div class="modal-field">
                        <span class="field-label">👁️ Est. Views</span>
                        <span class="field-value">${brief.estimatedViews}</span>
                    </div>
                    ` : ''}
                    ${brief.outlierScore ? `
                    <div class="modal-field">
                        <span class="field-label">🔥 Outlier Score</span>
                        <span class="field-value">${brief.outlierScore}/100</span>
                    </div>
                    ` : ''}
                </div>
                
                ${brief.tags?.length ? `
                <div class="modal-section">
                    <h4>🏷️ Tags</h4>
                    <div class="modal-tags">
                        ${brief.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${brief.referenceUrls?.length ? `
                <div class="modal-section">
                    <h4>🔗 References</h4>
                    <ul class="modal-links">
                        ${brief.referenceUrls.map(url => `<li><a href="${url}" target="_blank" rel="noopener">${url}</a></li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${brief.notes ? `
                <div class="modal-section">
                    <h4>📝 Notes</h4>
                    <p class="modal-notes">${brief.notes}</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <span class="modal-date">Added: ${new Date(brief.dateAdded).toLocaleDateString()}</span>
                ${brief.outlierId ? `<span class="modal-outlier">Based on: ${brief.outlierId}</span>` : ''}
            </div>
        `;

        // Show modal
        modal.showModal();
        this.modalOpen = true;

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBriefModal();
            }
        });

        // Close on ESC (native dialog behavior)
        modal.addEventListener('close', () => {
            this.modalOpen = false;
        });

        console.log('[Kanban] Opened modal for brief:', briefId);
    }

    closeBriefModal() {
        const modal = document.getElementById('brief-detail-modal');
        if (modal) {
            modal.close();
            this.modalOpen = false;
        }
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

    // Export/Import functionality
    exportKanbanState() {
        try {
            const state = {
                statusOverrides: this.statusOverrides,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
            const downloadAnchor = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `nox-kanban-backup-${dateStr}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            console.log('[Kanban] State exported');
        } catch (e) {
            console.error('[Kanban] Failed to export state:', e);
            alert('Export failed. See console for details.');
        }
    }

    importKanbanState(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.statusOverrides) {
                    this.statusOverrides = imported.statusOverrides;
                    this.saveKanbanState();
                    console.log('[Kanban] State imported:', Object.keys(this.statusOverrides).length, 'overrides');
                    this.render('content-briefs-kanban');
                    alert(`Imported ${Object.keys(this.statusOverrides).length} status overrides.`);
                } else {
                    alert('Invalid file format: missing statusOverrides');
                }
            } catch (err) {
                console.error('[Kanban] Failed to import state:', err);
                alert('Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    triggerImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                this.importKanbanState(e.target.files[0]);
            }
        };
        input.click();
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
                    <div class="kanban-header-left">
                        <h3>🎬 Content Briefs Pipeline</h3>
                        <span class="kanban-count">${this.briefs.length} briefs</span>
                    </div>
                    <div class="kanban-actions">
                        <button class="kanban-btn export-btn" onclick="contentBriefsKanban.exportKanbanState()" title="Export status overrides to JSON">
                            📥 Export
                        </button>
                        <button class="kanban-btn import-btn" onclick="contentBriefsKanban.triggerImport()" title="Import status overrides from JSON">
                            📤 Import
                        </button>
                        <button class="kanban-btn clear-btn" onclick="if(confirm('Clear all status overrides?')) contentBriefsKanban.clearKanbanState()" title="Clear localStorage state">
                            🗑️ Clear
                        </button>
                    </div>
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
        // Open modal with full brief details
        this.showBriefModal(briefId);
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
