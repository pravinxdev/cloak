import fs from 'fs';
import os from 'os';
import path from 'path';

const baseDir = path.join(os.homedir(), '.cloakx');
const configPath = path.join(baseDir, 'config.json');

interface Config {
  env: string;
  environments: string[];
}

// 📖 Load config
function loadConfig(): Config {
  if (!fs.existsSync(configPath)) {
    return { env: 'default', environments: ['default'] };
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return { env: 'default', environments: ['default'] };
  }
}

// 💾 Save config
function saveConfig(config: Config): void {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// 🌍 Get active environment
export function getActiveEnvironment(): string {
  const config = loadConfig();
  return config.env || 'default';
}

// 🌍 Set active environment
export function setActiveEnvironment(env: string): void {
  const config = loadConfig();
  
  if (!config.environments.includes(env)) {
    config.environments.push(env);
  }
  
  config.env = env;
  saveConfig(config);
}

// 📋 List all environments
export function listEnvironments(): string[] {
  const config = loadConfig();
  return config.environments || ['default'];
}

// ➕ Create new environment
export function createEnvironment(env: string): void {
  const config = loadConfig();
  
  if (!config.environments.includes(env)) {
    config.environments.push(env);
    saveConfig(config);
  }
}

// ➖ Delete environment
export function deleteEnvironment(env: string): void {
  const config = loadConfig();
  
  config.environments = config.environments.filter((e) => e !== env);
  
  if (config.env === env) {
    config.env = 'default';
  }
  
  saveConfig(config);
}
