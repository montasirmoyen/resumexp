'use client';

import { Star, Lightbulb, Book } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisState } from '@/types/analysis';
import { AnalysisService } from '@/services/analysis-service';
import { FileUpload } from '@/components/FileUpload';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasPreviousAnalysis, setHasPreviousAnalysis] = useState(false);
  const router = useRouter();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setAnalysisState(prev => ({ ...prev, error: null }));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const validation = AnalysisService.validateFile(selectedFile);
    if (!validation.isValid) {
      setAnalysisState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file',
        result: null
      }));
      return;
    }

    setAnalysisState({
      isAnalyzing: true,
      result: null,
      error: null
    });

    try {
      const result = await AnalysisService.analyzeResume(selectedFile);
      try {
        sessionStorage.setItem('lastAnalysis', JSON.stringify(result));
      } catch { }
      setAnalysisState({
        isAnalyzing: false,
        result: null,
        error: null
      });
      router.push('/analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState({
        isAnalyzing: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to analyze resume'
      });
    }
  };

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lastAnalysis');
      setHasPreviousAnalysis(!!stored);
    } catch {
      setHasPreviousAnalysis(false);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-18">
        <div className="text-center mb-16 mt-4">
          <h2 className="text-5xl font-bold mb-6">
            Stand Out with
            <span className="text-primary">
              {' '}AI-Powered Resume Reviews
            </span>
          </h2>
          <p className="font-medium text-lg max-w-3xl mx-auto mb-12">
            Enhance your resume with objective ratings, smart analysis, and ATS compliance to boost your career prospects.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary mb-6">
                <Book className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Honest Ratings</h3>
              <p className="text-center leading-relaxed">
                Objective ratings across key resume aspects to highlight strengths and weaknesses
              </p>
            </div>

            <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary mb-6">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Analysis</h3>
              <p className="text-center leading-relaxed">
                Powerful analysis to evaluate your resume&apos;s strengths and areas for improvement
              </p>
            </div>

            <div className="flex flex-col items-center p-8 rounded-2xl bg-card border border-primary shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ATS Compliant</h3>
              <p className="text-center leading-relaxed">
                Built on compatibility with Applicant Tracking Systems (ATS)
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            isAnalyzing={analysisState.isAnalyzing}
            error={analysisState.error}
          />
        </div>
      </section>
    </div>
  );
}
