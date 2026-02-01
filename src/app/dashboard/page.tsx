"use client";

import { FileUpload } from "@/components/FileUpload"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisState } from '@/types/analysis';
import { AnalysisService } from '@/services/analysis-service';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        isAnalyzing: false,
        result: null,
        error: null
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasPreviousAnalysis, setHasPreviousAnalysis] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <section className="mt-24">
                <FileUpload
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analysisState.isAnalyzing}
                    error={analysisState.error}
                />
            </section>
        </div>
    )
}