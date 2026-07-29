import { PageHeader } from '@/components/ui/PageHeader';
import { Roadmap } from '@/components/Roadmap';
import { CTA } from '@/components/CTA';

export function RoadmapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Roadmap"
        title="The CloakX roadmap"
        description="What's shipped, what's in progress, and what's coming next. Built in the open — track every milestone."
      />
      <Roadmap />
      <CTA />
    </>
  );
}
