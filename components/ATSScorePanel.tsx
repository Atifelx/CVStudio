'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Lightbulb,
  Star,
  TrendingUp
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { analyzeResume, ATSResult, ATSCategory, getScoreColor, getScoreBgColor } from '@/utils/atsAnalyzer';

/**
 * ATS Score Panel Component
 * Shows real-time ATS compatibility score with detailed breakdown
 */
export default function ATSScorePanel() {
  const { resumeData } = useResume();
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Analyze resume whenever data changes
  useEffect(() => {
    const result = analyzeResume(resumeData);
    setAtsResult(result);
  }, [resumeData]);

  if (!atsResult) return null;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: ATSCategory['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'poor':
        return <XCircle size={14} className="text-red-500" />;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 no-print">
      {/* Main Score Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">ATS Score:</span>
            </div>
            
            {/* Score Circle */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(atsResult.percentage)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(atsResult.percentage)}`}>
                {atsResult.percentage}%
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${getGradeColor(atsResult.grade)}`}>
                {atsResult.grade}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden md:block">
              <div
                className={`h-full transition-all duration-500 ${
                  atsResult.percentage >= 80 ? 'bg-green-500' :
                  atsResult.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${atsResult.percentage}%` }}
              />
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              {atsResult.categories.slice(0, 3).map((cat) => (
                <div key={cat.name} className="flex items-center gap-1">
                  {getStatusIcon(cat.status)}
                  <span className="text-gray-600">{cat.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Categories */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {atsResult.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className={`p-2 rounded-lg border ${
                      cat.status === 'good' ? 'bg-green-50 border-green-200' :
                      cat.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {cat.name}
                      </span>
                      {getStatusIcon(cat.status)}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${
                        cat.status === 'good' ? 'text-green-600' :
                        cat.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {cat.score}
                      </span>
                      <span className="text-xs text-gray-400">/{cat.maxScore}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          cat.status === 'good' ? 'bg-green-500' :
                          cat.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    {/* Show specific feedback for low-scoring categories */}
                    {cat.status !== 'good' && cat.feedback.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-[10px] text-gray-600 space-y-0.5">
                          {cat.feedback
                            .filter(f => f.startsWith('✗') || f.startsWith('⚠'))
                            .slice(0, 2)
                            .map((fb, idx) => (
                              <div key={idx} className="truncate" title={fb}>
                                {fb.replace(/^[✗⚠]\s*/, '')}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Suggestions & Strengths */}
              <div className="space-y-3">
                {/* Top Suggestions */}
                {atsResult.suggestions.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-orange-600" />
                      <span className="text-xs font-semibold text-orange-800">What to Fix</span>
                    </div>
                    <ul className="space-y-1.5">
                      {atsResult.suggestions.slice(0, 5).map((suggestion, i) => (
                        <li key={i} className="text-xs text-orange-700 flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5">→</span>
                          <span className="flex-1">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                    {atsResult.suggestions.length > 5 && (
                      <div className="text-[10px] text-orange-600 mt-2 pt-2 border-t border-orange-200">
                        +{atsResult.suggestions.length - 5} more suggestions
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths */}
                {atsResult.strengths.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={14} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-800">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {atsResult.strengths.slice(0, 3).map((strength, i) => (
                        <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                          <span className="text-green-400">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-3 space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <TrendingUp size={12} />
                <span>Aim for 80%+ ATS score. Edit sections to improve your score in real-time.</span>
              </div>
              <p className="text-green-800/90">
                <strong>Best for quality + ATS:</strong> <strong>Print → PDF</strong>. Or <strong>DOCX</strong> / <strong>PDF (ATS)</strong>. Image PDF = not ideal for ATS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
