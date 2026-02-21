/**
 * Cinematic Camera Techniques Guide
 * Camera movement techniques for BBS/Aperture
 */

class CameraTechniquesGuide {
    constructor() {
        this.techniques = [
            {
                id: 'dolly',
                name: 'Dolly Shot',
                icon: '🎬',
                difficulty: 'Easy',
                description: 'Smooth linear movement along a path',
                setup: [
                    'Set start point (camera position)',
                    'Set end point (where camera moves to)',
                    'Use linear interpolation',
                    'Duration: 3-5 seconds'
                ],
                bestFor: 'Revealing builds, following actors',
                proTip: 'Keep movement speed consistent — avoid acceleration'
            },
            {
                id: 'pan',
                name: 'Pan Shot',
                icon: '🔄',
                difficulty: 'Easy',
                description: 'Rotate camera while staying in place',
                setup: [
                    'Lock camera position',
                    'Set start rotation (yaw/pitch)',
                    'Set end rotation',
                    'Use smooth interpolation'
                ],
                bestFor: 'Landscape reveals, 360° environment shots',
                proTip: 'Slower pans (5°/sec) feel more cinematic'
            },
            {
                id: 'tracking',
                name: 'Tracking Shot',
                icon: '🏃',
                difficulty: 'Medium',
                description: 'Camera follows a moving subject',
                setup: [
                    'Set target entity (actor/player)',
                    'Configure follow distance',
                    'Adjust height offset',
                    'Use bezier for smoothness'
                ],
                bestFor: 'Following actors, chase scenes',
                proTip: 'Maintain consistent distance — use entity target'
            },
            {
                id: 'crane',
                name: 'Crane/Jib Shot',
                icon: '🏗️',
                difficulty: 'Medium',
                description: 'Arc movement up/down with rotation',
                setup: [
                    'Start low, looking up',
                    'Arc upward while rotating',
                    'End high, looking down',
                    'Use bezier interpolation'
                ],
                bestFor: 'Epic reveals, dramatic entrances',
                proTip: 'Combine with FOV change (60→80) for impact'
            },
            {
                id: 'whip',
                name: 'Whip Pan',
                icon: '⚡',
                difficulty: 'Hard',
                description: 'Fast snap between two angles',
                setup: [
                    'Start position (hold 1 sec)',
                    'Very fast transition (0.3 sec)',
                    'End position (hold 2+ sec)',
                    'Linear interpolation, high speed'
                ],
                bestFor: 'Action sequences, scene transitions',
                proTip: 'Add motion blur in post for extra impact'
            },
            {
                id: 'orbit',
                name: 'Orbit Shot',
                icon: '🌐',
                difficulty: 'Medium',
                description: 'Circle around a central point',
                setup: [
                    'Set center point (target)',
                    'Define radius and height',
                    '360° rotation over 8-12 seconds',
                    'Keep target in center of frame'
                ],
                bestFor: 'Showcasing builds, character focus',
                proTip: 'Slight FOV increase during orbit adds dynamism'
            }
        ];
        this.selectedTechnique = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="camera-techniques">
                <div class="techniques-header">
                    <div class="techniques-title">
                        <span class="techniques-icon">📹</span>
                        <h3>Cinematic Camera Techniques</h3>
                    </div>
                    <span class="techniques-badge">BBS + Aperture</span>
                </div>

                <div class="techniques-intro">
                    Professional camera movements for Minecraft cinematics. 
                    Use with <strong>BBS mod</strong> or <strong>Aperture</strong> for advanced shots.
                </div>

                <div class="techniques-grid" id="techniques-grid">
                    ${this.techniques.map(t => this.renderTechniqueCard(t)).join('')}
                </div>

                <div class="technique-detail hidden" id="technique-detail">
                    <div class="detail-header">
                        <button onclick="cameraGuide.closeDetail()" class="back-btn">← Back</button>
                    </div>
                    <div id="technique-detail-content"></div>
                </div>

                <div class="techniques-footer">
                    <div class="quick-reference">
                        <h4>⚡ Quick Reference</h4>
                        <div class="ref-grid">
                            <div class="ref-item">
                                <span class="ref-key">C</span>
                                <span class="ref-desc">Open Aperture editor</span>
                            </div>
                            <div class="ref-item">
                                <span class="ref-key">R</span>
                                <span class="ref-desc">Start/stop BBS recording</span>
                            </div>
                            <div class="ref-item">
                                <span class="ref-key">F5</span>
                                <span class="ref-desc">Toggle perspective</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.techniques.forEach(t => {
            const card = document.getElementById(`technique-${t.id}`);
            if (card) {
                card.onclick = () => this.showDetail(t);
            }
        });
    }

    renderTechniqueCard(technique) {
        const difficultyColor = {
            'Easy': '#10b981',
            'Medium': '#f59e0b',
            'Hard': '#ef4444'
        }[technique.difficulty];

        return `
            <div class="technique-card" id="technique-${technique.id}">
                <div class="technique-card-header">
                    <span class="technique-icon">${technique.icon}</span>
                    <span class="technique-difficulty" style="color: ${difficultyColor}">${technique.difficulty}</span>
                </div>
                <h4 class="technique-name">${technique.name}</h4>
                <p class="technique-desc">${technique.description}</p>
                
                <div class="technique-footer">
                    <span class="technique-best">Best: ${technique.bestFor.split(',')[0]}...</span>
                    <span class="technique-view">Learn →</span>
                </div>
            </div>
        `;
    }

    showDetail(technique) {
        this.selectedTechnique = technique;
        const grid = document.getElementById('techniques-grid');
        const detail = document.getElementById('technique-detail');
        const content = document.getElementById('technique-detail-content');

        if (grid) grid.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="technique-detail-hero">
                    <span class="detail-icon-large">${technique.icon}</span>
                    <h2>${technique.name}</h2>
                    <span class="detail-difficulty ${technique.difficulty.toLowerCase()}">${technique.difficulty}</span>
                    <p class="detail-desc">${technique.description}</p>
                </div>

                <div class="setup-section">
                    <h4>⚙️ Setup Steps</h4>
                    <ol class="setup-list">
                        ${technique.setup.map(s => `<li>${s}</li>`).join('')}
                    </ol>
                </div>

                <div class="best-for-box">
                    <h4>🎯 Best For</h4>
                    <p>${technique.bestFor}</p>
                </div>

                <div class="pro-tip-box">
                    <h4>💡 Pro Tip</h4>
                    <p>${technique.proTip}</p>
                </div>
            `;
        }
    }

    closeDetail() {
        const grid = document.getElementById('techniques-grid');
        const detail = document.getElementById('technique-detail');

        if (grid) grid.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedTechnique = null;
    }

    destroy() {
        this.selectedTechnique = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('camera-techniques');
    if (container) {
        window.cameraGuide = new CameraTechniquesGuide();
        window.cameraGuide.render('camera-techniques');
    }
});

window.CameraTechniquesGuide = CameraTechniquesGuide;
