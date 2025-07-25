import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { encrypt } from '../utils/crypto';
import { getSessionPassword } from '../utils/session';
import { vaultPath } from '../config/paths';

export function setCommand() {
  const cmd = new Command('set');
  cmd.arguments('<key> <value>').action((key, value) => {
    const password = getSessionPassword();
   let data: Record<string, string> = {}; // ✅ Correctly typed object
    if (fs.existsSync(vaultPath)) {
      data = JSON.parse(fs.readFileSync(vaultPath, 'utf-8'));
    }
    data[key] = encrypt(value, password);
    fs.writeFileSync(vaultPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${key}`);
  });
  return cmd;
}
