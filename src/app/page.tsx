"use client";

import { useRouter } from 'next/navigation';
import { AuroraText } from "@/components/ui/aurora-text"
import { Button } from '@/components/ui/button';

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
          <Button onClick={handleClick} className="px-6 py-3 rounded-lg font-semibold">
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}
