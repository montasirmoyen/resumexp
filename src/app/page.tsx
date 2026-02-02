"use client";

import { useRouter } from 'next/navigation';
import { AuroraText } from "@/components/ui/aurora-text"
import { LayersIcon } from "@/components/ui/layers"
import { ZapIcon } from "@/components/ui/zap"
import { ShieldCheckIcon } from "@/components/ui/shield-check"

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-18">
        <div className="text-center mb-16 mt-4">
          <h2 className="text-5xl font-bold mb-6">
            Maximize Your Resume with an {' '}
            <br />
            <span className="text-primary">
              <AuroraText>AI-Powered Expert</AuroraText>
            </span>
          </h2>
          <p className="font-medium text-lg max-w-3xl mx-auto mb-6">
            Instant analysis, practical recommendations, and ATS optimization to help you stand out.
          </p>
          <button
            onClick={() => handleClick()}
            className="px-6 py-3 rounded-lg font-semibold bg-primary text-background hover:bg-primary/25 hover:text-primary transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </section>
      
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 rounded-full bg-dark mb-6">
              <LayersIcon className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Honest Ratings</h3>
            <p className="text-center leading-relaxed">
              Objective ratings across key resume aspects to highlight strengths and weaknesses
            </p>
          </div>

          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 rounded-full bg-dark mb-6">
              <ZapIcon className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Job Match</h3>
            <p className="text-center leading-relaxed">
              Tailored suggestions to align your resume with specific job descriptions
            </p>
          </div>

          <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 rounded-full bg-dark mb-6">
              <ShieldCheckIcon className="text-primary"/>
            </div>
            <h3 className="text-xl font-semibold mb-3">ATS Compliant</h3>
            <p className="text-center leading-relaxed">
              Receive suggestions to maximize your resume's Applicant Tracking Systems (ATS) compatibility
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
