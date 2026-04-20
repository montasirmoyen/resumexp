'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Upload, File, X, AlertCircle, LockIcon } from 'lucide-react';
import { PastAnalysesList } from './past-analyses-list';
import Link from 'next/link'; 
import { Button } from './ui/button';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onAnalyze: (jobDescription?: string) => void;
  isAnalyzing: boolean;
  error: string | null;
  isGuest?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  onFileSelect,
  onAnalyze,
  isAnalyzing,
  error,
  isGuest = false
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Extracting your resume…');
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (!isAnalyzing) {
      setElapsedTime(0);
      setCurrentMessage('Extracting your resume…');
      setMessageOpacity(1);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 1;

        // Update message based on time
        if (next < 10) {
          setCurrentMessage('Extracting your resume…');
        } else if (next < 20) {
          setCurrentMessage('Analyzing your resume…');
        } else if (next < 40) {
          setCurrentMessage('Finalizing everything for you…');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Fade effect when message changes
  useEffect(() => {
    setMessageOpacity(0);
    const timer = setTimeout(() => setMessageOpacity(1), 300);
    return () => clearTimeout(timer);
  }, [currentMessage]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      onFileSelect(null);
      return;
    }
    onFileSelect(files[0]);
  }, [onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <section className="w-full max-w-2xl mx-auto">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-20 px-2">
            <div className="relative w-24 h-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>

            <div
              className="text-center transition-opacity duration-300"
              style={{ opacity: messageOpacity }}
            >
              <p className="text-lg font-medium text-foreground">{currentMessage}</p>
            </div>
          </div>
        ) : (
          <div
            id="fileUploadArea"
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200  ${selectedFile
              ? 'border-primary'
              : 'border-primary hover:bg-card/25 hover:border-primary'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="region"
            aria-label="Resume upload area"
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="resumeUpload"
              disabled={isAnalyzing}
              aria-describedby="uploadHelp"
            />

            {!selectedFile ? (
              <label htmlFor="resumeUpload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-dark rounded-full">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Upload Your Resume</h3>
                    <div id="uploadHelp" className="text-sm">PDF, DOCX, or TXT. Max 10MB.</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <LockIcon className="size-4" />
                      <span>Privacy guaranteed, your file is never shared.</span>
                    </div>
                  </div>
                </div>
              </label>
            ) : (
              <div>
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <File />
                    <div className="text-left">
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-sm">{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button
                      onClick={removeFile}
                      disabled={isAnalyzing}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onAnalyze(jobDescription.trim() || undefined)}
                    disabled={isAnalyzing}
                    className="w-full px-6 py-3 bg-primary text-background hover:bg-primary/25 hover:text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-busy={isAnalyzing}
                    aria-live="polite"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <File className="w-4 h-4" />
                        Analyze Resume
                      </>
                    )}
                  </button>
                </div>

                {/* Job Description Input */}
                <div className="space-y-2 mt-6">
                  <p className="font-bold"> (Optional) Job Description </p>
                  <p className="text-sm">
                    Paste a job description to get a job match score and tailored suggestions.
                  </p>
                  <div>
                    <textarea
                      id="jobDescription"
                      name="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value.slice(0, 3000))}
                      maxLength={3000}
                      rows={6}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
                      placeholder="Paste job description here (max 3000 characters)..."
                      disabled={isAnalyzing}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {jobDescription.length} / 3000 characters
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </section>
      {(!isAnalyzing && !selectedFile && !isGuest) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PastAnalysesList />
        </section>
      )}
      {(!isAnalyzing && !selectedFile && isGuest) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="text-center py-12 rounded-lg">
            <p className="text-muted-foreground mb-4">Sign in to save and access your past analyses</p>
            <Link href="/auth" className="px-4 py-2 bg-primary text-background hover:bg-primary/25 hover:text-primary rounded-lg transition-colors font-medium inline-block">
              Sign In
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
