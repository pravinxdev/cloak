import * as vscode from 'vscode';
import { WebServerManager } from './webServerManager';

let webServerManager: WebServerManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('🔐 Cloakx Extension activated');

  webServerManager = new WebServerManager(context.extensionPath);

  // Open web UI on activation
  webServerManager.openBrowser();

  // Register command to open dashboard
  let disposable = vscode.commands.registerCommand('cloakx.openDashboard', async () => {
    await webServerManager.openBrowser();
  });
  context.subscriptions.push(disposable);

  // Add to subscriptions for cleanup
  context.subscriptions.push({
    dispose: () => webServerManager.dispose(),
  });

  console.log('✓ Cloakx Extension ready');
}

export function deactivate() {
  console.log('🔐 Cloakx Extension deactivated');
  if (webServerManager) {
    webServerManager.dispose();
  }
}
