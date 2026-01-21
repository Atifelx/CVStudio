'use client';

import { useState } from 'react';
import { Upload, Edit3, FileText } from 'lucide-react';
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
 * CV Studio - Resume Editor with ATS Score Analyzer
 * 
 * Features:
 * - Upload and parse existing resumes (PDF/DOCX)
 * - Real-time ATS score analysis
 * - Editable resume sections
 * - Live spacing controls
 * - PDF/DOCX export
 */
function ResumeEditor({ onSwitchTab }: { onSwitchTab?: () => void }) {
  return (
    <>
      {/* ATS Score Panel - Always visible at top */}
      <ATSScorePanel />
      
      {/* Toolbar with Spacing Controls */}
      <Toolbar />

      {/* Resume Content - FULL WIDTH CONTAINER */}
      <div className="py-6 px-2">
        {/* 
          Use wide container (max-w-5xl = 1024px) for A4-like proportions
          The resume content uses CSS variable for internal padding
          Narrow margins are applied automatically when compact
        */}
        <div className="max-w-5xl mx-auto" style={{ paddingLeft: '50px' }}>
          <ResumeContainer id="resume-content">
            {/* 
              Resume content wrapper with dynamic padding
              Padding shrinks when using compact presets 
            */}
            <div style={{ padding: 'var(--resume-page-margin)' }}>
              <HeaderSection />
              <SummarySection />
              <SkillsSection />
              <ExperienceSection />
              <EducationSection />
              <ExpertiseSection />
            </div>
          </ResumeContainer>

          {/* Tips */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 no-print">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">🎯 Improve ATS Score</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Add more quantifiable achievements (numbers, %)</li>
                <li>• Use action verbs (Led, Developed, Implemented)</li>
                <li>• Include relevant technical keywords</li>
                <li>• Complete all contact information</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">📐 Fit Resume to Pages</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Margins auto-shrink when using compact presets</li>
                <li>• Use "Ultra" preset for maximum density</li>
                <li>• Content expands horizontally to fill space</li>
                <li>• Full width used in PDF export</li>
              </ul>
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
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const { setResumeData } = useResume();

  const handleParsedResume = (data: Partial<ResumeData>) => {
    // Merge parsed data with existing structure
    setResumeData((prev) => ({
      ...prev,
      header: data.header ? { ...prev.header, ...data.header, contact: { ...prev.header.contact, ...data.header.contact } } : prev.header,
      summary: data.summary || prev.summary,
      skills: data.skills && data.skills.length > 0 ? data.skills : prev.skills,
      experience: data.experience && data.experience.length > 0 ? data.experience : prev.experience,
      education: data.education && data.education.length > 0 ? data.education : prev.education,
      forwardDeployedExpertise: data.forwardDeployedExpertise || prev.forwardDeployedExpertise,
      sectionVisibility: data.sectionVisibility ? { ...prev.sectionVisibility, ...data.sectionVisibility } : prev.sectionVisibility,
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
              </button>
            </div>

            {/* Right side info */}
            <div className="ml-auto text-sm text-gray-500">
              {activeTab === 'upload' ? (
                <span>Upload PDF or DOCX to get started</span>
              ) : (
                <span>Edit and customize your resume</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <UploadTab onParsed={handleParsedResume} />
      ) : (
        <ResumeEditor />
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
