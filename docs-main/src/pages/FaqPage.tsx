import { PageHeader } from '@/components/ui/PageHeader';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';

export function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="The essentials about security, storage, teams, and licensing — all in one place."
      />
      <FAQ />
      <CTA />
    </>
  );
}
