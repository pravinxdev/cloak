export interface Problem {
  title: string;
  description: string;
  solution: string;
}

export const problems: Problem[] = [
  {
    title: 'Hardcoded secrets',
    description:
      'API keys get pasted straight into source files and shipped to git history, where they leak forever.',
    solution:
      'CloakX keeps secrets out of your code entirely. Reference keys by name and inject values only at runtime.',
  },
  {
    title: '.env files everywhere',
    description:
      'Scattered, unencrypted .env files on every machine, with no audit trail and no rotation.',
    solution:
      'Replace dozens of .env files with one encrypted vault and structured environment groups.',
  },
  {
    title: 'Sharing passwords',
    description:
      'Slack DMs, shared notes, and copy-pasted credentials are how most secrets actually get shared.',
    solution:
      'Export encrypted bundles that only the recipient can unlock, or inject into shared environments.',
  },
  {
    title: 'Team collaboration',
    description:
      'No way to grant, revoke, or audit who can read which secret across a growing team.',
    solution:
      'Per-vault access control and an audit log make collaboration safe and observable.',
  },
  {
    title: 'Environment management',
    description:
      'Keeping dev, staging, and production secrets in sync is a manual, error-prone chore.',
    solution:
      'Named environments let you diff, export, and inject the right secrets for every context.',
  },
];
