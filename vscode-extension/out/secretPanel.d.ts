import * as vscode from 'vscode';
export declare class SecretPanel {
    static currentPanel: SecretPanel | undefined;
    private readonly _panel;
    private readonly _extensionUri;
    private _disposables;
    private static readonly CLIPBOARD_TIMEOUT;
    static createOrShow(extensionUri: vscode.Uri, secretKey: string, secretValue: string): void;
    private constructor();
    dispose(): void;
    private _update;
    private _getHtmlForWebview;
    private _escapeHtml;
}
//# sourceMappingURL=secretPanel.d.ts.map