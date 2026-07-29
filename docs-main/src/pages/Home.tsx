import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { WhyCloakX } from '@/components/WhyCloakX';
import { Architecture } from '@/components/Architecture';
import { Commands } from '@/components/Commands';
import { Installation } from '@/components/Installation';
import { DashboardPreview } from '@/components/DashboardPreview';
import { VSCodePreview } from '@/components/VSCodePreview';
import { Security } from '@/components/Security';
import { Roadmap } from '@/components/Roadmap';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';

export function Home() {
  return (
    <>
      <Hero />
      <Features />
      <WhyCloakX />
      <Architecture />
      <Commands />
      <Installation />
      <DashboardPreview />
      <VSCodePreview />
      <Security />
      <Roadmap />
      <FAQ />
      <CTA />
    </>
  );
}
