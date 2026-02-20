/**
 * Animation Tools Comparison Widget
 * Dashboard component for comparing Minecraft animation tools
 */

class AnimationToolsComparison {
    constructor() {
        this.tools = [
            {
                id: "bbs",
                name: "BBS Studio",
                type: "Mod",
                version: "1.7.7",
                mcVersion: "1.20.1/1.20.4",
                category: "Professional",
                features: {
                    keyframeAnimation: true,
                    customModels: true,
                    cameraControl: true,
                    particleEffects: true,
                    audioSync: true,
                    sceneManagement: true,
                    realTimePreview: true,
                    multiplayer: false
                },
                learningCurve: "Steep",
                renderQuality: "High",
                community: "Active",
                price: "Free",
                bestFor: "Cinematic productions, complex scenes",
                pros: ["Full 3D animation", "Custom model support", "Advanced camera work", "Particle systems"],
                cons: ["High learning curve", "Single-player only", "Resource intensive"],
                workflow: "Setup → Animate → Render → Post-process",
                outputFormat: "Video recording + scene files",
                lastUpdated: "2026-02-20"
            },
            {
                id: "replaymod",
                name: "Replay Mod",
                type: "Mod",
                version: "2.6.15",
                mcVersion: "1.8-1.21",
                category: "Recording",
                features: {
                    keyframeAnimation: true,
                    customModels: false,
                    cameraControl: true,
                    particleEffects: false,
                    audioSync: false,
                    sceneManagement: true,
                    realTimePreview: false,
                    multiplayer: true
                },
                learningCurve: "Medium",
                renderQuality: "High",
                community: "Large",
                price: "Free",
                bestFor: "Gameplay recording, time-lapses, flyovers",
                pros: ["Records actual gameplay", "Multiplayer compatible", "Smooth camera paths", "Wide version support"],
                cons: ["No custom animations", "No particle control", "Post-recording only"],
                workflow: "Record → Edit camera → Render",
                outputFormat: "Video file",
                lastUpdated: "2026-02-20"
            },
            {
                id: "minema",
                name: "Minema",
                type: "Mod",
                version: "3.7.1",
                mcVersion: "1.12-1.20",
                category: "Recording",
                features: {
                    keyframeAnimation: false,
                    customModels: false,
                    cameraControl: true,
                    particleEffects: false,
                    audioSync: false,
                    sceneManagement: false,
                    realTimePreview: false,
                    multiplayer: true
                },
                learningCurve: "Low",
                renderQuality: "Very High",
                community: "Small",
                price: "Free",
                bestFor: "High-quality footage capture, shader showcase",
                pros: ["Extremely smooth recording", "High FPS output", "Minimal overhead"],
                cons: ["No animation features", "Camera only", "Dated interface"],
                workflow: "Setup → Record raw footage",
                outputFormat: "Raw frames/video",
                lastUpdated: "2026-02-20"
            },
            {
                id: "blockbuster",
                name: "Blockbuster (Legacy)",
                type: "Mod (Discontinued)",
                version: "2.3.1",
                mcVersion: "1.12.2",
                category: "Legacy",
                features: {
                    keyframeAnimation: true,
                    customModels: true,
                    cameraControl: true,
                    particleEffects: true,
                    audioSync: true,
                    sceneManagement: true,
                    realTimePreview: true,
                    multiplayer: false
                },
                learningCurve: "Steep",
                renderQuality: "Medium",
                community: "Legacy only",
                price: "Free (Discontinued)",
                bestFor: "Legacy content, old tutorials",
                pros: ["Historic standard", "Extensive tutorials"],
                cons: ["Discontinued", "Old MC version only", "Superseded by BBS"],
                workflow: "Similar to BBS but legacy",
                outputFormat: "Video + project files",
                lastUpdated: "2026-02-20"
            },
            {
                id: "higgsfield",
                name: "Higgsfield",
                type: "External",
                version: "Cloud",
                mcVersion: "N/A (AI-generated)",
                category: "AI-Powered",
                features: {
                    keyframeAnimation: true,
                    customModels: true,
                    cameraControl: true,
                    particleEffects: true,
                    audioSync: true,
                    sceneManagement: true,
                    realTimePreview: false,
                    multiplayer: false
                },
                learningCurve: "Low",
                renderQuality: "High",
                community: "Growing",
                price: "$20-50/video",
                bestFor: "Quick productions, viral content, automation",
                pros: ["AI-powered", "Fast iteration", "No MC setup", "Cloud rendering"],
                cons: ["Subscription cost", "Less control", "AI limitations", "Not real Minecraft"],
                workflow: "Upload → AI generates → Edit → Export",
                outputFormat: "MP4/WebM",
                lastUpdated: "2026-02-20"
            },
            {
                id: "mineimator",
                name: "Mine-imator",
                type: "Standalone",
                version: "2.0",
                mcVersion: "N/A (External)",
                category: "Beginner",
                features: {
                    keyframeAnimation: true,
                    customModels: true,
                    cameraControl: true,
                    particleEffects: true,
                    audioSync: true,
                    sceneManagement: true,
                    realTimePreview: true,
                    multiplayer: false
                },
                learningCurve: "Low",
                renderQuality: "Medium",
                community: "Active",
                price: "Free",
                bestFor: "Beginners, quick animations, memes",
                pros: ["Easy to learn", "Standalone (no MC needed)", "Active community", "Free"],
                cons: ["Lower quality than in-game", "Not real Minecraft", "Limited assets"],
                workflow: "Build scene → Animate → Export",
                outputFormat: "MP4/GIF",
                lastUpdated: "2026-02-20"
            }
        ];
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="anim-tools-header">
                <h2>Minecraft Animation Tools Comparison</h2>
                <div class="anim-tools-filters">
                    <button class="filter-btn active" data-filter="all">All Tools</button>
                    <button class="filter-btn" data-filter="Mod">Mods</button>
                    <button class="filter-btn" data-filter="Standalone">Standalone</button>
                    <button class="filter-btn" data-filter="AI-Powered">AI</button>
                </div>
            </div>
            <div class="anim-tools-grid">
                ${this.tools.map(tool => this.renderToolCard(tool)).join('')}
            </div>
            <div class="anim-tools-detail" id="tool-detail-panel" style="display:none;"></div>
        `;

        this.attachEventListeners(container);
    }

    renderToolCard(tool) {
        const featureScore = Object.values(tool.features).filter(Boolean).length;
        const maxFeatures = 8;
        const scorePercent = (featureScore / maxFeatures) * 100;

        return `
            <div class="tool-card" data-category="${tool.category}" data-type="${tool.type}">
                <div class="tool-header">
                    <h3>${tool.name}</h3>
                    <span class="tool-badge ${tool.category.toLowerCase().replace(' ', '-')}">${tool.category}</span>
                </div>
                <div class="tool-meta">
                    <span class="tool-version">${tool.version}</span>
                    <span class="tool-mc">MC ${tool.mcVersion}</span>
                </div>
                <div class="tool-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scorePercent}%"></div>
                    </div>
                    <span class="score-label">${featureScore}/${maxFeatures} features</span>
                </div>
                <div class="tool-quick-info">
                    <div class="info-row">
                        <span class="label">Learning:</span>
                        <span class="value ${tool.learningCurve.toLowerCase()}">${tool.learningCurve}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Quality:</span>
                        <span class="value">${tool.renderQuality}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Price:</span>
                        <span class="value ${tool.price === 'Free' ? 'free' : 'paid'}">${tool.price}</span>
                    </div>
                </div>
                <div class="tool-bestfor">
                    <strong>Best for:</strong> ${tool.bestFor}
                </div>
                <button class="tool-detail-btn" data-tool="${tool.id}">View Details</button>
            </div>
        `;
    }

    renderDetailPanel(tool) {
        return `
            <div class="detail-content">
                <button class="detail-close">&times;</button>
                <h2>${tool.name}</h2>
                <div class="detail-section">
                    <h3>Features</h3>
                    <div class="features-grid">
                        ${Object.entries(tool.features).map(([key, val]) => `
                            <div class="feature-item ${val ? 'yes' : 'no'}">
                                <span class="feature-icon">${val ? '✓' : '✗'}</span>
                                <span class="feature-name">${this.formatFeatureName(key)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="detail-columns">
                    <div class="detail-col">
                        <h3>Pros</h3>
                        <ul>${tool.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div class="detail-col">
                        <h3>Cons</h3>
                        <ul>${tool.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Workflow</h3>
                    <p>${tool.workflow}</p>
                    <p><strong>Output:</strong> ${tool.outputFormat}</p>
                </div>
            </div>
        `;
    }

    formatFeatureName(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    attachEventListeners(container) {
        // Filter buttons
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                this.filterTools(container, filter);
            });
        });

        // Detail buttons
        container.querySelectorAll('.tool-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolId = e.target.dataset.tool;
                const tool = this.tools.find(t => t.id === toolId);
                if (tool) {
                    const panel = container.querySelector('#tool-detail-panel');
                    panel.innerHTML = this.renderDetailPanel(tool);
                    panel.style.display = 'block';
                    panel.querySelector('.detail-close').addEventListener('click', () => {
                        panel.style.display = 'none';
                    });
                }
            });
        });
    }

    filterTools(container, filter) {
        const cards = container.querySelectorAll('.tool-card');
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else if (filter === 'Mod') {
                card.style.display = card.dataset.type === 'Mod' || card.dataset.type === 'Mod (Discontinued)' ? 'block' : 'none';
            } else {
                card.style.display = card.dataset.category === filter || card.dataset.type === filter ? 'block' : 'none';
            }
        });
    }
}

// Export for dashboard integration
window.AnimationToolsComparison = AnimationToolsComparison;
