export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'What is CloakX?',
    answer:
      'CloakX is an open-source secret management platform for developers. It gives you a CLI, a Web Dashboard, and a VS Code Extension to securely store, organize, and inject API keys, tokens, passwords, certificates, and environment variables — all encrypted with AES-256 and stored locally on your own machine.',
  },
  {
    question: 'How secure is it?',
    answer:
      'Every secret is encrypted at rest with AES-256-CBC. Your master password is never stored or sent anywhere — it is run through scrypt locally to produce the encryption key. Values are decrypted only in memory and only when you request them, and the vault locks automatically after inactivity.',
  },
  {
    question: 'Where are secrets stored?',
    answer:
      'Secrets live in an encrypted vault file on your local machine — typically in your user config directory. Nothing is uploaded to any server unless you explicitly enable Cloud Sync (coming soon), and even then the data is end-to-end encrypted before it leaves your device.',
  },
  {
    question: 'Can I use multiple vaults?',
    answer:
      'Yes. You can create as many vaults as you like — personal, work, staging, production — and switch between them with a single command. Each vault has its own master password and is fully isolated from the others.',
  },
  {
    question: 'Does it support teams?',
    answer:
      'Team support with shared vaults, role-based access control, and an audit log is on the roadmap. Today, you can share environment bundles securely with a passcode from 8 to 128 characters.',
  },
  {
    question: 'Can I export my secrets?',
    answer:
      'Absolutely. Use cloakx export to write an encrypted .cloak backup bundle, or export a specific environment as a .env file for legacy tooling. Imports work the same way in reverse — you can import an existing .env file into a vault in one command.',
  },
  {
    question: 'Is CloakX free?',
    answer:
      'Yes. CloakX is MIT licensed and completely free, including for commercial use. The source code is public on GitHub, there is no telemetry, and you are never locked into a paid plan. Optional managed cloud sync and team features will be offered as a paid add-on in the future.',
  },
];
