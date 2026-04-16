export declare class WebServerManager {
    private webProcess;
    private backendProcess;
    private webPort;
    private backendPort;
    private isRunning;
    private outputChannel;
    private extensionPath;
    constructor(extensionPath: string);
    startServer(): Promise<boolean>;
    openBrowser(): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=webServerManager.d.ts.map