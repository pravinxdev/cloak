export interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Documentation',
    links: [
      { label: 'Getting Started', to: '/installation' },
      { label: 'CLI Reference', to: '/cli' },
      { label: 'Web Dashboard', to: '/web' },
      { label: 'VS Code Extension', to: '/vscode' },
      { label: 'Architecture', to: '/#architecture' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'Roadmap', to: '/roadmap' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Features', to: '/#features' },
      { label: 'Security', to: '/#security' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord (Coming Soon)', to: '#', external: true },
      { label: 'Twitter', to: 'https://twitter.com', external: true },
      { label: 'LinkedIn', to: 'https://linkedin.com', external: true },
    ],
  },
];

export interface FooterExternalLink {
  label: string;
  to: string;
  icon: 'github' | 'npm' | 'license' | 'issues' | 'releases';
}

export const footerExternalLinks: FooterExternalLink[] = [
  { label: 'GitHub', to: 'https://github.com/cloakx/cloakx', icon: 'github' },
  { label: 'NPM', to: 'https://www.npmjs.com/package/cloakx', icon: 'npm' },
  { label: 'License', to: 'https://github.com/cloakx/cloakx/blob/main/LICENSE', icon: 'license' },
  { label: 'Issues', to: 'https://github.com/cloakx/cloakx/issues', icon: 'issues' },
  { label: 'Releases', to: 'https://github.com/cloakx/cloakx/releases', icon: 'releases' },
];
