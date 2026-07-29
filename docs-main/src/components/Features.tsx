import { features } from '@/data/features';
import { FeatureCard } from '@/components/FeatureCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Features() {
  return (
    <section id="features" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Trusted Features"
          title="Everything you need to manage secrets safely"
          description="A complete toolkit — from the encrypted vault on disk to the editor you already use. No servers required, no trust required."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
