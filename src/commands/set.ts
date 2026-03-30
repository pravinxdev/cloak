import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { encrypt } from '../utils/crypto';
import { getVaultPath } from '../config/paths';
import { getSessionKey } from '../utils/session';

export function setCommand() {
  const cmd = new Command('set').aliases(['add']);
  cmd.arguments('<key> <value>').action((key, value) => {
    // const password = getSessionPassword();
    const keyBuf = getSessionKey();
    let data: Record<string, string> = {}; // ✅ Correctly typed object
    if (fs.existsSync(getVaultPath())) {
      data = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));
    }
    data[key] = encrypt(value, keyBuf);
    // data[key] = encrypt(value, password);
    fs.writeFileSync(getVaultPath(), JSON.stringify(data, null, 2));
    console.log(`Saved ${key}`);
  });
  return cmd;
}
