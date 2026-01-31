'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnalysisResult } from '@/types/analysis';
import { AnalysisDisplay } from '@/components/AnalysisDisplay';
import { AnalysisService } from '@/services/analysis-service';
import { ResumePreview } from '@/components/ResumePreview';
import { computeJdMatch, scoreInterviewLikelihood, atsChecks } from '@/services/scoring';
import Navbar from '@/components/Navbar';

export default function AnalysisPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [jdMatch, setJdMatch] = useState<number>(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lastAnalysis');
      if (stored) {
        setResult(JSON.parse(stored));
      }
      const txt = sessionStorage.getItem('lastResumeText');
      if (txt) setResumeText(txt);
    } catch { }
  }, []);

  useEffect(() => {
    if (!jd) { setJdMatch(0); setMissing([]); return; }
    const { match, missing } = computeJdMatch(resumeText, role + '\n' + jd);
    setJdMatch(match);
    setMissing(missing);
  }, [jd, role, resumeText]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-18">
        {!result ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">No analysis yet</h2>
            <p className="mb-6">Upload a resume on the home page to get your personalized review.</p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to home
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Resume Analysis</h2>
                <p>Here&apos;s your comprehensive resume analysis</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-primary hover:text-primary/50 hover:bg-primary/50 rounded-lg transition-colors"
              >
                Analyze another resume
              </button>
            </div>

            <AnalysisDisplay result={result} resumeText={resumeText} />

            {/*{result?.resume && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4">Rebuilt Resume Preview</h3>
                <ResumePreview resume={result.resume} />
              </div>
            )}*/}
          </div>
        )}
      </section>
    </div>
  );
}


