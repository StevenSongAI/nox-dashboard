/**
 * Create Mod 6.0 Feature Explorer
 * Interactive widget showcasing Create Mod 6.0 features for content planning
 */

class CreateModExplorer {
    constructor() {
        this.features = [
            {
                id: 'datapack-driven',
                title: 'Datapack-Driven Customization',
                icon: '📦',
                description: 'Everything customizable via datapacks — no Java modding required',
                contentAngles: [
                    'Show before/after: custom contraptions without coding',
                    'Create your own custom blocks visually',
                    'Datapack tutorial for non-programmers'
                ],
                difficulty: 'Medium',
                viralPotential: 'High'
            },
            {
                id: 'version-filtering',
                title: 'Version Filtering',
                icon: '🔍',
                description: 'Search schematics by Minecraft & Create mod versions',
                contentAngles: [
                    'Finding compatible schematics for your version',
                    'Version compatibility guide 2026',
                    'Best schematics for Create 6.0.9'
                ],
                difficulty: 'Easy',
                viralPotential: 'Medium'
            },
            {
                id: 'profile-improvements',
                title: 'Profile & Schematic Fixes',
                icon: '👤',
                description: 'Fixed capital letters in usernames, avatar icons, schematic display',
                contentAngles: [
                    'Showcase your schematics properly now',
                    'Building a Create portfolio on CreateMod.com',
                    'Share rate increased with new fixes'
                ],
                difficulty: 'Easy',
                viralPotential: 'Low'
            },
            {
                id: 'neoforge-support',
                title: 'NeoForge Support',
                icon: '⚙️',
                description: 'Native NeoForge support for MC 1.21.1 (Create 6.0.9)',
                contentAngles: [
                    'NeoForge vs Forge: Which for Create 6.0?',
                    'Migrating Create world to NeoForge',
                    'Performance comparison video'
                ],
                difficulty: 'Hard',
                viralPotential: 'High'
            },
            {
                id: 'render-modes',
                title: 'Custom Render Modes',
                icon: '🎨',
                description: 'Add new visual render modes with datapacks',
                contentAngles: [
                    'Stunning visual contraptions with custom renders',
                    'Before/after: default vs custom render modes',
                    'Cinematic showcase of possibilities'
                ],
                difficulty: 'Hard',
                viralPotential: 'Very High'
            }
        ];
        this.selectedFeature = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="create-explorer">
                <div class="create-header">
                    <div class="create-title">
                        <span class="create-icon">⚙️</span>
                        <h3>Create Mod 6.0 Explorer</h3>
                    </div>
                    <span class="create-badge">Latest: 6.0.9</span>
                </div>

                <div class="create-versions">
                    <span class="version-pill active">1.21.1 (NeoForge)</span>
                    <span class="version-pill">1.20.1 (Forge)</span>
                </div>

                <div class="create-features" id="create-features-list">
                    ${this.features.map(f => this.renderFeatureCard(f)).join('')}
                </div>

                <div class="create-detail hidden" id="create-detail-panel">
                    <div class="detail-header">
                        <button onclick="createModExplorer.closeDetail()" class="detail-back">← Back</button>
                    </div>
                    <div id="create-detail-content"></div>
                </div>

                <div class="create-stats">
                    <div class="stat-item">
                        <span class="stat-num">${this.features.length}</span>
                        <span class="stat-label">Major Features</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-num">${this.features.filter(f => f.viralPotential === 'High' || f.viralPotential === 'Very High').length}</span>
                        <span class="stat-label">High Viral Potential</span>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.features.forEach(f => {
            const card = document.getElementById(`create-feature-${f.id}`);
            if (card) {
                card.onclick = () => this.showDetail(f);
            }
        });
    }

    renderFeatureCard(feature) {
        return `
            <div class="create-feature-card" id="create-feature-${feature.id}">
                <div class="feature-header">
                    <span class="feature-icon">${feature.icon}</span>
                    <span class="feature-potential ${feature.viralPotential.toLowerCase().replace(' ', '-')}">${feature.viralPotential}</span>
                </div>
                <h4 class="feature-title">${feature.title}</h4>
                <p class="feature-desc">${feature.description}</p>
                
                <div class="feature-meta">
                    <span class="feature-difficulty">${feature.difficulty}</span>
                    <span class="feature-cta">Explore →</span>
                </div>
            </div>
        `;
    }

    showDetail(feature) {
        this.selectedFeature = feature;
        const list = document.getElementById('create-features-list');
        const detail = document.getElementById('create-detail-panel');
        const content = document.getElementById('create-detail-content');

        if (list) list.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero">
                    <span class="detail-icon">${feature.icon}</span>
                    <h2>${feature.title}</h2>
                    <p>${feature.description}</p>
                </div>

                <div class="detail-section">
                    <h4>🎬 Content Angles</h4>
                    <ul class="detail-angles">
                        ${feature.contentAngles.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>

                <div class="detail-meta-grid">
                    <div class="detail-meta-item">
                        <span class="meta-label">Difficulty</span>
                        <span class="meta-value ${feature.difficulty.toLowerCase()}">${feature.difficulty}</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="meta-label">Viral Potential</span>
                        <span class="meta-value ${feature.viralPotential.toLowerCase().replace(' ', '-')}">${feature.viralPotential}</span>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="action-btn primary" onclick="window.open('https://createmod.com/', '_blank')">
                        Visit CreateMod.com →
                    </button>
                    <button class="action-btn" onclick="window.open('https://wiki.createmod.net/', '_blank')">
                        Open Wiki →
                    </button>
                </div>
            `;
        }
    }

    closeDetail() {
        const list = document.getElementById('create-features-list');
        const detail = document.getElementById('create-detail-panel');

        if (list) list.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedFeature = null;
    }

    destroy() {
        this.selectedFeature = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('create-mod-explorer');
    if (container) {
        window.createModExplorer = new CreateModExplorer();
        window.createModExplorer.render('create-mod-explorer');
    }
});

window.CreateModExplorer = CreateModExplorer;
