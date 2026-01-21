'use client';

import { useState } from 'react';
import { Upload, Edit3, FileText, Plus, RefreshCw } from 'lucide-react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import { LayoutProvider } from '@/context/LayoutContext';
import Toolbar from '@/components/Toolbar';
import ATSScorePanel from '@/components/ATSScorePanel';
import ResumeContainer from '@/components/ResumeContainer';
import UploadResume from '@/components/UploadResume';
import {
  HeaderSection,
  SummarySection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ExpertiseSection,
} from '@/components/sections';
import { ResumeData } from '@/types/resume';

type TabType = 'upload' | 'editor';

/**
 * CV Studio - Resume Editor
 * 
 * A blank-slate resume editor where users:
 * 1. Upload their existing resume (PDF/DOCX)
 * 2. System parses and maps content to sections
 * 3. User edits and exports polished resume
 */

function EmptyStateEditor({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">No Resume Data Yet</h2>
        <p className="text-gray-600 mb-6">
          Upload your existing resume to get started, or create a new one from scratch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onUpload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Upload size={20} />
            Upload Resume
          </button>
          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Plus size={20} />
            Start From Scratch
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumeEditor({ onSwitchToUpload }: { onSwitchToUpload: () => void }) {
  const { hasData, resetResume } = useResume();

  if (!hasData) {
    return <EmptyStateEditor onUpload={onSwitchToUpload} />;
  }

  return (
    <>
      {/* ATS Score Panel - Always visible at top */}
      <ATSScorePanel />
      
      {/* Toolbar with Spacing Controls */}
      <Toolbar />

      {/* Resume Content */}
      <div className="py-6 px-2">
        <div className="max-w-5xl mx-auto" style={{ paddingLeft: '50px' }}>
          <ResumeContainer id="resume-content">
            <div style={{ padding: 'var(--resume-page-margin)' }}>
              <HeaderSection />
              <SummarySection />
              <SkillsSection />
              <ExperienceSection />
              <EducationSection />
              <ExpertiseSection />
            </div>
          </ResumeContainer>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-start no-print">
            <button
              onClick={resetResume}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <RefreshCw size={16} />
              Clear & Start Over
            </button>
            
            <div className="flex gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 max-w-xs">
                <h3 className="font-bold text-blue-800 mb-2 text-sm">🎯 Improve ATS Score</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Add quantifiable achievements</li>
                  <li>• Use action verbs</li>
                  <li>• Include keywords</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 max-w-xs">
                <h3 className="font-bold text-green-800 mb-2 text-sm">📐 Fit to Pages</h3>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Use spacing sliders</li>
                  <li>• Try "Compact" preset</li>
                  <li>• Adjust font size</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UploadTab({ onParsed }: { onParsed: (data: Partial<ResumeData>) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <UploadResume onParsed={onParsed} />
    </div>
  );
}

function MainContent() {
  const [activeTab, setActiveTab] = useState<TabType>('upload'); // Default to upload
  const { setResumeData, hasData, resetResume } = useResume();

  const handleParsedResume = (data: Partial<ResumeData>) => {
    // Set the parsed data (replacing any existing data)
    setResumeData((prev) => ({
      ...prev,
      header: data.header ? { 
        ...prev.header, 
        ...data.header, 
        contact: { ...prev.header.contact, ...data.header.contact } 
      } : prev.header,
      summary: data.summary ?? prev.summary,
      skills: data.skills && data.skills.length > 0 ? data.skills : prev.skills,
      experience: data.experience && data.experience.length > 0 ? data.experience : prev.experience,
      education: data.education && data.education.length > 0 ? data.education : prev.education,
      forwardDeployedExpertise: data.forwardDeployedExpertise ?? prev.forwardDeployedExpertise,
      sectionVisibility: data.sectionVisibility ? { 
        ...prev.sectionVisibility, 
        ...data.sectionVisibility 
      } : prev.sectionVisibility,
    }));
    
    // Switch to editor tab
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 py-3 pr-8 border-r border-gray-200">
              <FileText className="text-blue-600" size={24} />
              <span className="text-xl font-bold text-gray-800">CV Studio</span>
            </div>
            
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('upload')}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'upload' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <Upload size={18} />
                Upload Resume
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'editor' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <Edit3 size={18} />
                Editor
                {hasData && (
                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Right side info */}
            <div className="ml-auto flex items-center gap-4">
              {hasData && (
                <button
                  onClick={resetResume}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  New Resume
                </button>
              )}
              <span className="text-sm text-gray-500">
                {activeTab === 'upload' ? 'Upload PDF or DOCX' : hasData ? 'Edit your resume' : 'No data yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <UploadTab onParsed={handleParsedResume} />
      ) : (
        <ResumeEditor onSwitchToUpload={() => setActiveTab('upload')} />
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <ResumeProvider>
      <LayoutProvider>
        <MainContent />
      </LayoutProvider>
    </ResumeProvider>
  );
}
