"use client";

import HeroSection from '@/components/ui/hero-section'
import SocialProof from '@/components/ui/social-proof'

const features = [
  {
    title: 'Detailed Resume Scoring',
    description: 'Get ratings across content, structure, readability, keywords, and professionalism'
  },
  {
    title: 'ATS & Job Match Insights',
    description: 'Check ATS compliance and compare your resume against any job description'
  },
  {
    title: 'Actionable Next Steps',
    description: 'Receive clear section-by-section improvements and practical recommendations'
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
