import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, EyeOff, HardDrive, Lock, Download, WifiOff } from 'lucide-react';

export interface SecurityItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const securityFeatures: SecurityItem[] = [
  {
    icon: ShieldCheck,
    title: 'AES-256 Encryption',
    description:
      'Secrets are encrypted with AES-256-GCM, the same cipher approved for top-secret government data.',
  },
  {
    icon: EyeOff,
    title: 'Zero Plaintext Storage',
    description:
      'Vaults never write plaintext to disk. Values are decrypted only in memory and only when requested.',
  },
  {
    icon: HardDrive,
    title: 'Local First',
    description:
      'Your vault lives on your machine. There is no server to breach, because there is no server.',
  },
  {
    icon: Lock,
    title: 'Encrypted Vault',
    description:
      'A single encrypted file holds every secret. Master passwords are never stored or transmitted.',
  },
  {
    icon: Download,
    title: 'Secure Export',
    description:
      'Exports are encrypted bundles that require the master password to read — safe for backups and sharing.',
  },
  {
    icon: WifiOff,
    title: 'Offline Access',
    description:
      'Read, write, and inject secrets with no internet connection. CloakX works on a plane, in a vault, anywhere.',
  },
];

export interface SecurityTimelineStep {
  step: string;
  title: string;
  description: string;
}

export const securityTimeline: SecurityTimelineStep[] = [
  {
    step: '01',
    title: 'Master Password',
    description:
      'You set a strong master password. CloakX derives a 256-bit key from it using Argon2id with a unique salt.',
  },
  {
    step: '02',
    title: 'Encrypt on Write',
    description:
      'When you store a secret, it is encrypted with AES-256-GCM and written to disk as ciphertext only.',
  },
  {
    step: '03',
    title: 'Decrypt on Read',
    description:
      'When you read a secret, the value is decrypted in memory and printed to stdout — never logged.',
  },
  {
    step: '04',
    title: 'Lock on Idle',
    description:
      'After inactivity, the in-memory key is wiped. The vault returns to a locked state automatically.',
  },
];
