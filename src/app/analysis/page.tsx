'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResult } from '@/types/analysis';
import { AnalysisDisplay } from '@/components/AnalysisDisplay';
import { computeJdMatch } from '@/services/scoring';
import { SavedAnalysis, AnalysisService } from '@/services/analysis-service';
import Link from 'next/link';

export default function AnalysisPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [jdMatch, setJdMatch] = useState<number>(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [analysisId, setAnalysisId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('currentAnalysis');
      if (stored) {
        const data: SavedAnalysis = JSON.parse(stored);
        setResult(data.analysis);
        setFileName(data.originalFileName || '');
        setAnalysisId(data.id || '');
        setUserId(data.userId || '');
        // Detect if user is guest (no userId)
        setIsGuest(!data.userId);
        // Load coverLetter if it exists in SavedAnalysis
        if (data.coverLetter) {
          setResult(prev => prev ? { ...prev, coverLetter: data.coverLetter } : null);
        }
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

  const handleGenerateCoverLetter = async () => {
    if (!result) {
      setCoverLetterError('Missing analysis data');
      return;
    }

    // Guests cannot save cover letters
    if (isGuest) {
      setCoverLetterError('Sign in to save your cover letter');
      return;
    }

    if (!userId || !analysisId) {
      return;
    }

    try {
      setGeneratingCoverLetter(true);
      setCoverLetterError(null);
      const coverLetter = await AnalysisService.generateCoverLetter(result);

      setResult(prev => prev ? { ...prev, coverLetter } : null);

      // Update sessionStorage to persist cover letter
      const stored = sessionStorage.getItem('currentAnalysis');
      if (stored) {
        const data = JSON.parse(stored);
        data.coverLetter = coverLetter;
        sessionStorage.setItem('currentAnalysis', JSON.stringify(data));
      }

      await AnalysisService.updateAnalysisCoverLetter(userId, analysisId, coverLetter);
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      setCoverLetterError(error instanceof Error ? error.message : 'Failed to generate cover letter');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="min-h-screen">
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
                {isGuest && <p className="text-sm text-muted-foreground mt-2">Guest analysis - not saved</p>}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {!result.coverLetter && (
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter || !result}
                    className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
                  </button>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg font-semibold bg-primary text-background hover:bg-primary/25 hover:text-primary transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
                {isGuest && (
                  <Link
                    href="/auth"
                    className="px-4 py-2 rounded-lg font-semibold bg-dark text-foreground hover:bg-foreground hover:text-dark transition-colors duration-200"
                  >
                    Sign In to Save
                  </Link>
                )}
              </div>
            </div>

            {coverLetterError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {coverLetterError}
              </div>
            )}

            <AnalysisDisplay result={result} resumeText={resumeText} />
          </div>
        )}
      </section>
    </div>
  );
}


