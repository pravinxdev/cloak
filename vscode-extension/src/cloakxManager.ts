import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Secret {
  key: string;
  value?: string;
  tags?: string[];
  expiration?: string;
  environment?: string;
}

export class CloakxManager {
  private isAuthenticated: boolean = false;
  private secrets: Secret[] = [];
  private currentEnv: string = 'default';
  private environments: string[] = [];

  async checkAuth(): Promise<boolean> {
    try {
      await execAsync('cloakx status', {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      this.isAuthenticated = false;
      return false;
    }
  }

  async login(password: string): Promise<boolean> {
    try {
      await execAsync(`echo "${password}" | cloakx login`, {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      this.isAuthenticated = true;
      await this.loadSecrets();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      await execAsync('cloakx logout', {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      this.isAuthenticated = false;
      this.secrets = [];
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  async loadSecrets(): Promise<Secret[]> {
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
    } catch (error) {
      console.error('Failed to load secrets:', error);
      return [];
    }
  }

  async getSecret(key: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`cloakx get "${key}"`, {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      return stdout.trim();
    } catch (error) {
      console.error('Failed to get secret:', error);
      return null;
    }
  }

  async createSecret(key: string, value: string, tags?: string): Promise<boolean> {
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
    } catch (error) {
      console.error('Failed to create secret:', error);
      return false;
    }
  }

  async updateSecret(key: string, value: string): Promise<boolean> {
    try {
      await execAsync(`cloakx update "${key}" "${this.escapeValue(value)}"`, {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      await this.loadSecrets();
      return true;
    } catch (error) {
      console.error('Failed to update secret:', error);
      return false;
    }
  }

  async deleteSecret(key: string): Promise<boolean> {
    try {
      await execAsync(`cloakx del "${key}"`, {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      await this.loadSecrets();
      return true;
    } catch (error) {
      console.error('Failed to delete secret:', error);
      return false;
    }
  }

  async loadEnvironments(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('cloakx env list', {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      this.environments = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      return this.environments;
    } catch (error) {
      console.error('Failed to load environments:', error);
      return [];
    }
  }

  async switchEnvironment(env: string): Promise<boolean> {
    try {
      await execAsync(`cloakx env set "${env}"`, {
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      });
      this.currentEnv = env;
      await this.loadSecrets();
      return true;
    } catch (error) {
      console.error('Failed to switch environment:', error);
      return false;
    }
  }

  getSecrets(): Secret[] {
    return this.secrets;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getCurrentEnv(): string {
    return this.currentEnv;
  }

  getEnvironments(): string[] {
    return this.environments;
  }

  private parseSecretsFromOutput(output: string): Secret[] {
    const secrets: Secret[] = [];
    const lines = output.split('\n');

    let currentSecret: Partial<Secret> | null = null;

    for (const line of lines) {
      const keyMatch = line.match(/✅\s+\d+\.\s+(\S+)/);
      if (keyMatch) {
        if (currentSecret && currentSecret.key) {
          secrets.push(currentSecret as Secret);
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
      secrets.push(currentSecret as Secret);
    }

    return secrets;
  }

  private escapeValue(value: string): string {
    // Escape quotes for shell
    return value.replace(/"/g, '\\"');
  }
}
