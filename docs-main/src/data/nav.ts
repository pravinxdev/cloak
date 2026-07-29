import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Command,
  Download,
  Terminal,
  LayoutDashboard,
  Code2,
  BookOpen,
  Map,
  HelpCircle,
  Github,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Features', to: '/#features', icon: Command },
  { label: 'Installation', to: '/installation', icon: Download },
  { label: 'CLI', to: '/cli', icon: Terminal },
  { label: 'Web Dashboard', to: '/web', icon: LayoutDashboard },
  { label: 'VS Code', to: '/vscode', icon: Code2 },
  { label: 'Documentation', to: '/docs', icon: BookOpen },
  { label: 'Roadmap', to: '/roadmap', icon: Map },
  { label: 'FAQ', to: '/faq', icon: HelpCircle },
];

export const githubUrl = 'https://github.com/pravinxdev/cloak';
export const npmUrl = 'https://www.npmjs.com/package/cloakx';

export const githubNavItem: NavItem = {
  label: 'GitHub',
  to: githubUrl,
  icon: Github,
};
