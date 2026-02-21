/**
 * BBS Feature Explorer
 * Interactive showcase of BBS mod features and capabilities
 */

class BBSFeatureExplorer {
    constructor() {
        this.features = [
            {
                id: 'camera-system',
                name: 'Camera System',
                icon: '📹',
                category: 'Core',
                description: 'Advanced camera paths with keyframe animation',
                capabilities: [
                    'Bezier curve interpolation',
                    'FOV and roll control',
                    'Smooth acceleration/deceleration',
                    'Multiple camera presets'
                ],
                useCase: 'Cinematic fly-throughs of builds'
            },
            {
                id: 'replay-system',
                name: 'Replay Recording',
                icon: '🎬',
                category: 'Core',
                description: 'Record and playback actor movements',
                capabilities: [
                    'Record player actions in real-time',
                    'Attach replays to other replays',
                    'Loop and reverse playback',
                    'Edit timing post-recording'
                ],
                useCase: 'Create complex multi-actor scenes'
            },
            {
                id: 'audio-sync',
                name: 'Audio Synchronization',
                icon: '🎵',
                category: 'Production',
                description: 'Sync animations to audio tracks',
                capabilities: [
                    'Import audio files',
                    'Visual waveform display',
                    'Keyframe audio events',
                    'Export with audio mix'
                ],
                useCase: 'Music videos and rhythmic animations'
            },
            {
                id: 'particles',
                name: 'Particle Effects',
                icon: '✨',
                category: 'Effects',
                description: 'Custom particle systems for atmosphere',
                capabilities: [
                    'Built-in particle library',
                    'Custom particle parameters',
                    'Attach to actors or world',
                    'Timing control'
                ],
                useCase: 'Magic spells, environment effects'
            },
            {
                id: 'texture-editor',
                name: 'Texture Editor',
                icon: '🎨',
                category: 'Assets',
                description: 'Basic texture editing for models',
                capabilities: [
                    'Edit model textures in-app',
                    'Quick color adjustments',
                    'Texture swapping',
                    'Export edited textures'
                ],
                useCase: 'Quick fixes without leaving Minecraft'
            },
            {
                id: 'model-import',
                name: 'Blockbench Import',
                icon: '📦',
                category: 'Assets',
                description: 'Import custom models from Blockbench',
                capabilities: [
                    'Direct .bbmodel import',
                    'Animated model support',
                    'Texture auto-mapping',
                    'Scale and rotation controls'
                ],
                useCase: 'Custom characters, props, vehicles'
            }
        ];
        this.selectedFeature = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="bbs-feature-explorer">
                <div class="feature-explorer-header">
                    <div class="explorer-title">
                        <span class="explorer-icon">🎥</span>
                        <h3>BBS Feature Explorer</h3>
                    </div>
                    <span class="explorer-badge">6 Features</span>
                </div>

                <div class="category-filters" id="category-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="Core">Core</button>
                    <button class="filter-btn" data-filter="Production">Production</button>
                    <button class="filter-btn" data-filter="Effects">Effects</button>
                    <button class="filter-btn" data-filter="Assets">Assets</button>
                </div>

                <div class="features-grid" id="features-grid">
                    ${this.features.map(f => this.renderFeatureCard(f)).join('')}
                </div>

                <div class="feature-detail-panel hidden" id="feature-detail-panel">
                    <div class="detail-header">
                        <button onclick="bbsFeatureExplorer.closeDetail()" class="back-btn">← Back</button>
                    </div>
                    <div id="feature-detail-content"></div>
                </div>

                <div class="explorer-footer">
                    <div class="compatibility-note">
                        <span class="note-icon">💻</span>
                        <span class="note-text">
                            <strong>Forge Users:</strong> Use Sinytra Connector to run BBS (Fabric) on Forge. 
                            Blockbuster addon bridges CustomNPCs with BBS models.
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers for features
        this.features.forEach(f => {
            const card = document.getElementById(`feature-card-${f.id}`);
            if (card) {
                card.onclick = () => this.showDetail(f);
            }
        });

        // Add filter handlers
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterFeatures(btn.dataset.filter);
            };
        });
    }

    renderFeatureCard(feature) {
        return `
            <div class="feature-explorer-card ${feature.category.toLowerCase()}" 
                 id="feature-card-${feature.id}" 
                 data-category="${feature.category}">
                <div class="explorer-card-header">
                    <span class="explorer-card-icon">${feature.icon}</span>
                    <span class="explorer-card-category">${feature.category}</span>
                </div>
                <h4 class="explorer-card-name">${feature.name}</h4>
                <p class="explorer-card-desc">${feature.description}</p>
                
                <div class="explorer-card-footer">
                    <span class="explorer-card-capabilities">${feature.capabilities.length} capabilities</span>
                    <span class="explorer-card-view">Explore →</span>
                </div>
            </div>
        `;
    }

    filterFeatures(category) {
        const cards = document.querySelectorAll('.feature-explorer-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showDetail(feature) {
        this.selectedFeature = feature;
        const grid = document.getElementById('features-grid');
        const filters = document.getElementById('category-filters');
        const panel = document.getElementById('feature-detail-panel');
        const content = document.getElementById('feature-detail-content');

        if (grid) grid.classList.add('hidden');
        if (filters) filters.classList.add('hidden');
        if (panel) panel.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="explorer-detail-hero">
                    <span class="explorer-detail-icon">${feature.icon}</span>
                    <h2>${feature.name}</h2>
                    <span class="explorer-detail-category">${feature.category}</span>
                    <p class="explorer-detail-desc">${feature.description}</p>
                </div>

                <div class="capabilities-section">
                    <h4>✅ Capabilities</h4>
                    <ul class="capabilities-list">
                        ${feature.capabilities.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>

                <div class="use-case-box">
                    <h4>🎯 Use Case</h4>
                    <p>${feature.useCase}</p>
                </div>
            `;
        }
    }

    closeDetail() {
        const grid = document.getElementById('features-grid');
        const filters = document.getElementById('category-filters');
        const panel = document.getElementById('feature-detail-panel');

        if (grid) grid.classList.remove('hidden');
        if (filters) filters.classList.remove('hidden');
        if (panel) panel.classList.add('hidden');
        this.selectedFeature = null;
    }

    destroy() {
        this.selectedFeature = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bbs-feature-explorer');
    if (container) {
        window.bbsFeatureExplorer = new BBSFeatureExplorer();
        window.bbsFeatureExplorer.render('bbs-feature-explorer');
    }
});

window.BBSFeatureExplorer = BBSFeatureExplorer;
