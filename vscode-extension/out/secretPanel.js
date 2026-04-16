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
exports.SecretPanel = void 0;
const vscode = __importStar(require("vscode"));
class SecretPanel {
    static createOrShow(extensionUri, secretKey, secretValue) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        if (SecretPanel.currentPanel) {
            SecretPanel.currentPanel._panel.reveal(column);
            SecretPanel.currentPanel._update(secretKey, secretValue);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel('secretPanel', `🔐 ${secretKey}`, column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        SecretPanel.currentPanel = new SecretPanel(panel, extensionUri);
        SecretPanel.currentPanel._update(secretKey, secretValue);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update('', '');
        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'copy':
                    vscode.env.clipboard.writeText(message.value);
                    vscode.window.showInformationMessage(`Secret copied to clipboard (will clear in ${SecretPanel.CLIPBOARD_TIMEOUT / 1000}s)`);
                    setTimeout(() => {
                        vscode.env.clipboard.writeText('');
                    }, SecretPanel.CLIPBOARD_TIMEOUT);
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        SecretPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update(secretKey, secretValue) {
        this._panel.webview.html = this._getHtmlForWebview(secretKey, secretValue);
    }
    _getHtmlForWebview(secretKey, secretValue) {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Secret Viewer</title>
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
						padding: 20px;
						color: #e0e0e0;
						background: #1e1e1e;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
					}
					h1 {
						font-size: 24px;
						margin: 0 0 20px 0;
						display: flex;
						align-items: center;
						gap: 10px;
					}
					.secret-key {
						background: #252526;
						padding: 12px;
						border-radius: 4px;
						margin-bottom: 20px;
						border-left: 3px solid #0e639c;
					}
					.secret-key label {
						font-size: 12px;
						color: #858585;
						text-transform: uppercase;
						display: block;
						margin-bottom: 8px;
					}
					.secret-key code {
						font-family: 'Courier New', monospace;
						font-size: 14px;
						color: #ce9178;
					}
					.secret-value {
						background: #252526;
						padding: 12px;
						border-radius: 4px;
						margin-bottom: 20px;
						border-left: 3px solid #f44747;
					}
					.secret-value label {
						font-size: 12px;
						color: #858585;
						text-transform: uppercase;
						display: block;
						margin-bottom: 8px;
					}
					.secret-display {
						background: #1e1e1e;
						border: 1px solid #3e3e42;
						padding: 10px;
						border-radius: 3px;
						font-family: 'Courier New', monospace;
						font-size: 14px;
						word-break: break-all;
						color: #d4d4d4;
						margin-bottom: 10px;
					}
					.button-group {
						display: flex;
						gap: 10px;
					}
					button {
						flex: 1;
						padding: 8px 16px;
						border: none;
						border-radius: 3px;
						font-size: 14px;
						cursor: pointer;
						font-weight: 500;
						transition: opacity 0.2s;
					}
					.btn-copy {
						background: #0e639c;
						color: white;
					}
					.btn-copy:hover {
						background: #1177bb;
					}
					.warning {
						background: #5a4a00;
						border: 1px solid #c7b550;
						color: #e0e0e0;
						padding: 12px;
						border-radius: 4px;
						margin-bottom: 20px;
						font-size: 12px;
						line-height: 1.5;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>🔐 Secret Details</h1>
					
					<div class="warning">
						⚠️ <strong>Security Notice:</strong> This secret is visible in this panel. Make sure no one is looking over your shoulder. The value will not be logged to history.
					</div>

					<div class="secret-key">
						<label>Secret Key</label>
						<code>${this._escapeHtml(secretKey)}</code>
					</div>

					<div class="secret-value">
						<label>Secret Value</label>
						<div class="secret-display">
							${this._escapeHtml(secretValue)}
						</div>
						<div class="button-group">
							<button class="btn-copy" onclick="copySecret()">📋 Copy Value</button>
						</div>
					</div>
				</div>

				<script>
					const vscode = acquireVsCodeApi();
					const secretValue = ${JSON.stringify(secretValue)};

					function copySecret() {
						vscode.postMessage({
							command: 'copy',
							value: secretValue
						});
					}
				</script>
			</body>
			</html>`;
    }
    _escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}
exports.SecretPanel = SecretPanel;
// 🔒 Clipboard timeout: 30 seconds (configurable via env)
SecretPanel.CLIPBOARD_TIMEOUT = parseInt(process.env.CLOAKX_CLIPBOARD_TIMEOUT || '30000');
//# sourceMappingURL=secretPanel.js.map