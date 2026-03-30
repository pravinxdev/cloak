#!/usr/bin/env node
import { Command } from 'commander';
import { encryptCommand } from './commands/encrypt';
import { decryptCommand } from './commands/decrypt';
import { getCommand } from './commands/get';
import { setCommand } from './commands/set';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { statusCommand } from './commands/status';
import { listCommand } from './commands/list';
import { deleteCommand } from './commands/delete';
import updCommand from './commands/update';
import { importCommand } from './commands/import';
import { exportCommand } from './commands/export';
import { webCommand } from './commands/web';
import { runCommand } from './commands/run';
import { envCommand } from './commands/env';
import { syncCommand } from './commands/sync';



const program = new Command();

program
  .name('cloakx')
  .description('Secure CLI for managing encrypted secrets')
  .version('1.0.0');

program
  .addCommand(encryptCommand())
  .addCommand(decryptCommand())
  .addCommand(getCommand())
  .addCommand(setCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand())
  .addCommand(listCommand())
  .addCommand(statusCommand())
  .addCommand(deleteCommand())
  .addCommand(updCommand)
  .addCommand(exportCommand())
  .addCommand(importCommand())
  .addCommand(webCommand())
  .addCommand(runCommand())
  .addCommand(envCommand())
  .addCommand(syncCommand());


program.parse(process.argv);
