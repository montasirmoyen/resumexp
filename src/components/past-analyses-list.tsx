"use client";

import { useEffect, useState } from 'react';
import { AnalysisService, SavedAnalysis } from '@/services/analysis-service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PastAnalysesListProps {
  onAnalysisSelect?: (analysis: SavedAnalysis) => void;
}

export function PastAnalysesList({ onAnalysisSelect }: PastAnalysesListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AnalysisService.getAnalyses(user.uid);
        setAnalyses(data);
      } catch (err) {
        console.error('Failed to fetch analyses:', err);
        setError('Failed to load past analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user]);

  const handleView = (analysis: SavedAnalysis) => {
    if (onAnalysisSelect) {
      onAnalysisSelect(analysis);
    } else {
      // Store in sessionStorage for the analysis page to pick up
      sessionStorage.setItem('currentAnalysis', JSON.stringify(analysis));
      router.push('/analysis');
    }
  };

  const handleDelete = async (analysis: SavedAnalysis) => {
    if (!user) return;
    const confirmed = window.confirm(`Delete analysis for "${analysis.originalFileName}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(analysis.id);
      setActionError(null);
      await AnalysisService.deleteAnalysis(user.uid, analysis.id, analysis.storagePath);
      setAnalyses(prev => prev.filter(item => item.id !== analysis.id));
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      setActionError('Failed to delete analysis');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Unknown date';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Past Analyses</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Past Analyses</h2>
        <div className="text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Past Analyses</h2>
        <div className="text-center py-12 rounded-lg">
          <p className="text-muted-foreground">No past analyses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Past Analyses</h2>
      {actionError && (
        <div className="text-destructive px-4 py-3 rounded-lg mb-4">
          {actionError}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="border rounded-lg p-4 transition-colors bg-card"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 truncate" title={analysis.originalFileName}>
                  {analysis.originalFileName}
                </h3>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-black">{analysis.analysis.ratings.overall}</div>
                    <div className="text-2xl font-bold text-muted-foreground">/ 10</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(analysis.createdAt)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleView(analysis)}
                  className="w-full px-4 py-2 bg-primary text-background hover:bg-primary/25 hover:text-primary rounded-lg transition-colors font-medium"
                >
                  View Analysis
                </button>
                <button
                  onClick={() => handleDelete(analysis)}
                  disabled={deletingId === analysis.id}
                  className="w-full px-4 py-2 bg-destructive text-foreground hover:bg-destructive/25 hover:text-destructive rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === analysis.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
