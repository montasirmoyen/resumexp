"use client";

import HeroSection from '@/components/ui/hero-section'
import SocialProof from '@/components/ui/social-proof'

const features = [
  {
    title: 'Powerful Campaign Tracking & ROI Analysis',
    description: 'Track campaign performance and analyze return on investment'
  },
  {
    title: 'Customizable Reporting & Data Exportation',
    description: 'Create custom reports and export data easily'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className='flex flex-col'>
        <HeroSection />
      </section>
      <section>
        <SocialProof features={features} />
      </section>
    </div>
  );
}
