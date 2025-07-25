// commands/logout.ts
import { Command } from 'commander';
import { clearSession } from '../utils/session';

export function logoutCommand() {
  const cmd = new Command('logout');
  cmd.action(() => {
    clearSession();
    console.log('🔓 Logged out');
  });
  return cmd;
}
