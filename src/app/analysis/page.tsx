'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnalysisResult } from '@/types/analysis';
import { AnalysisDisplay } from '@/components/AnalysisDisplay';
import { AnalysisService } from '@/services/analysis-service';
import { ResumePreview } from '@/components/ResumePreview';
import { computeJdMatch, scoreInterviewLikelihood, atsChecks } from '@/services/scoring';

export default function AnalysisPage() {
  React.useEffect(() => {
    document.title = 'enhanceme - Analysis';
  }, []);
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
    } catch {}
  }, []);

  useEffect(() => {
    if (!jd) { setJdMatch(0); setMissing([]); return; }
    const { match, missing } = computeJdMatch(resumeText, role + '\n' + jd);
    setJdMatch(match);
    setMissing(missing);
  }, [jd, role, resumeText]);

  return (
    <div className="min-h-screen">
      <header className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Image className="p-2" src="/logo.png" alt="Sparkle" width={50} height={50} />
              <h1 className="text-2xl font-bold">enhanceme</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
              >
                Back home
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-18">
        {!result ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">No analysis yet</h2>
            <p className="text-gray-600 mb-6">Upload a resume on the home page to get your personalized review.</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h2>
                <p className="text-gray-500">Here&apos;s your comprehensive resume analysis</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
              >
                Analyze another resume
              </button>
            </div>
            <AnalysisDisplay result={result} />

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Target Role & Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="Target role (e.g., Frontend Engineer)" className="border rounded-lg px-3 py-2" />
                  <input placeholder="Company (optional)" className="border rounded-lg px-3 py-2" />
                </div>
                <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste job description (optional)" className="w-full border rounded-lg px-3 py-2 h-32"></textarea>

                <div className="mt-4 flex flex-wrap gap-4 items-center">
                  <div className="text-sm text-gray-700">Match score: <span className="font-semibold">{Math.round(jdMatch * 100)}%</span></div>
                  <div className="text-sm text-gray-700">Interview likelihood: <span className="font-semibold">{result ? scoreInterviewLikelihood(result, jdMatch) : 0}%</span></div>
                </div>
                {missing.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">Potential keyword gaps:</div>
                    <div className="flex flex-wrap gap-2">
                      {missing.slice(0, 12).map((m, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div> */}

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">ATS Checks</h3>
                <ul className="space-y-2">
                  {atsChecks(resumeText).map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${c.passed ? 'bg-green-600' : 'bg-amber-500'}`}></span>
                      <span className={c.passed ? 'text-gray-700' : 'text-amber-700'}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result?.resume && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Rebuilt Resume Preview</h3>
                <ResumePreview resume={result.resume} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white/80 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <div className="inline-flex items-center justify-center gap-2">
              <Image src="/sparkle.png" alt="Sparkle" width={30} height={30} className="align-middle" />
              <p className="m-0">&copy; 2025 enhanceme</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


