/**
 * BBS Troubleshooting Guide
 * Common issues and solutions for BBS mod
 */

class BBSTroubleshootingGuide {
    constructor() {
        this.issues = [
            {
                id: 'optifine',
                title: 'Optifine Conflict',
                icon: '❌',
                severity: 'Critical',
                symptoms: [
                    'Game crashes on startup',
                    'Black screen when launching',
                    'BBS mod not loading'
                ],
                cause: 'Optifine is incompatible with BBS mod rendering',
                solution: [
                    'Remove Optifine from mods folder',
                    'Use Sinytra Connector for Forge instead',
                    'Alternative: Use Sodium + Iris for performance'
                ],
                prevention: 'Never install Optifine with BBS'
            },
            {
                id: 'forge-compat',
                title: 'Forge Compatibility',
                icon: '🔧',
                severity: 'Medium',
                symptoms: [
                    'Mod not appearing in mod list',
                    'Crash when opening BBS GUI',
                    'Features not working on Forge'
                ],
                cause: 'BBS is Fabric-native; Forge requires bridge',
                solution: [
                    'Install Sinytra Connector',
                    'Install Forgified Fabric API',
                    'Use BBS 1.20.1 build (most stable)'
                ],
                prevention: 'Always use Sinytra Connector on Forge'
            },
            {
                id: 'fabric-api',
                title: 'Missing Fabric API',
                icon: '📦',
                severity: 'Medium',
                symptoms: [
                    'Crash during world load',
                    'Missing dependency error',
                    'BBS features incomplete'
                ],
                cause: 'Fabric API is required but not installed',
                solution: [
                    'Download Fabric API for your MC version',
                    'Place in mods folder',
                    'Restart game'
                ],
                prevention: 'Always check dependencies on download page'
            },
            {
                id: 'keybinds',
                title: 'Keybind Conflicts',
                icon: '⌨️',
                severity: 'Low',
                symptoms: [
                    'Camera/editor not opening',
                    'Unexpected behavior when pressing keys',
                    'Controls not responding'
                ],
                cause: 'BBS keys conflict with other mods',
                solution: [
                    'Open Options > Controls > Keybinds',
                    'Search "BBS" or "Aperture"',
                    'Change conflicting keys',
                    'Restart recommended'
                ],
                prevention: 'Set unique keys during first setup'
            },
            {
                id: 'performance',
                title: 'Low FPS / Lag',
                icon: '🐌',
                severity: 'Low',
                symptoms: [
                    'Stuttering during recording',
                    'Low FPS with multiple actors',
                    'Lag spikes in editor'
                ],
                cause: 'Too many entities/replays active',
                solution: [
                    'Reduce actor count (10 max recommended)',
                    'Lower render distance temporarily',
                    'Use Entity Culling mod',
                    'Allocate more RAM (4GB+ recommended)'
                ],
                prevention: 'Optimize scene before recording'
            }
        ];
        this.selectedIssue = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="bbs-troubleshooting">
                <div class="troubleshooting-header">
                    <div class="troubleshooting-title">
                        <span class="troubleshooting-icon">🔧</span>
                        <h3>BBS Troubleshooting Guide</h3&#xe;
                    </div>
                    <span class="troubleshooting-badge">${this.issues.length} Issues</span>
                </div>

                <div class="troubleshooting-intro">
                    Common BBS mod issues and their solutions. Click an issue for detailed fix steps.
                </div>

                <div class="issues-list" id="issues-list">
                    ${this.issues.map(i => this.renderIssueCard(i)).join('')}
                </div>

                <div class="issue-detail hidden" id="issue-detail">
                    <div class="detail-header">
                        <button onclick="bbsTroubleshooting.closeDetail()" class="back-btn">← Back</button>
                    </div>
                    <div id="issue-detail-content"></div>
                </div>

                <div class="troubleshooting-footer">
                    <div class="quick-links">
                        <a href="https://www.curseforge.com/minecraft/mc-mods/bbs-mod" target="_blank" class="link-btn">
                            BBS CurseForge →
                        </a>
                        <a href="https://modrinth.com/mod/bbs-mod" target="_blank" class="link-btn secondary">
                            BBS Modrinth →
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.issues.forEach(i => {
            const card = document.getElementById(`issue-${i.id}`);
            if (card) {
                card.onclick = () => this.showDetail(i);
            }
        });
    }

    renderIssueCard(issue) {
        const severityColor = {
            'Critical': '#ef4444',
            'Medium': '#f59e0b',
            'Low': '#3b82f6'
        }[issue.severity];

        return `
            <div class="issue-card" id="issue-${issue.id}">
                <div class="issue-card-header">
                    <span class="issue-icon">${issue.icon}</span>
                    <span class="issue-severity" style="color: ${severityColor}">${issue.severity}</span>
                </div>
                <h4 class="issue-title">${issue.title}</h4>
                <p class="issue-preview">${issue.symptoms[0]}...</p>
                
                <div class="issue-footer">
                    <span class="issue-symptoms">${issue.symptoms.length} symptoms</span>
                    <span class="issue-view">Fix →</span>
                </div>
            </div>
        `;
    }

    showDetail(issue) {
        this.selectedIssue = issue;
        const list = document.getElementById('issues-list');
        const detail = document.getElementById('issue-detail');
        const content = document.getElementById('issue-detail-content');

        if (list) list.classList.add('hidden');
        if (detail) detail.classList.remove('hidden');

        if (content) {
            content.innerHTML = `
                <div class="issue-detail-hero">
                    <span class="detail-icon-large">${issue.icon}</span>
                    <h2>${issue.title}</h2>
                    <span class="detail-severity ${issue.severity.toLowerCase()}">${issue.severity}</span>
                </div>

                <div class="symptoms-section">
                    <h4>⚠️ Symptoms</h4>
                    <ul>
                        ${issue.symptoms.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>

                <div class="cause-box">
                    <h4>🔍 Root Cause</h4>
                    <p>${issue.cause}</p>
                </div>

                <div class="solution-section">
                    <h4>✅ Solution Steps</h4>
                    <ol>
                        ${issue.solution.map(s => `<li>${s}</li>`).join('')}
                    </ol>
                </div>

                <div class="prevention-box">
                    <h4>🛡️ Prevention</h4>
                    <p>${issue.prevention}</p>
                </div>
            `;
        }
    }

    closeDetail() {
        const list = document.getElementById('issues-list');
        const detail = document.getElementById('issue-detail');

        if (list) list.classList.remove('hidden');
        if (detail) detail.classList.add('hidden');
        this.selectedIssue = null;
    }

    destroy() {
        this.selectedIssue = null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bbs-troubleshooting');
    if (container) {
        window.bbsTroubleshooting = new BBSTroubleshootingGuide();
        window.bbsTroubleshooting.render('bbs-troubleshooting');
    }
});

window.BBSTroubleshootingGuide = BBSTroubleshootingGuide;
