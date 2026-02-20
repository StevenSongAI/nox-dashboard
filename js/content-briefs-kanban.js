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
    }

    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Fetch content briefs from data
        const briefs = await this.fetchBriefs();
        
        // Group by status
        const grouped = this.groupByStatus(briefs);

        container.innerHTML = `
            <div class="briefs-kanban">
                <div class="kanban-header">
                    <h3>🎬 Content Briefs Pipeline</h3>
                    <span class="kanban-count">${briefs.length} briefs</span>
                </div>
                <div class="kanban-board">
                    ${Object.entries(this.columns).map(([status, config]) => `
                        <div class="kanban-column" data-status="${status}">
                            <div class="column-header" style="border-color: ${config.color}">
                                <span class="column-title">${config.label}</span>
                                <span class="column-count">${grouped[status]?.length || 0}</span>
                            </div>
                            <div class="column-cards">
                                ${(grouped[status] || []).map(brief => this.renderCard(brief)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
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
            <div class="kanban-card" data-id="${brief.id}">
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
