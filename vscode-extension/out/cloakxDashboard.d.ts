import * as vscode from 'vscode';
export declare class CloakxDashboard {
    static currentPanel: CloakxDashboard | undefined;
    private readonly _panel;
    private readonly _extensionUri;
    private _disposables;
    private _onDidChangeViewState;
    readonly onDidChangeViewState: vscode.Event<void>;
    static createOrShow(extensionUri: vscode.Uri): void;
    private constructor();
    dispose(): void;
    updateStatus(isAuthenticated: boolean, secretCount?: number): void;
    private _getHtmlForWebview;
}
//# sourceMappingURL=cloakxDashboard.d.ts.map