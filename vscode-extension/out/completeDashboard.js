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
exports.CompleteDashboard = void 0;
const vscode = __importStar(require("vscode"));
class CompleteDashboard {
    static createOrShow(extensionUri, manager) {
        if (CompleteDashboard.currentPanel) {
            CompleteDashboard.currentPanel._panel.reveal(vscode.ViewColumn.One);
            CompleteDashboard.currentPanel.refresh();
            return;
        }
        const panel = vscode.window.createWebviewPanel('cloakxCompleteDashboard', '🔐 Cloakx - Secret Manager', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: false,
        });
        CompleteDashboard.currentPanel = new CompleteDashboard(panel, extensionUri, manager);
        CompleteDashboard.currentPanel.setupAutoRefresh();
    }
    constructor(panel, extensionUri, manager) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._manager = manager;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        }, null, this._disposables);
        // Check auth and load data on open
        this.initializePanel();
    }
    async initializePanel() {
        const isAuth = await this._manager.checkAuth();
        if (isAuth) {
            await this._manager.loadSecrets();
            await this._manager.loadEnvironments();
        }
        this.refresh();
    }
    async handleMessage(message) {
        const { command, data } = message;
        try {
            switch (command) {
                case 'checkAuth':
                    const isAuth = await this._manager.checkAuth();
                    this.refresh();
                    break;
                case 'login':
                    vscode.window
                        .showInputBox({
                        prompt: 'Enter your vault password',
                        password: true,
                        ignoreFocusOut: true,
                    })
                        .then(async (password) => {
                        if (password) {
                            const success = await this._manager.login(password);
                            if (success) {
                                vscode.window.showInformationMessage('✓ Logged in successfully');
                            }
                            else {
                                vscode.window.showErrorMessage('✗ Login failed');
                            }
                        }
                        this.refresh();
                    });
                    break;
                case 'logout':
                    const confirmed = await vscode.window.showWarningMessage('Are you sure you want to logout?', 'Yes', 'No');
                    if (confirmed === 'Yes') {
                        const success = await this._manager.logout();
                        if (success) {
                            vscode.window.showInformationMessage('✓ Logged out');
                        }
                    }
                    this.refresh();
                    break;
                case 'createSecret':
                    const key = await vscode.window.showInputBox({
                        prompt: 'Secret key name',
                        ignoreFocusOut: true,
                    });
                    if (!key)
                        return;
                    const value = await vscode.window.showInputBox({
                        prompt: 'Secret value',
                        password: true,
                        ignoreFocusOut: true,
                    });
                    if (!value)
                        return;
                    const tags = await vscode.window.showInputBox({
                        prompt: 'Tags (optional, comma-separated)',
                        ignoreFocusOut: true,
                    });
                    const success = await this._manager.createSecret(key, value, tags);
                    if (success) {
                        vscode.window.showInformationMessage(`✓ Secret "${key}" created`);
                    }
                    else {
                        vscode.window.showErrorMessage(`✗ Failed to create secret`);
                    }
                    this.refresh();
                    break;
                case 'viewSecret':
                    const secret = data.secret;
                    const secretValue = await this._manager.getSecret(secret.key);
                    if (secretValue) {
                        const options = {
                            prompt: `View secret: ${secret.key}`,
                            value: secretValue,
                            ignoreFocusOut: true,
                            readonly: true,
                        };
                        vscode.window.showInputBox(options);
                    }
                    else {
                        vscode.window.showErrorMessage('Failed to load secret');
                    }
                    break;
                case 'editSecret':
                    const editSecret = data.secret;
                    const currentValue = await this._manager.getSecret(editSecret.key);
                    if (currentValue) {
                        const newValue = await vscode.window.showInputBox({
                            prompt: `Edit secret: ${editSecret.key}`,
                            value: currentValue,
                            password: true,
                            ignoreFocusOut: true,
                        });
                        if (newValue !== undefined && newValue !== currentValue) {
                            const updateSuccess = await this._manager.updateSecret(editSecret.key, newValue);
                            if (updateSuccess) {
                                vscode.window.showInformationMessage(`✓ Secret "${editSecret.key}" updated`);
                            }
                            else {
                                vscode.window.showErrorMessage('Failed to update secret');
                            }
                        }
                    }
                    this.refresh();
                    break;
                case 'deleteSecret':
                    const deleteSecret = data.secret;
                    const confirmed2 = await vscode.window.showWarningMessage(`Delete secret "${deleteSecret.key}"?`, 'Delete', 'Cancel');
                    if (confirmed2 === 'Delete') {
                        const deleteSuccess = await this._manager.deleteSecret(deleteSecret.key);
                        if (deleteSuccess) {
                            vscode.window.showInformationMessage(`✓ Secret deleted`);
                        }
                        else {
                            vscode.window.showErrorMessage('Failed to delete secret');
                        }
                    }
                    this.refresh();
                    break;
                case 'copySecret':
                    const copySecret = data.secret;
                    const copyValue = await this._manager.getSecret(copySecret.key);
                    if (copyValue) {
                        await vscode.env.clipboard.writeText(copyValue);
                        vscode.window.showInformationMessage('✓ Copied to clipboard (clears in 10s)');
                        setTimeout(() => {
                            vscode.env.clipboard.writeText('');
                        }, 10000);
                    }
                    break;
                case 'insertSecret':
                    const insertSecret = data.secret;
                    const insertValue = await this._manager.getSecret(insertSecret.key);
                    if (insertValue) {
                        const editor = vscode.window.activeTextEditor;
                        if (editor) {
                            editor.edit((editBuilder) => {
                                editBuilder.insert(editor.selection.active, insertValue);
                            });
                            vscode.window.showInformationMessage(`✓ Inserted "${insertSecret.key}"`);
                        }
                        else {
                            vscode.window.showErrorMessage('No active editor');
                        }
                    }
                    break;
                case 'switchEnvironment':
                    const environments = await this._manager.loadEnvironments();
                    const selected = await vscode.window.showQuickPick(environments, {
                        placeHolder: 'Select environment',
                    });
                    if (selected) {
                        const switchSuccess = await this._manager.switchEnvironment(selected);
                        if (switchSuccess) {
                            vscode.window.showInformationMessage(`✓ Switched to ${selected}`);
                        }
                    }
                    this.refresh();
                    break;
                case 'refresh':
                    await this._manager.loadSecrets();
                    this.refresh();
                    break;
            }
        }
        catch (error) {
            console.error('Error handling command:', error);
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    refresh() {
        this._panel.webview.html = this.getHtmlContent();
    }
    setupAutoRefresh() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
        this._refreshInterval = setInterval(() => {
            this.refresh();
        }, 20000); // Refresh every 20 seconds
    }
    dispose() {
        CompleteDashboard.currentPanel = undefined;
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    getHtmlContent() {
        const isAuth = this._manager.getIsAuthenticated();
        const secrets = this._manager.getSecrets();
        const environments = this._manager.getEnvironments();
        const currentEnv = this._manager.getCurrentEnv();
        if (!isAuth) {
            return this.getLoginPage();
        }
        return this.getSecretsPage(secrets, environments, currentEnv);
    }
    getLoginPage() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloakx - Login</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .login-container {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 12px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .logo p {
      color: #858585;
      font-size: 14px;
    }
    
    .button {
      width: 100%;
      padding: 12px 24px;
      background: linear-gradient(135deg, #0e639c, #1177bb);
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 16px;
    }
    
    .button:hover {
      background: linear-gradient(135deg, #1177bb, #1391cc);
      box-shadow: 0 4px 12px rgba(14, 99, 156, 0.3);
      transform: translateY(-2px);
    }
    
    .button:active {
      transform: translateY(0);
    }
    
    .info {
      background: rgba(14, 99, 156, 0.1);
      border: 1px solid #0e639c;
      border-radius: 6px;
      padding: 16px;
      color: #a0c8ff;
      font-size: 12px;
      line-height: 1.6;
      text-align: center;
    }
    
    .features {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #3e3e42;
    }
    
    .features h3 {
      font-size: 14px;
      margin-bottom: 12px;
      color: #d0d0d0;
    }
    
    .features ul {
      list-style: none;
      font-size: 12px;
      color: #a0a0a0;
    }
    
    .features li {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .features li::before {
      content: "✓";
      color: #0e639c;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <h1>🔐 Cloakx</h1>
      <p>Secure Secret Manager</p>
    </div>
    
    <div class="info">
      <p>Manage your encrypted secrets locally. No cloud, no tracking, just security.</p>
    </div>
    
    <button class="button" onclick="login()">🔑 Login to Vault</button>
    
    <div class="features">
      <h3>Features</h3>
      <ul>
        <li>View & manage secrets</li>
        <li>Create new secrets</li>
        <li>Edit & delete secrets</li>
        <li>Copy to clipboard</li>
        <li>Insert into code</li>
        <li>AES-256-GCM encryption</li>
      </ul>
    </div>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    
    function login() {
      vscode.postMessage({ command: 'login' });
    }
  </script>
</body>
</html>`;
    }
    getSecretsPage(secrets, environments, currentEnv) {
        const secretsHtml = secrets
            .map((secret) => `
      <div class="secret-item">
        <div class="secret-header">
          <div class="secret-info">
            <div class="secret-key">🔐 ${this.escapeHtml(secret.key)}</div>
            <div class="secret-meta">
              ${secret.environment ? `<span class="tag env-tag">📍 ${secret.environment}</span>` : ''}
              ${secret.tags && secret.tags.length > 0
            ? secret.tags.map((t) => `<span class="tag">#${t}</span>`).join('')
            : ''}
              ${secret.expiration ? `<span class="tag expire-tag">⏰ ${secret.expiration}</span>` : ''}
            </div>
          </div>
          <div class="secret-actions">
            <button class="btn-action" onclick="viewSecret('${this.escapeHtml(secret.key)}')" title="View">👁️</button>
            <button class="btn-action" onclick="copySecret('${this.escapeHtml(secret.key)}')" title="Copy">📋</button>
            <button class="btn-action" onclick="insertSecret('${this.escapeHtml(secret.key)}')" title="Insert">➕</button>
            <button class="btn-action" onclick="editSecret('${this.escapeHtml(secret.key)}')" title="Edit">✏️</button>
            <button class="btn-action btn-danger" onclick="deleteSecret('${this.escapeHtml(secret.key)}')" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `)
            .join('');
        const envOptions = environments
            .map((env) => `<option value="${env}" ${env === currentEnv ? 'selected' : ''}>${env}</option>`)
            .join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloakx - Secrets</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
      color: #e0e0e0;
      padding: 0;
    }
    
    .header {
      background: #252526;
      border-bottom: 1px solid #3e3e42;
      padding: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .header h1 {
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      font-size: 13px;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #0e639c, #1177bb);
      color: white;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #1177bb, #1391cc);
    }
    
    .btn-secondary {
      background: #3e3e42;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #4e4e52;
    }
    
    .btn-danger {
      background: #5d260d;
      color: #ff9f4d;
    }
    
    .btn-danger:hover {
      background: #7d340d;
    }
    
    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .env-select {
      background: #1e1e1e;
      border: 1px solid #3e3e42;
      color: #e0e0e0;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
    }
    
    .env-select option {
      background: #252526;
      color: #e0e0e0;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
    }
    
    .stat-card .number {
      font-size: 28px;
      font-weight: bold;
      color: #0e639c;
    }
    
    .stat-card .label {
      color: #858585;
      font-size: 12px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    
    .secrets-header {
      margin-bottom: 16px;
    }
    
    .secrets-header h2 {
      font-size: 16px;
      margin-bottom: 12px;
    }
    
    .secrets-list {
      display: grid;
      gap: 12px;
    }
    
    .secret-item {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 6px;
      padding: 16px;
      transition: all 0.2s ease;
    }
    
    .secret-item:hover {
      border-color: #0e639c;
      box-shadow: 0 4px 12px rgba(14, 99, 156, 0.1);
    }
    
    .secret-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    
    .secret-key {
      font-size: 16px;
      font-weight: 600;
      color: #d0d0d0;
      word-break: break-word;
    }
    
    .secret-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .tag {
      display: inline-block;
      background: #3e3e42;
      color: #a0a0a0;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .env-tag {
      background: rgba(14, 99, 156, 0.2);
      color: #0e9cff;
      border: 1px solid #0e639c;
    }
    
    .expire-tag {
      background: rgba(255, 99, 71, 0.2);
      color: #ff8c7a;
      border: 1px solid #ff6347;
    }
    
    .secret-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    
    .btn-action {
      background: #3e3e42;
      border: 1px solid #4e4e52;
      color: #e0e0e0;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    .btn-action:hover {
      background: #4e4e52;
      border-color: #0e639c;
    }
    
    .btn-action.btn-danger:hover {
      background: #7d260d;
      border-color: #ff6347;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #858585;
    }
    
    .empty-state p {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <h1>🔐 Cloakx - Secret Manager</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="refresh()">🔄 Refresh</button>
        <button class="btn btn-danger" onclick="logout()">🚪 Logout</button>
      </div>
    </div>
    <div class="header-controls">
      <label style="font-size: 13px; color: #858585;">Environment:</label>
      <select class="env-select" onchange="switchEnv(this.value)">
        ${envOptions}
      </select>
      <button class="btn btn-primary" onclick="createSecret()">➕ New Secret</button>
    </div>
  </div>
  
  <div class="container">
    <div class="stats">
      <div class="stat-card">
        <div class="number">${secrets.length}</div>
        <div class="label">Total Secrets</div>
      </div>
      <div class="stat-card">
        <div class="number">${currentEnv}</div>
        <div class="label">Current Environment</div>
      </div>
      <div class="stat-card">
        <div class="number">${environments.length}</div>
        <div class="label">Environments</div>
      </div>
    </div>
    
    <div class="secrets-header">
      <h2>Your Secrets</h2>
    </div>
    
    ${secrets.length === 0
            ? `<div class="empty-state">
          <p>📭 No secrets yet</p>
          <p style="font-size: 12px;">Click "New Secret" above to create your first secret</p>
        </div>`
            : `<div class="secrets-list">${secretsHtml}</div>`}
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    
    function createSecret() {
      vscode.postMessage({ command: 'createSecret' });
    }
    
    function viewSecret(key) {
      vscode.postMessage({ command: 'viewSecret', data: { secret: { key } } });
    }
    
    function copySecret(key) {
      vscode.postMessage({ command: 'copySecret', data: { secret: { key } } });
    }
    
    function insertSecret(key) {
      vscode.postMessage({ command: 'insertSecret', data: { secret: { key } } });
    }
    
    function editSecret(key) {
      vscode.postMessage({ command: 'editSecret', data: { secret: { key } } });
    }
    
    function deleteSecret(key) {
      vscode.postMessage({ command: 'deleteSecret', data: { secret: { key } } });
    }
    
    function switchEnv(env) {
      vscode.postMessage({ command: 'switchEnvironment', data: { env } });
    }
    
    function refresh() {
      vscode.postMessage({ command: 'refresh' });
    }
    
    function logout() {
      vscode.postMessage({ command: 'logout' });
    }
  </script>
</body>
</html>`;
    }
    escapeHtml(text) {
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
exports.CompleteDashboard = CompleteDashboard;
//# sourceMappingURL=completeDashboard.js.map