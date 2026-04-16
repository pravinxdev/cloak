import * as vscode from 'vscode';
import { CloakxManager } from './cloakxManager';
export declare class CompleteDashboard {
    static currentPanel: CompleteDashboard | undefined;
    private readonly _panel;
    private readonly _extensionUri;
    private readonly _manager;
    private _disposables;
    private _refreshInterval;
    static createOrShow(extensionUri: vscode.Uri, manager: CloakxManager): void;
    private constructor();
    private initializePanel;
    private handleMessage;
    refresh(): void;
    private setupAutoRefresh;
    dispose(): void;
    private getHtmlContent;
    private getLoginPage;
    private getSecretsPage;
    private escapeHtml;
}
//# sourceMappingURL=completeDashboard.d.ts.map