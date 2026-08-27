import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Patterns to identify potential secrets
const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Access Key', regex: /(aws_secret_access_key|aws_access_key)\s*=\s*['"]?[A-Za-z0-9\/+=]{40}['"]?/gi },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'GitHub Personal Access Token', regex: /ghp_[a-zA-Z0-9]{36}/g },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Slack Bot Token', regex: /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/g },
  { name: 'Generic High-Entropy Secret/Password', regex: /(api_key|apikey|secret_key|database_url|db_pass)\s*[:=]\s*['"]?([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,})['"]?/gi }
];

const PRE_COMMIT_HOOK_SCRIPT = `#!/bin/sh
# CloakX Git Pre-Commit Secret Guard
npx cloakx hook run --staged
`;

function getGitRoot(): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

export function scanFiles(files: string[]): { file: string; line: number; pattern: string; snippet: string }[] {
  const matches: { file: string; line: number; pattern: string; snippet: string }[] = [];

  for (const filePath of files) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) continue;

    // Check for plaintext .env file commits
    const basename = path.basename(filePath);
    if (basename === '.env' || (basename.startsWith('.env.') && !basename.endsWith('.example') && !basename.endsWith('.template'))) {
      matches.push({
        file: filePath,
        line: 1,
        pattern: 'Plaintext .env File',
        snippet: 'Attempting to commit a plaintext environment file'
      });
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        // Skip comments or cloakx ignore markers
        if (lineText.trim().startsWith('#') || lineText.trim().startsWith('//') || lineText.includes('cloakx-ignore')) return;

        for (const rule of SECRET_PATTERNS) {
          rule.regex.lastIndex = 0; // reset regex state
          if (rule.regex.test(lineText)) {
            const maskedSnippet = lineText.trim().replace(/(:=|=|\s)\s*['"]?([^'"]+)['"]?/, '$1 ***MASKED_SECRET***');
            matches.push({
              file: filePath,
              line: idx + 1,
              pattern: rule.name,
              snippet: maskedSnippet
            });
          }
        }
      });
    } catch {
      // Ignore unreadable binary files
    }
  }

  return matches;
}

export function hookCommand(): Command {
  const command = new Command('hook');
  command.description('Git pre-commit secret scanner & hook management');

  command
    .command('install')
    .description('Install CloakX pre-commit hook into current Git repository')
    .action(() => {
      const gitRoot = getGitRoot();
      if (!gitRoot) {
        console.error('❌ Not inside a Git repository.');
        process.exit(1);
      }

      const hooksDir = path.join(gitRoot, '.git', 'hooks');
      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const hookPath = path.join(hooksDir, 'pre-commit');
      fs.writeFileSync(hookPath, PRE_COMMIT_HOOK_SCRIPT, { mode: 0o755 });
      console.log('✔ CloakX pre-commit hook installed successfully in .git/hooks/pre-commit');
    });

  command
    .command('uninstall')
    .description('Remove CloakX pre-commit hook from current Git repository')
    .action(() => {
      const gitRoot = getGitRoot();
      if (!gitRoot) {
        console.error('❌ Not inside a Git repository.');
        process.exit(1);
      }

      const hookPath = path.join(gitRoot, '.git', 'hooks', 'pre-commit');
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
        console.log('✔ CloakX pre-commit hook uninstalled.');
      } else {
        console.log('ℹ️ No pre-commit hook found to uninstall.');
      }
    });

  command
    .command('run')
    .description('Run secret scanner on staged or specified files')
    .option('--staged', 'Scan git staged files only')
    .option('--all', 'Scan all workspace files')
    .action((options) => {
      let filesToScan: string[] = [];

      if (options.staged || (!options.all && options.staged !== false)) {
        try {
          const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
          filesToScan = stagedOutput.split('\n').map(f => f.trim()).filter(Boolean);
        } catch {
          console.error('❌ Failed to retrieve staged git files.');
          process.exit(1);
        }
      } else {
        try {
          const allOutput = execSync('git ls-files', { encoding: 'utf8' });
          filesToScan = allOutput.split('\n').map(f => f.trim()).filter(Boolean);
        } catch {
          console.error('❌ Failed to retrieve git files.');
          process.exit(1);
        }
      }

      if (filesToScan.length === 0) {
        console.log('ℹ️ No files to scan.');
        return;
      }

      console.log(`🔍 [CloakX Guard] Scanning ${filesToScan.length} file(s)...`);
      const violations = scanFiles(filesToScan);

      if (violations.length > 0) {
        console.error(`\n❌ SECURITY VIOLATIONS DETECTED (${violations.length}):`);
        violations.forEach(v => {
          console.error(`  - ${v.file}:${v.line} -> Detected [${v.pattern}]`);
          console.error(`    Snippet: ${v.snippet}`);
        });
        console.error('\nCommit blocked! Move plaintext secrets into CloakX vault before committing.');
        process.exit(1);
      }

      console.log('✔ No secret leaks detected.');
    });

  return command;
}