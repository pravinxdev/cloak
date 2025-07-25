#!/usr/bin/env node
import { Command } from 'commander';
import { encryptCommand } from './commands/encrypt';
import { decryptCommand } from './commands/decrypt';
import { getCommand } from './commands/get';
import { setCommand } from './commands/set';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';

const program = new Command();

program
  .name('cloak')
  .description('Secure CLI for managing encrypted secrets')
  .version('1.0.0');

program
  .addCommand(encryptCommand())
  .addCommand(decryptCommand())
  .addCommand(getCommand())
  .addCommand(setCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand());

program.parse(process.argv);
