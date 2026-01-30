'use client';

import React from 'react';
import { AnalysisResult } from '@/types/analysis';
import { Star, TrendingUp, Target, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const RatingBar: React.FC<{ label: string; value: number; max?: number }> = ({
  label,
  value,
  max = 10
}) => {
  const percentage = (value / max) * 100;
  const getColor = (val: number) => {
    if (val >= 8) return 'bg-green-500';
    if (val >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const SectionAnalysis: React.FC<{
  title: string;
  section: { strengths: string[]; improvements: string[] }
}> = ({ title, section }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>

    {section.strengths.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h5 className="font-medium text-green-700">Strengths</h5>
        </div>
        <ul className="space-y-2">
          {section.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{strength}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {section.improvements.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h5 className="font-medium text-amber-700">Areas for Improvement</h5>
        </div>
        <ul className="space-y-2">
          {section.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const getOverallScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-xl border-2 p-6 border-gray-200`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Resume Rating</h3>
              <p className="text-gray-600">Based on comprehensive analysis</p>
            </div>
          </div>
          <div className={`text-4xl font-black ${getOverallScoreColor(result.overallScore)}`}>
            {result.overallScore} / 10
          </div>
        </div>

        {result.summary && (
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-6 h-6 text-green-600" />
          Detailed Ratings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RatingBar label="Content Quality" value={result.ratings.content} />
          <RatingBar label="Structure" value={result.ratings.structure} />
          <RatingBar label="Formatting" value={result.ratings.formatting} />
          <RatingBar label="Keywords" value={result.ratings.keywords} />
          <RatingBar label="Achievements" value={result.ratings.achievements} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 space-y-6 p-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-green-600" />
          Detailed Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionAnalysis title="Content Analysis" section={result.deepAnalysis.content} />
          <SectionAnalysis title="Structure Analysis" section={result.deepAnalysis.structure} />
          <SectionAnalysis title="Formatting Analysis" section={result.deepAnalysis.formatting} />
          <SectionAnalysis title="Keywords Analysis" section={result.deepAnalysis.keywords} />
          <SectionAnalysis title="Achievements Analysis" section={result.deepAnalysis.achievements} />
        </div>
      </div>

      {result.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-green-600" />
            Key Recommendations
          </h3>
          <div className="space-y-4">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
