import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardPreview } from '@/components/DashboardPreview';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { CTA } from '@/components/CTA';

export function WebPage() {
  return (
    <>
      <PageHeader
        eyebrow="Web Dashboard"
        title="A dashboard for your secrets"
        description="Launch a local-first web UI with one command. Browse, edit, and audit every secret in a polished interface that never exposes your machine to the network."
      >
        <Link to="/cli" className="btn-secondary group">
          See the CLI
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHeader>

      <section className="section-pad pt-4">
        <div className="container-px">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-sm text-muted">
              Launch the dashboard with:
            </p>
            <div className="mt-4">
              <CodeBlock
                code={'$ cloakx web\n✔ Dashboard running at http://127.0.0.1:1201'}
                filename="terminal"
              />
            </div>
          </div>
        </div>
      </section>

      <DashboardPreview />
      <CTA />
    </>
  );
}
