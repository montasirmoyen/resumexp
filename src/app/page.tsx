"use client";

import { useRouter } from 'next/navigation';
import { AuroraText } from "@/components/ui/aurora-text"
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/ui/hero-section'

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen">
      <section className='flex flex-col'>
        <HeroSection />
      </section>
    </div>
  );
}
