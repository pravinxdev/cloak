"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloakxDashboard = void 0;
const vscode = __importStar(require("vscode"));
class CloakxDashboard {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (CloakxDashboard.currentPanel) {
            CloakxDashboard.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('cloakxDashboard', '🔐 Cloakx Dashboard', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        CloakxDashboard.currentPanel = new CloakxDashboard(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._onDidChangeViewState = new vscode.EventEmitter();
        this.onDidChangeViewState = this._onDidChangeViewState.event;
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._panel.webview.html = this._getHtmlForWebview();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'login':
                    vscode.commands.executeCommand('cloakx.login');
                    break;
                case 'logout':
                    vscode.commands.executeCommand('cloakx.logout');
                    break;
                case 'refresh':
                    vscode.commands.executeCommand('cloakx.refreshSecrets');
                    break;
                case 'createSecret':
                    vscode.commands.executeCommand('cloakx.createSecret');
                    break;
                case 'switchEnvironment':
                    vscode.commands.executeCommand('cloakx.switchEnvironment');
                    break;
                case 'openSecrets':
                    vscode.commands.executeCommand('cloakx.openSecrets');
                    break;
            }
        }, null, this._disposables);
    }
    dispose() {
        CloakxDashboard.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    updateStatus(isAuthenticated, secretCount = 0) {
        this._panel.webview.html = this._getHtmlForWebview(isAuthenticated, secretCount);
    }
    _getHtmlForWebview(isAuthenticated = false, secretCount = 0) {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Cloakx Dashboard</title>
				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}

					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
						background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
						color: #e0e0e0;
						min-height: 100vh;
						padding: 0;
					}

					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}

					.header {
						text-align: center;
						margin-bottom: 40px;
						padding: 20px;
						background: rgba(0, 0, 0, 0.3);
						border-radius: 8px;
						border-left: 4px solid #0e639c;
					}

					.header h1 {
						font-size: 28px;
						margin-bottom: 8px;
						background: linear-gradient(135deg, #0e639c, #1177bb);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
					}

					.header p {
						color: #858585;
						font-size: 14px;
					}

					.status-card {
						background: #252526;
						border: 1px solid #3e3e42;
						border-radius: 8px;
						padding: 16px;
						margin-bottom: 20px;
					}

					.status-badge {
						display: inline-block;
						padding: 6px 12px;
						border-radius: 20px;
						font-size: 12px;
						font-weight: 600;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}

					.status-badge.authenticated {
						background: #0d5d3a;
						color: #4dff91;
					}

					.status-badge.unauthenticated {
						background: #5d260d;
						color: #ff9f4d;
					}

					.status-info {
						margin-top: 12px;
						padding-top: 12px;
						border-top: 1px solid #3e3e42;
						color: #858585;
						font-size: 13px;
					}

					.secret-count {
						font-size: 24px;
						font-weight: 700;
						color: #0e639c;
						margin-top: 8px;
					}

					.button-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 12px;
						margin-bottom: 20px;
					}

					.button-grid.full {
						grid-template-columns: 1fr;
					}

					button {
						padding: 12px 16px;
						border: none;
						border-radius: 6px;
						font-size: 14px;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s ease;
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 8px;
						text-decoration: none;
						color: white;
					}

					button:active {
						transform: scale(0.98);
					}

					.btn-primary {
						background: linear-gradient(135deg, #0e639c, #1177bb);
						color: white;
					}

					.btn-primary:hover {
						background: linear-gradient(135deg, #1177bb, #1391cc);
						box-shadow: 0 4px 12px rgba(14, 99, 156, 0.3);
					}

					.btn-success {
						background: linear-gradient(135deg, #0d5d3a, #0f7d52);
						color: white;
					}

					.btn-success:hover {
						background: linear-gradient(135deg, #0f7d52, #109966);
						box-shadow: 0 4px 12px rgba(13, 93, 58, 0.3);
					}

					.btn-danger {
						background: linear-gradient(135deg, #7d2a1a, #a63c2a);
						color: white;
					}

					.btn-danger:hover {
						background: linear-gradient(135deg, #a63c2a, #c74a38);
						box-shadow: 0 4px 12px rgba(125, 42, 26, 0.3);
					}

					.btn-secondary {
						background: #3e3e42;
						color: #e0e0e0;
					}

					.btn-secondary:hover {
						background: #4e4e52;
						box-shadow: 0 4px 12px rgba(62, 62, 66, 0.3);
					}

					.features {
						background: #252526;
						border: 1px solid #3e3e42;
						border-radius: 8px;
						padding: 20px;
						margin-top: 20px;
					}

					.features h3 {
						font-size: 16px;
						margin-bottom: 16px;
						color: #e0e0e0;
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.feature-list {
						list-style: none;
					}

					.feature-list li {
						padding: 10px 0;
						border-bottom: 1px solid #3e3e42;
						color: #a0a0a0;
						font-size: 14px;
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.feature-list li:last-child {
						border-bottom: none;
					}

					.feature-list li::before {
						content: "✓";
						color: #0e639c;
						font-weight: bold;
					}

					.welcome-message {
						background: rgba(14, 99, 156, 0.1);
						border: 1px solid #0e639c;
						border-radius: 6px;
						padding: 16px;
						margin-bottom: 20px;
						color: #a0c8ff;
						font-size: 13px;
						line-height: 1.6;
					}

					.divider {
						height: 1px;
						background: #3e3e42;
						margin: 20px 0;
					}

					.footer {
						text-align: center;
						color: #858585;
						font-size: 12px;
						margin-top: 30px;
					}

					.footer a {
						color: #0e639c;
						text-decoration: none;
					}

					.footer a:hover {
						text-decoration: underline;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🔐 Cloakx</h1>
						<p>Secure Secret Management for VS Code</p>
					</div>

					<div class="status-card">
						<div>
							<span class="status-badge ${isAuthenticated ? 'authenticated' : 'unauthenticated'}">
								${isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
							</span>
						</div>
						${isAuthenticated ? `
							<div class="status-info">
								<div style="margin-bottom: 8px;">You have access to your secrets vault</div>
								<div class="secret-count">${secretCount} secret${secretCount !== 1 ? 's' : ''}</div>
							</div>
						` : `
							<div class="welcome-message">
								👋 Welcome! To get started, log in to your Cloakx vault. Your secrets are encrypted and stored locally.
							</div>
						`}
					</div>

					${isAuthenticated ? `
						<div class="button-grid">
							<button class="btn-success" onclick="action('openSecrets')">
								📋 View Secrets
							</button>
							<button class="btn-primary" onclick="action('createSecret')">
								➕ New Secret
							</button>
						</div>

						<div class="button-grid">
							<button class="btn-secondary" onclick="action('switchEnvironment')">
								🌍 Switch Environment
							</button>
							<button class="btn-secondary" onclick="action('refresh')">
								🔄 Refresh
							</button>
						</div>

						<div class="button-grid full">
							<button class="btn-danger" onclick="action('logout')">
								🚪 Logout
							</button>
						</div>
					` : `
						<div class="button-grid full">
							<button class="btn-primary" onclick="action('login')">
								🔑 Login to Cloakx
							</button>
						</div>
					`}

					<div class="features">
						<h3>✨ Features</h3>
						<ul class="feature-list">
							<li>View & manage encrypted secrets</li>
							<li>Create, edit, and delete secrets</li>
							<li>Copy secrets to clipboard (auto-clear)</li>
							<li>Insert secrets directly into code</li>
							<li>Switch between environments</li>
							<li>Secure local encryption (AES-256-GCM)</li>
							<li>No cloud, no external dependencies</li>
						</ul>
					</div>

					<div class="divider"></div>

					<div class="footer">
						<p>🔒 All secrets are encrypted locally • <a href="#">Documentation</a> • <a href="#">GitHub</a></p>
					</div>
				</div>

				<script>
					const vscode = acquireVsCodeApi();

					function action(command) {
						vscode.postMessage({
							command: command
						});
					}
				</script>
			</body>
			</html>`;
    }
}
exports.CloakxDashboard = CloakxDashboard;
//# sourceMappingURL=cloakxDashboard.js.map