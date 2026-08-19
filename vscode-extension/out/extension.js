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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const cloakxManager_1 = require("./cloakxManager");
const completeDashboard_1 = require("./completeDashboard");
const secretPanel_1 = require("./secretPanel");
const webServerManager_1 = require("./webServerManager");
let webServerManager;
let cloakxManager;
function activate(context) {
    console.log('🔒 Cloakx Extension activated');
    cloakxManager = new cloakxManager_1.CloakxManager();
    webServerManager = new webServerManager_1.WebServerManager(context.extensionPath);
    // 1. Open Dashboard Command
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.openDashboard', async () => {
        completeDashboard_1.CompleteDashboard.createOrShow(context.extensionUri, cloakxManager);
    }));
    // 2. Open Web Interface Command
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.openWeb', async () => {
        await webServerManager.openBrowser();
    }));
    // 3. Open Secrets View Command
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.openSecrets', async () => {
        completeDashboard_1.CompleteDashboard.createOrShow(context.extensionUri, cloakxManager);
    }));
    // 4. Insert Secret into Active Editor
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.insertSecret', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }
        const secrets = await cloakxManager.loadSecrets();
        if (secrets.length === 0) {
            vscode.window.showWarningMessage('No secrets found or not logged in.');
            return;
        }
        const selected = await vscode.window.showQuickPick(secrets.map((s) => ({
            label: s.key,
            description: s.environment ? `Env: ${s.environment}` : 'default',
            detail: s.tags ? `Tags: ${s.tags.join(', ')}` : undefined,
        })), { placeHolder: 'Select a secret to insert value' });
        if (selected) {
            const val = await cloakxManager.getSecret(selected.label);
            if (val !== null) {
                editor.edit((editBuilder) => {
                    editBuilder.insert(editor.selection.active, val);
                });
                vscode.window.showInformationMessage(`Inserted ${selected.label}`);
            }
            else {
                vscode.window.showErrorMessage(`Failed to retrieve secret ${selected.label}`);
            }
        }
    }));
    // 5. Create Secret Command
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.createSecret', async () => {
        const key = await vscode.window.showInputBox({
            prompt: 'Enter secret key (e.g. DATABASE_URL)',
            validateInput: (text) => (text ? null : 'Key cannot be empty'),
        });
        if (!key)
            return;
        const value = await vscode.window.showInputBox({
            prompt: 'Enter secret value',
            password: true,
            validateInput: (text) => (text ? null : 'Value cannot be empty'),
        });
        if (!value)
            return;
        const tags = await vscode.window.showInputBox({
            prompt: 'Enter optional tags (comma-separated, e.g. prod,db)',
        });
        const success = await cloakxManager.createSecret(key, value, tags);
        if (success) {
            vscode.window.showInformationMessage(`✅ Secret "${key}" created successfully.`);
        }
        else {
            vscode.window.showErrorMessage(`❌ Failed to create secret "${key}".`);
        }
    }));
    // 6. View Specific Secret Command
    context.subscriptions.push(vscode.commands.registerCommand('cloakx.viewSecret', async () => {
        const secrets = await cloakxManager.loadSecrets();
        if (secrets.length === 0) {
            vscode.window.showWarningMessage('No secrets found or not logged in.');
            return;
        }
        const selected = await vscode.window.showQuickPick(secrets.map((s) => s.key), { placeHolder: 'Select a secret to view' });
        if (selected) {
            const val = await cloakxManager.getSecret(selected);
            if (val !== null) {
                secretPanel_1.SecretPanel.createOrShow(context.extensionUri, selected, val);
            }
            else {
                vscode.window.showErrorMessage(`Failed to retrieve secret ${selected}`);
            }
        }
    }));
    // Cleanup web server on extension deactivate
    context.subscriptions.push({
        dispose: () => webServerManager.dispose(),
    });
    console.log('✓ Cloakx Extension ready with full commands');
}
function deactivate() {
    console.log('🔒 Cloakx Extension deactivated');
    if (webServerManager) {
        webServerManager.dispose();
    }
}
//# sourceMappingURL=extension.js.map