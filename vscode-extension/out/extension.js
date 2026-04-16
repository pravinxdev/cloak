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
const webServerManager_1 = require("./webServerManager");
let webServerManager;
function activate(context) {
    console.log('🔐 Cloakx Extension activated');
    webServerManager = new webServerManager_1.WebServerManager(context.extensionPath);
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
function deactivate() {
    console.log('🔐 Cloakx Extension deactivated');
    if (webServerManager) {
        webServerManager.dispose();
    }
}
//# sourceMappingURL=extension.js.map