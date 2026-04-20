"use client";

import { FileUpload } from "@/components/FileUpload"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisState } from '@/types/analysis';
import { AnalysisService } from '@/services/analysis-service';
import { useAuth } from '@/contexts/AuthContext';

export default function Upload() {
    const { user, loading } = useAuth();
    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        isAnalyzing: false,
        result: null,
        error: null
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    // Allow guests to access dashboard, but track if they're authenticated
    const isGuest = !loading && !user;

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        setAnalysisState(prev => ({ ...prev, error: null }));
    };

    const handleAnalyze = async (jobDescription?: string) => {
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
            const result = await AnalysisService.analyzeResume(selectedFile, jobDescription);

            // Save to Firebase only for authenticated users
            if (user) {
                await AnalysisService.saveAnalysis(user.uid, result, selectedFile.name);
            }

            // Store in sessionStorage for the analysis page
            const analysisData: any = {
                analysis: result,
                originalFileName: selectedFile.name
            };

            // Only include auth info if user is authenticated
            if (user) {
                analysisData.id = selectedFile.name; // Will be replaced by actual ID if saving to Firebase
                analysisData.userId = user.uid;
            }

            sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));

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

    return (
        <div className="min-h-screen">
            <section className="mt-24">
                <FileUpload
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analysisState.isAnalyzing}
                    error={analysisState.error}
                    isGuest={isGuest}
                />
            </section>
            {/* Only show past analyses for authenticated users */}
            {!isGuest && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                </section>
            )}
        </div>
    )
}