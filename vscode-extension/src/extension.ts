import * as vscode from 'vscode';
import { CloakxManager } from './cloakxManager';
import { CompleteDashboard } from './completeDashboard';
import { SecretPanel } from './secretPanel';
import { WebServerManager } from './webServerManager';

let webServerManager: WebServerManager;
let cloakxManager: CloakxManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('🔒 Cloakx Extension activated');

  cloakxManager = new CloakxManager();
  webServerManager = new WebServerManager(context.extensionPath);

  // 1. Open Dashboard Command
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.openDashboard', async () => {
      CompleteDashboard.createOrShow(context.extensionUri, cloakxManager);
    })
  );

  // 2. Open Web Interface Command
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.openWeb', async () => {
      await webServerManager.openBrowser();
    })
  );

  // 3. Open Secrets View Command
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.openSecrets', async () => {
      CompleteDashboard.createOrShow(context.extensionUri, cloakxManager);
    })
  );

  // 4. Insert Secret into Active Editor
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.insertSecret', async () => {
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

      const selected = await vscode.window.showQuickPick(
        secrets.map((s) => ({
          label: s.key,
          description: s.environment ? `Env: ${s.environment}` : 'default',
          detail: s.tags ? `Tags: ${s.tags.join(', ')}` : undefined,
        })),
        { placeHolder: 'Select a secret to insert value' }
      );

      if (selected) {
        const val = await cloakxManager.getSecret(selected.label);
        if (val !== null) {
          editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, val);
          });
          vscode.window.showInformationMessage(`Inserted ${selected.label}`);
        } else {
          vscode.window.showErrorMessage(`Failed to retrieve secret ${selected.label}`);
        }
      }
    })
  );

  // 5. Create Secret Command
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.createSecret', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'Enter secret key (e.g. DATABASE_URL)',
        validateInput: (text) => (text ? null : 'Key cannot be empty'),
      });
      if (!key) return;

      const value = await vscode.window.showInputBox({
        prompt: 'Enter secret value',
        password: true,
        validateInput: (text) => (text ? null : 'Value cannot be empty'),
      });
      if (!value) return;

      const tags = await vscode.window.showInputBox({
        prompt: 'Enter optional tags (comma-separated, e.g. prod,db)',
      });

      const success = await cloakxManager.createSecret(key, value, tags);
      if (success) {
        vscode.window.showInformationMessage(`✅ Secret "${key}" created successfully.`);
      } else {
        vscode.window.showErrorMessage(`❌ Failed to create secret "${key}".`);
      }
    })
  );

  // 6. View Specific Secret Command
  context.subscriptions.push(
    vscode.commands.registerCommand('cloakx.viewSecret', async () => {
      const secrets = await cloakxManager.loadSecrets();
      if (secrets.length === 0) {
        vscode.window.showWarningMessage('No secrets found or not logged in.');
        return;
      }

      const selected = await vscode.window.showQuickPick(
        secrets.map((s) => s.key),
        { placeHolder: 'Select a secret to view' }
      );

      if (selected) {
        const val = await cloakxManager.getSecret(selected);
        if (val !== null) {
          SecretPanel.createOrShow(context.extensionUri, selected, val);
        } else {
          vscode.window.showErrorMessage(`Failed to retrieve secret ${selected}`);
        }
      }
    })
  );

  // Cleanup web server on extension deactivate
  context.subscriptions.push({
    dispose: () => webServerManager.dispose(),
  });

  console.log('✓ Cloakx Extension ready with full commands');
}

export function deactivate() {
  console.log('🔒 Cloakx Extension deactivated');
  if (webServerManager) {
    webServerManager.dispose();
  }
}
