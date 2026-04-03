import { Command } from 'commander';
import {
  getActiveEnvironment,
  setActiveEnvironment,
  listEnvironments,
  createEnvironment,
  deleteEnvironment
} from '../utils/environments';

export function envCommand() {
  const cmd = new Command('env');

  cmd.description('Manage environment profiles');

  // env set <name>
  cmd
    .command('set <name>')
    .description('Set active environment')
    .action((name) => {
      try {
        setActiveEnvironment(name);
        console.log(`✅ Active environment: ${name}`);
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
      }
    });

  // env list
  cmd
    .command('list')
    .description('List all environments')
    .action(() => {
      const envs = listEnvironments();
      const active = getActiveEnvironment();

      console.log('\n🌍 Environments:');
      envs.forEach((env) => {
        const marker = env === active ? ' ✓' : '';
        console.log(`  ${env}${marker}`);
      });
    });

  // env current
  cmd
    .command('current')
    .description('Show active environment')
    .action(() => {
      const active = getActiveEnvironment();
      console.log(`🌍 Active: ${active}`);
    });

  // env create <name>
  cmd
    .command('create <name>')
    .description('Create new environment')
    .action((name) => {
      try {
        createEnvironment(name);
        console.log(`✅ Created environment: ${name}`);
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
      }
    });

  // env delete <name>
  cmd
    .command('delete <name>')
    .description('Delete environment')
    .action((name) => {
      try {
        if (name === 'default') {
          console.error('❌ Cannot delete default environment');
          return;
        }
        deleteEnvironment(name);
        console.log(`✅ Deleted environment: ${name}`);
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
      }
    });

  return cmd;
}