import { Command } from 'commander';
import { getSession } from '../utils/session';

export function statusCommand(): Command {
  const command = new Command('status');

  command
    .description('Check current login status')
    .action(() => {
      const session = getSession();

      if (!session) {
        console.log('❌ Not logged in.');
        return;
      }

      console.log(`✅ Logged in as: ${session.username}`);
      console.log(`🔑 Token: ${session.token}`);
      console.log(`🕒 Session expires at: ${session.expiresAt}`);
    });

  return command;
}
