'use client';

import React, { useCallback } from 'react';
import { Upload, File, X, AlertCircle, LockIcon } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  onFileSelect,
  onAnalyze,
  isAnalyzing,
  error
}) => {
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

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '📝';
    if (file.type === 'text/plain') return '📄';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200  ${selectedFile
            ? 'border-primary bg-card'
            : 'border-primary bg-card hover:bg-card/50 hover:border-primary/50'
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
              <div className="p-4 bg-primary rounded-full">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Upload Your Resume</h3>
                <p>Drop your resume here or choose a file.</p>
                <div id="uploadHelp" className="text-sm">PDF, DOCX, or TXT. Max 10MB.</div>
                <div className="flex items-center space-x-2 text-sm">
                  <LockIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Privacy guaranteed. Your file is never stored.</span>
                </div>
              </div>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">{getFileIcon(selectedFile)}</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">{selectedFile.name}</div>
                <div className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</div>
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
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
