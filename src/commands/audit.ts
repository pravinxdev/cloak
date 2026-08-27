import { Command } from 'commander';
import { loadVault, SecretMetadata } from '../utils/vault';
import { getSession } from '../utils/session';

export interface AuditFinding {
  type: 'EXPIRED' | 'EXPIRING_SOON' | 'WEAK_VALUE' | 'DUPLICATE_VALUE' | 'STALE';
  key: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy * len;
}

export function auditVault(): { findings: AuditFinding[]; score: number; total: number } {
  const vault = loadVault();
  const keys = Object.keys(vault);
  const total = keys.length;

  if (total === 0) {
    return { findings: [], score: 100, total: 0 };
  }

  const findings: AuditFinding[] = [];
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

  // Track value occurrences for duplicate detection
  const valueToKeys: Record<string, string[]> = {};

  for (const key of keys) {
    const rawEntry = vault[key];
    const metadata: SecretMetadata = typeof rawEntry === 'string'
      ? { value: rawEntry, createdAt: now, updatedAt: now, environment: 'default' }
      : rawEntry;

    const val = metadata.value;

    // 1. Expiration Checks
    if (metadata.expiresAt) {
      if (now > metadata.expiresAt) {
        findings.push({
          type: 'EXPIRED',
          key,
          message: `Secret expired on ${new Date(metadata.expiresAt).toLocaleDateString()}`,
          severity: 'HIGH'
        });
      } else if (metadata.expiresAt - now <= SEVEN_DAYS_MS) {
        findings.push({
          type: 'EXPIRING_SOON',
          key,
          message: `Secret expires in Math.ceil(($metadata.expiresAt - now) / (1000 * 60 * 60 * 24)) days`,
          severity: 'MEDIUM'
        });
      }
    }

    // 2. Duplicate Detection
    if (val) {
      if (!valueToKeys[val]) valueToKeys[val] = [];
      valueToKeys[val].push(key);
    }

    // 3. Entropy & Weakness Check
    if (val && val.length < 8) {
      findings.push({
        type: 'WEAK_VALUE',
        key,
        message: `Secret value is too short (< 8 characters)`,
        severity: 'HIGH'
      });
    } else if (val && ['password', '123456', 'admin', 'secret', 'default', 'test'].includes(val.toLowerCase())) {
      findings.push({
        type: 'WEAK_VALUE',
        key,
        message: `Secret uses an easily guessable password`,
        severity: 'HIGH'
      });
    }

    // 4. Stale Entry Check (Not updated in > 90 days)
    if (metadata.updatedAt && (now - metadata.updatedAt > NINETY_DAYS_MS)) {
      findings.push({
        type: 'STALE',
        key,
        message: `Secret has not been updated in over 90 days`,
        severity: 'LOW'
      });
    }
  }

  // Record duplicates
  for (const [val, dupKeys] of Object.entries(valueToKeys)) {
    if (dupKeys.length > 1) {
      dupKeys.forEach(k => {
        findings.push({
          type: 'DUPLICATE_VALUE',
          key: k,
          message: `Identical secret value shared with: ${dupKeys.filter(x => x !== k).join(', ')}`,
          severity: 'MEDIUM'
        });
      });
    }
  }

  // Calculate Health Score (100 base, deductions for findings)
  let penalty = 0;
  findings.forEach(f => {
    if (f.severity === 'HIGH') penalty += 15;
    if (f.severity === 'MEDIUM') penalty += 8;
    if (f.severity === 'LOW') penalty += 3;
  });

  const score = Math.max(0, 100 - penalty);

  return { findings, score, total };
}

export function auditCommand(): Command {
  const command = new Command('audit');

  command
    .description('Audit vault health, check expiration, weak passwords, and duplicate values')
    .action(() => {
      const session = getSession();
      if (!session) {
        console.error('❌ Vault is locked. Please run `cloakx login` first.');
        process.exit(1);
      }

      const { findings, score, total } = auditVault();

      console.log(`\n🔍 [CloakX Audit] Auditing active vault (${total} secret(s))...\n`);

      if (findings.length === 0) {
        console.log('✅ Excellent health! No security issues, duplicates, or expired secrets found.');
        console.log(`\nVault Health Score: 100/100 🛡️\n`);
        return;
      }

      console.log(`⚠️ ISSUES DETECTED (${findings.length}):\n`);
      findings.forEach(f => {
        const badge = f.severity === 'HIGH' ? '🔴 HIGH' : f.severity === 'MEDIUM' ? '🟡 MED' : '🔵 LOW';
        console.log(`  [${badge}] ${f.key} (${f.type})`);
        console.log(`         ${f.message}\n`);
      });

      console.log(`--------------------------------------------------`);
      console.log(`Vault Health Score: ${score}/100 🛡️`);
      if (score < 70) {
        console.log(`Status: Needs Attention ⚠️`);
      } else {
        console.log(`Status: Fair 🟡`);
      }
      console.log(`Run \`cloakx update <KEY>\` or \`cloakx delete <KEY>\` to resolve issues.\n`);
    });

  return command;
}