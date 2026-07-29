import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Installation } from '@/components/Installation';
import { CTA } from '@/components/CTA';

export function InstallationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Installation"
        title="Install CloakX"
        description="Get the CloakX CLI running on your machine in under a minute, then store your first encrypted secret."
      >
        <Link to="/cli" className="btn-secondary group">
          Explore the CLI
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHeader>
      <Installation />
      <CTA />
    </>
  );
}
