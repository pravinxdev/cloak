import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';

export function envCommand() {
  const cmd = new Command('env');

  const configPath = path.join(os.homedir(), '.cloakx', 'config.json');

  cmd
    .argument('<name>', 'Environment name')
    .action((name) => {
      const config = { env: name };

      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log(`🌍 Switched to environment: ${name}`);
    });

  return cmd;
}