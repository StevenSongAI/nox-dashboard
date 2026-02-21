/**
 * Minecraft Snapshot Comparison Tool
 * Compare features across different 26.1 snapshots
 */

class SnapshotComparator {
    constructor() {
        this.snapshots = [
            {
                id: '26w05a',
                name: '26w05a',
                date: 'Jan 28, 2026',
                majorFeatures: ['Golden Dandelions', 'Baby Aquatic Mob Textures'],
                minorFeatures: ['Bug fixes', 'Performance improvements'],
                type: 'minor'
            },
            {
                id: '26w06a',
                name: '26w06a',
                date: 'Feb 4, 2026',
                majorFeatures: ['7 Baby Mob Textures', 'World Data Format Revamp'],
                minorFeatures: ['Armadillo, Bee, Camel, Fox, Goat, Polar Bear, Llama'],
                type: 'major'
            },
            {
                id: '26w07a',
                name: '26w07a',
                date: 'Feb 11, 2026',
                majorFeatures: ['Adult Sound Variants', 'Baby Texture Updates'],
                minorFeatures: ['Zombies, Piglins, Villagers', 'Trading improvements'],
                type: 'major'
            },
            {
                id: '26w08a',
                name: '26w08a (Snapshot 8)',
                date: 'Feb 17, 2026',
                majorFeatures: ['Final Baby Mobs', 'Stonecutter Recipes'],
                minorFeatures: ['Hoglin, Panda, Sniffer, Strider, Zoglin'],
                type: 'major'
            }
        ];
        this.selectedSnapshots = [];
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="snapshot-comparator">
                <div class="comparator-header">
                    <div class="comparator-title">
                        <span class="comparator-icon">📊</span>
                        <h3>Snapshot Comparator</h3>
                    </div>
                    <span class="comparator-badge">26.1 Series</span>
                </div>

                <div class="comparator-instructions">
                    Select 2 snapshots to compare features
                </div>

                <div class="snapshot-selector" id="snapshot-selector">
                    ${this.snapshots.map(s => this.renderSnapshotCard(s)).join('')}
                </div>

                <div class="comparison-view hidden" id="comparison-view">
                    <div class="comparison-header">
                        <button onclick="snapshotComparator.clearSelection()" class="clear-btn">← Back</button>
                        <h4>Comparison Results</h4>
                    </div>
                    <div id="comparison-content"></div>
                </div>

                <div class="comparator-footer">
                    <div class="snapshot-timeline">
                        <div class="timeline-bar">
                            ${this.snapshots.map((s, i) => `
                                <div class="timeline-point ${s.type}" style="left: ${(i / (this.snapshots.length - 1)) * 100}%">
                                    <span class="point-label">${s.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.snapshots.forEach(s => {
            const card = document.getElementById(`snapshot-card-${s.id}`);
            if (card) {
                card.onclick = () => this.toggleSelection(s);
            }
        });
    }

    renderSnapshotCard(snapshot) {
        return `
            <div class="snapshot-card ${snapshot.type}" id="snapshot-card-${snapshot.id}" data-id="${snapshot.id}">
                <div class="snapshot-card-header">
                    <span class="snapshot-name">${snapshot.name}</span>
                    <span class="snapshot-type-badge ${snapshot.type}">${snapshot.type}</span>
                </div>
                <div class="snapshot-date">${snapshot.date}</div>
                
                <div class="snapshot-features">
                    <div class="feature-list">
                        ${snapshot.majorFeatures.map(f => `<span class="feature-tag major">${f}</span>`).join('')}
                    </div>
                </div>
                
                <div class="snapshot-select-hint">Click to select</div>
            </div>
        `;
    }

    toggleSelection(snapshot) {
        const index = this.selectedSnapshots.findIndex(s => s.id === snapshot.id);
        const card = document.getElementById(`snapshot-card-${snapshot.id}`);

        if (index > -1) {
            // Deselect
            this.selectedSnapshots.splice(index, 1);
            if (card) card.classList.remove('selected');
        } else if (this.selectedSnapshots.length < 2) {
            // Select
            this.selectedSnapshots.push(snapshot);
            if (card) card.classList.add('selected');
        }

        // Show comparison if 2 selected
        if (this.selectedSnapshots.length === 2) {
            this.showComparison();
        }
    }

    showComparison() {
        const selector = document.getElementById('snapshot-selector');
        const view = document.getElementById('comparison-view');
        const content = document.getElementById('comparison-content');

        if (selector) selector.classList.add('hidden');
        if (view) view.classList.remove('hidden');

        const [s1, s2] = this.selectedSnapshots;

        if (content) {
            content.innerHTML = `
                <div class="comparison-grid">
                    <div class="comparison-col">
                        <div class="col-header">
                            <span class="col-name">${s1.name}</span>
                            <span class="col-date">${s1.date}</span>
                        </div>
                        <div class="col-features">
                            <h5>Major Features</h5>
                            <ul>${s1.majorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
                            
                            <h5>Minor Features</h5>
                            <ul>${s1.minorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
                        </div>
                    </div>

                    <div class="comparison-vs">VS</div>

                    <div class="comparison-col">
                        <div class="col-header">
                            <span class="col-name">${s2.name}</span>
                            <span class="col-date">${s2.date}</span>
                        </div>
                        <div class="col-features">
                            <h5>Major Features</h5>
                            <ul>${s2.majorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
                            
                            <h5>Minor Features</h5>
                            <ul>${s2.minorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
                        </div>
                    </div>
                </div>

                <div class="comparison-insight">
                    <h5>💡 Content Opportunity</h5>
                    <p>Compare ${s1.name} vs ${s2.name}: "What Changed in 2 Weeks?" video showcasing the evolution of baby mobs.</p>
                </div>
            `;
        }
    }

    clearSelection() {
        this.selectedSnapshots = [];
        
        // Remove selected class from all cards
        this.snapshots.forEach(s => {
            const card = document.getElementById(`snapshot-card-${s.id}`);
            if (card) card.classList.remove('selected');
        });

        const selector = document.getElementById('snapshot-selector');
        const view = document.getElementById('comparison-view');

        if (selector) selector.classList.remove('hidden');
        if (view) view.classList.add('hidden');
    }

    destroy() {
        this.selectedSnapshots = [];
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('snapshot-comparator');
    if (container) {
        window.snapshotComparator = new SnapshotComparator();
        window.snapshotComparator.render('snapshot-comparator');
    }
});

window.SnapshotComparator = SnapshotComparator;
