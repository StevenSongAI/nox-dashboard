/**
 * BBS Cinematic Workflow Guide
 * Step-by-step guide for creating Minecraft cinematics with BBS/Blockbuster
 */

class BBSWorkflowGuide {
    constructor() {
        this.workflows = [
            {
                id: 'setup',
                name: 'Initial Setup',
                icon: '⚙️',
                steps: [
                    'Install BBS mod (Forge/Fabric for MC 1.20.1+)',
                    'Download Blockbench for custom models',
                    'Install Aperture for advanced camera work',
                    'Configure keybinds in Options > Controls'
                ],
                tip: 'Use BBS Reforge for modern versions with dynamic lighting',
                time: '15 min'
            },
            {
                id: 'scene',
                name: 'Scene Planning',
                icon: '🎬',
                steps: [
                    'Sketch storyboard (3-5 key shots)',
                    'Build/set your scene in creative mode',
                    'Place director blocks for actor spawn points',
                    'Set up camera paths with Aperture'
                ],
                tip: 'Plan your shots before recording — BBS works best with preparation',
                time: '30-60 min'
            },
            {
                id: 'actors',
                name: 'Actor Recording',
                icon: '👤',
                steps: [
                    'Spawn actor with /bbs spawn [name]',
                    'Equip custom skin/model if needed',
                    'Press record key (default: R)',
                    'Perform actions — movement is captured',
                    'Press R again to stop recording'
                ],
                tip: 'Use BBS Crowd Spawner mod to spawn multiple actors quickly',
                time: '10 min per actor'
            },
            {
                id: 'camera',
                name: 'Camera Work',
                icon: '📹',
                steps: [
                    'Open Aperture camera editor (default: C)',
                    'Create keyframes for camera position',
                    'Adjust FOV, roll, and interpolation',
                    'Preview camera path before final render'
                ],
                tip: 'Smooth camera moves use bezier interpolation',
                time: '20-40 min'
            },
            {
                id: 'export',
                name: 'Export & Edit',
                icon: '✂️',
                steps: [
                    'Use /bbs play to preview recorded scene',
                    'Export with OBS or built-in recorder',
                    'Import to DaVinci Resolve/Premiere',
                    'Add sound design and music'
                ],
                tip: 'Record at 60fps for smooth cinematics',
                time: '30 min'
            }
        ];
        this.selectedWorkflow = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="bbs-workflow-guide">
                <div class="workflow-header">
                    <div class="workflow-title">
                        <span class="workflow-icon">🎥</span>
                        <h3>BBS Cinematic Workflow</h3>
                    </div>
                    <span class="workflow-badge">For @ZMDE</span>
                </div>

                <div class="workflow-intro">
                    <p>Complete guide to creating Minecraft cinematics using BBS (Blockbuster Studio) mod. 
                    From setup to final export — optimized for Steven's cinematic content.</p>
                </div>

                <div class="workflows-list" id="workflows-list">
                    ${this.workflows.map(w => this.renderWorkflowCard(w)).join('')}
                </div>

                <div class="workflow-detail hidden" id="workflow-detail">
                    <div class="detail-header">
                        <button onclick="bbsWorkflow.closeDetail()" class="back-btn">← Back to Workflows</button>
                    </div>
                    <div id="workflow-detail-content"></div>
                </div>

                <div class="workflow-footer">
                    <div class="crowd-spawner-tip">
                        <span class="tip-icon">💡</span>
                        <div class="tip-content">
                            <strong>Pro Tip:</strong> Use your <em>BBS Crowd Spawner v3.4</em> mod to quickly spawn 
                            multiple actors with custom textures. Perfect for crowd scenes!
                            <br><br>
                            Command: <code>/crowd spawn "model name" "texture name" count</code>
                        </div>
                    </div>
                    
                    <div class="external-links">
                        <a href="https://www.curseforge.com/minecraft/mc-mods/bbs-mod" target="_blank" class="link-btn">
                            Download BBS Mod →
                        </a>
                        <a href="https://bbsmod.miraheze.org/wiki/Main_Page" target="_blank" class="link-btn secondary">
                            BBS Wiki →
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        this.workflows.forEach(w => {
            const card = document.getElementById(`workflow-${w.id}`);
            if (card) {
                card.onclick = () => this.showDetail(w);
            }
        });
    }

    renderWorkflowCard(workflow) {
        return `
            <div class="workflow-card" id="workflow-${workflow.id}">
                <div class="workflow-card-header">
                    <span class="card-icon">${workflow.icon}</span>
                    <span class="card-time">${workflow.time}</span>
                </div>
                <h4 class="card-name">${workflow.name}</h4>
                <p class="card-preview">${workflow.steps[0]}...</p>
                
                <div class="card-footer">
                    <span class="card-steps">${workflow.steps.length} steps</span>
                    <span class="card-view">View →</span>
                </div>
            </div>
        `;
    }

    showDetail(workflow) {
        this.selectedWorkflow = workflow;
        const list = document.getElementById('workflows-list');
        const detail = document.getElementById('workflow-detail');
        const content = document.getElementById('workflow-detail-content');

        if (list) list.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="detail-hero">
                    <span class="detail-icon-large">${workflow.icon}</span>
                    <h2>${workflow.name}</h2>
                    <span class="detail-time">⏱️ ${workflow.time}</span>
                </div>

                <div class="steps-section">
                    <h4>📋 Step-by-Step</h4>
                    <ol class="steps-list">
                        ${workflow.steps.map((step, i) => `
                            <li>
                                <span class="step-num">${i + 1}</span>
                                <span class="step-text">${step}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>

                <div class="pro-tip-box">
                    <h4>💡 Pro Tip</h4>
                    <p>${workflow.tip}</p>
                </div>
            `;
        }
    }

    closeDetail() {
        const list = document.getElementById('workflows-list');
        const detail = document.getElementById('workflow-detail');

        if (list) list.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedWorkflow = null;
    }

    destroy() {
        this.selectedWorkflow = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bbs-workflow-guide');
    if (container) {
        window.bbsWorkflow = new BBSWorkflowGuide();
        window.bbsWorkflow.render('bbs-workflow-guide');
    }
});

window.BBSWorkflowGuide = BBSWorkflowGuide;
