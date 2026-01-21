'use client';

import { ResumeProvider } from '@/context/ResumeContext';
import { LayoutProvider } from '@/context/LayoutContext';
import Toolbar from '@/components/Toolbar';
import ATSScorePanel from '@/components/ATSScorePanel';
import ResumeContainer from '@/components/ResumeContainer';
import {
  HeaderSection,
  SummarySection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ExpertiseSection,
} from '@/components/sections';

/**
 * CV Studio - Resume Editor with ATS Score Analyzer
 * 
 * Features:
 * - Real-time ATS score analysis
 * - Editable resume sections
 * - Live spacing controls
 * - PDF/DOCX export
 */
export default function ResumePage() {
  return (
    <ResumeProvider>
      <LayoutProvider>
        <div className="min-h-screen bg-gray-100">
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
        </div>
      </LayoutProvider>
    </ResumeProvider>
  );
}
