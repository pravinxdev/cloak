import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { VSCodePreview } from '@/components/VSCodePreview';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { CTA } from '@/components/CTA';

export function VSCodePage() {
  return (
    <>
      <PageHeader
        eyebrow="VS Code"
        title="CloakX in your editor"
        description="Install the CloakX extension and bring your vault into VS Code — autocomplete secret keys, insert values, and run commands without switching windows."
      >
        <Link to="/web" className="btn-secondary group">
          See the Web Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHeader>

      <section className="section-pad pt-4">
        <div className="container-px">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-sm text-muted">
              Install from the marketplace or command line:
            </p>
            <div className="mt-4">
              <CodeBlock
                code={'code --install-extension cloakx.cloakx'}
                filename="terminal"
              />
            </div>
          </div>
        </div>
      </section>

      <VSCodePreview />
      <CTA />
    </>
  );
}
