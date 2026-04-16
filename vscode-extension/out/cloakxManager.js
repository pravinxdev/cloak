"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloakxManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class CloakxManager {
    constructor() {
        this.isAuthenticated = false;
        this.secrets = [];
        this.currentEnv = 'default';
        this.environments = [];
    }
    async checkAuth() {
        try {
            await execAsync('cloakx status', {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.isAuthenticated = true;
            return true;
        }
        catch (error) {
            this.isAuthenticated = false;
            return false;
        }
    }
    async login(password) {
        try {
            await execAsync(`echo "${password}" | cloakx login`, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.isAuthenticated = true;
            await this.loadSecrets();
            return true;
        }
        catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }
    async logout() {
        try {
            await execAsync('cloakx logout', {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.isAuthenticated = false;
            this.secrets = [];
            return true;
        }
        catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    }
    async loadSecrets() {
        if (!this.isAuthenticated) {
            return [];
        }
        try {
            const { stdout } = await execAsync('cloakx list', {
                maxBuffer: 1024 * 1024 * 10,
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.secrets = this.parseSecretsFromOutput(stdout);
            // Also load environments
            await this.loadEnvironments();
            return this.secrets;
        }
        catch (error) {
            console.error('Failed to load secrets:', error);
            return [];
        }
    }
    async getSecret(key) {
        try {
            const { stdout } = await execAsync(`cloakx get "${key}"`, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            return stdout.trim();
        }
        catch (error) {
            console.error('Failed to get secret:', error);
            return null;
        }
    }
    async createSecret(key, value, tags) {
        try {
            let cmd = `cloakx set "${key}" "${this.escapeValue(value)}"`;
            if (tags) {
                cmd += ` --tags "${tags}"`;
            }
            await execAsync(cmd, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            await this.loadSecrets();
            return true;
        }
        catch (error) {
            console.error('Failed to create secret:', error);
            return false;
        }
    }
    async updateSecret(key, value) {
        try {
            await execAsync(`cloakx update "${key}" "${this.escapeValue(value)}"`, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            await this.loadSecrets();
            return true;
        }
        catch (error) {
            console.error('Failed to update secret:', error);
            return false;
        }
    }
    async deleteSecret(key) {
        try {
            await execAsync(`cloakx del "${key}"`, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            await this.loadSecrets();
            return true;
        }
        catch (error) {
            console.error('Failed to delete secret:', error);
            return false;
        }
    }
    async loadEnvironments() {
        try {
            const { stdout } = await execAsync('cloakx env list', {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.environments = stdout
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
            return this.environments;
        }
        catch (error) {
            console.error('Failed to load environments:', error);
            return [];
        }
    }
    async switchEnvironment(env) {
        try {
            await execAsync(`cloakx env set "${env}"`, {
                shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            });
            this.currentEnv = env;
            await this.loadSecrets();
            return true;
        }
        catch (error) {
            console.error('Failed to switch environment:', error);
            return false;
        }
    }
    getSecrets() {
        return this.secrets;
    }
    getIsAuthenticated() {
        return this.isAuthenticated;
    }
    getCurrentEnv() {
        return this.currentEnv;
    }
    getEnvironments() {
        return this.environments;
    }
    parseSecretsFromOutput(output) {
        const secrets = [];
        const lines = output.split('\n');
        let currentSecret = null;
        for (const line of lines) {
            const keyMatch = line.match(/✅\s+\d+\.\s+(\S+)/);
            if (keyMatch) {
                if (currentSecret && currentSecret.key) {
                    secrets.push(currentSecret);
                }
                currentSecret = { key: keyMatch[1] };
                continue;
            }
            const tagsMatch = line.match(/\s+Tags:\s+(.+)/);
            if (tagsMatch && currentSecret) {
                currentSecret.tags = tagsMatch[1].split(',').map((t) => t.trim());
            }
            const envMatch = line.match(/\s+Env:\s+(\S+)/);
            if (envMatch && currentSecret) {
                currentSecret.environment = envMatch[1];
            }
            const expireMatch = line.match(/\s+Expires:\s+(.+)/);
            if (expireMatch && currentSecret) {
                currentSecret.expiration = expireMatch[1].trim();
            }
        }
        if (currentSecret && currentSecret.key) {
            secrets.push(currentSecret);
        }
        return secrets;
    }
    escapeValue(value) {
        // Escape quotes for shell
        return value.replace(/"/g, '\\"');
    }
}
exports.CloakxManager = CloakxManager;
//# sourceMappingURL=cloakxManager.js.map