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
exports.WebServerManager = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
class WebServerManager {
    constructor(extensionPath) {
        this.webProcess = null;
        this.backendProcess = null;
        this.webPort = 3000;
        this.backendPort = 8080;
        this.isRunning = false;
        this.extensionPath = extensionPath;
        this.outputChannel = vscode.window.createOutputChannel('Cloakx Web Server');
    }
    async startServer() {
        if (this.isRunning) {
            return true;
        }
        try {
            this.outputChannel.appendLine('🚀 Starting Cloakx services...');
            this.outputChannel.show();
            // Calculate directories
            const webDir = path.join(this.extensionPath, '..', 'web');
            const serverDir = path.join(this.extensionPath, '..', 'server');
            this.outputChannel.appendLine(`📁 Web directory: ${webDir}`);
            this.outputChannel.appendLine(`📁 Server directory: ${serverDir}`);
            // Start backend server first (port 8080)
            this.outputChannel.appendLine(`🔧 Starting backend server on port ${this.backendPort}...`);
            this.backendProcess = cp.spawn('npm', ['run', 'dev'], {
                cwd: serverDir,
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            if (!this.backendProcess) {
                this.outputChannel.appendLine('❌ Failed to spawn backend process');
                return false;
            }
            this.backendProcess.stdout?.on('data', (data) => {
                this.outputChannel.appendLine('[Backend] ' + data.toString());
            });
            this.backendProcess.stderr?.on('data', (data) => {
                this.outputChannel.appendLine('[Backend Error] ' + data.toString());
            });
            // Start web server (port 3001)
            this.outputChannel.appendLine(`🌐 Starting web server on port ${this.webPort}...`);
            this.webProcess = cp.spawn('npm', ['run', 'dev'], {
                cwd: webDir,
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            if (!this.webProcess) {
                this.outputChannel.appendLine('❌ Failed to spawn web process');
                this.backendProcess?.kill('SIGTERM');
                return false;
            }
            this.webProcess.stdout?.on('data', (data) => {
                this.outputChannel.appendLine('[Web] ' + data.toString());
            });
            this.webProcess.stderr?.on('data', (data) => {
                this.outputChannel.appendLine('[Web Error] ' + data.toString());
            });
            // Wait for servers to start
            this.isRunning = true;
            this.outputChannel.appendLine(`⏳ Waiting for servers to start...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            this.outputChannel.appendLine(`✅ Services running:`);
            this.outputChannel.appendLine(`   • Backend API: http://localhost:${this.backendPort}`);
            this.outputChannel.appendLine(`   • Web UI: http://localhost:${this.webPort}`);
            return true;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Error: ${errorMsg}`);
            vscode.window.showErrorMessage(`Failed to start Cloakx services: ${errorMsg}`);
            return false;
        }
    }
    async openBrowser() {
        const started = await this.startServer();
        if (!started) {
            vscode.window.showErrorMessage('Failed to start services. Check output for details.');
            return;
        }
        try {
            const url = `http://localhost:${this.webPort}`;
            this.outputChannel.appendLine(`🌐 Opening browser: ${url}`);
            // Try VS Code's simple browser
            try {
                await vscode.commands.executeCommand('simpleBrowser.open', vscode.Uri.parse(url));
                this.outputChannel.appendLine('✅ Browser opened');
            }
            catch (error) {
                // Fallback to external browser
                this.outputChannel.appendLine('📱 Opening in external browser...');
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Failed to open browser: ${errorMsg}`);
            vscode.window.showErrorMessage(`Failed to open browser: ${errorMsg}`);
        }
    }
    dispose() {
        if (this.webProcess && this.webProcess.pid) {
            this.outputChannel.appendLine('🛑 Stopping web server...');
            try {
                // 🔧 Cross-platform process termination
                if (process.platform === 'win32') {
                    // Windows: Use taskkill command
                    cp.execSync(`taskkill /PID ${this.webProcess.pid} /T /F`, { stdio: 'ignore' });
                }
                else {
                    // Unix: Kill process group
                    process.kill(-this.webProcess.pid);
                }
            }
            catch (err) {
                // Fallback: Send SIGTERM
                try {
                    this.webProcess.kill('SIGTERM');
                }
                catch (e) {
                    // Process already terminated
                }
            }
        }
        if (this.backendProcess && this.backendProcess.pid) {
            this.outputChannel.appendLine('🛑 Stopping backend server...');
            try {
                if (process.platform === 'win32') {
                    cp.execSync(`taskkill /PID ${this.backendProcess.pid} /T /F`, { stdio: 'ignore' });
                }
                else {
                    process.kill(-this.backendProcess.pid);
                }
            }
            catch (err) {
                try {
                    this.backendProcess.kill('SIGTERM');
                }
                catch (e) {
                    // Process already terminated
                }
            }
        }
        this.isRunning = false;
    }
}
exports.WebServerManager = WebServerManager;
//# sourceMappingURL=webServerManager.js.map