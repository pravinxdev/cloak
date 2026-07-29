import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Commands } from '@/components/Commands';
import { CTA } from '@/components/CTA';

export function CliPage() {
  return (
    <>
      <PageHeader
        eyebrow="CLI"
        title="The CloakX CLI"
        description="The command-line interface is the heart of CloakX. Search the full reference and copy any command directly."
      >
        <Link to="/installation" className="btn-secondary group">
          Install first
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHeader>
      <Commands />
      <CTA />
    </>
  );
}
