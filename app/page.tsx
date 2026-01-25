'use client';

import { useState } from 'react';
import { Upload, Edit3, Plus, RefreshCw, Star, Zap, Shield, FileDown } from 'lucide-react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import StoreProvider from '@/components/StoreProvider';
import { LayoutProvider } from '@/context/LayoutContext';
import Toolbar from '@/components/Toolbar';
import ATSScorePanel from '@/components/ATSScorePanel';
import ResumeContainer from '@/components/ResumeContainer';
import UploadResume from '@/components/UploadResume';
import Logo from '@/components/Logo';
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
 * CV Studio - Free Resume Builder
 * 
 * 100% free, no signup, no payment
 */

function EmptyStateEditor({ onUpload, onStartFromScratch }: { onUpload: () => void; onStartFromScratch: () => void }) {
  return (
    <section 
      className="min-h-[60vh] flex items-center justify-center p-8"
      aria-labelledby="empty-state-heading"
    >
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <Logo size={48} />
        </div>
        <h2 id="empty-state-heading" className="text-2xl font-bold text-gray-800 mb-3">
          Start Building Your Resume
        </h2>
        <p className="text-gray-600 mb-6">
          Upload your existing resume to get started, or create a new one from scratch. 
          <strong className="text-blue-600"> 100% free, no signup required.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onUpload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
            aria-label="Upload your existing resume"
          >
            <Upload size={20} aria-hidden="true" />
            Upload Resume
          </button>
          <button
            onClick={onStartFromScratch}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            aria-label="Create a new resume from scratch"
          >
            <Plus size={20} aria-hidden="true" />
            Start From Scratch
          </button>
        </div>
      </div>
    </section>
  );
}

function ResumeEditor({ onSwitchToUpload, onStartFromScratch }: { onSwitchToUpload: () => void; onStartFromScratch: () => void }) {
  const { hasData, resetResume } = useResume();

  if (!hasData) {
    return <EmptyStateEditor onUpload={onSwitchToUpload} onStartFromScratch={onStartFromScratch} />;
  }

  return (
    <>
      {/* ATS Score Panel */}
      <ATSScorePanel />
      
      {/* Toolbar with Spacing Controls */}
      <Toolbar />

      {/* Resume Content */}
      <main className="py-6 px-2" role="main">
        <div className="max-w-5xl mx-auto" style={{ paddingLeft: '50px' }}>
          <article aria-label="Resume preview and editor">
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
          </article>

          {/* Tips Section */}
          <aside className="mt-6 flex justify-between items-start no-print" aria-label="Resume optimization tips">
            <button
              onClick={resetResume}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              aria-label="Clear resume and start over"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Clear & Start Over
            </button>
            
            <div className="flex gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 max-w-xs">
                <h3 className="font-bold text-blue-800 mb-2 text-sm">🎯 Improve ATS Score</h3>
                <ul className="text-xs text-blue-700 space-y-1" aria-label="ATS optimization tips">
                  <li>• Add quantifiable achievements</li>
                  <li>• Use action verbs</li>
                  <li>• Include keywords</li>
                  <li className="font-medium text-blue-800 mt-1">• <strong>Sharp + ATS:</strong> use <strong>Print → PDF</strong> (recommended), or <strong>DOCX</strong> / <strong>PDF (ATS)</strong>. Image PDF may not parse.</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 max-w-xs">
                <h3 className="font-bold text-green-800 mb-2 text-sm">📐 Fit to Pages</h3>
                <ul className="text-xs text-green-700 space-y-1" aria-label="Page fitting tips">
                  <li>• Use spacing sliders</li>
                  <li>• Try "Compact" preset</li>
                  <li>• Adjust font size</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function UploadTab({ onParsed }: { onParsed: (data: Partial<ResumeData>) => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" role="main">
      {/* Hero Section */}
      <section className="py-12" aria-labelledby="hero-heading">
        <UploadResume onParsed={onParsed} />
      </section>
      
      {/* Features Section - SEO Content */}
      <section 
        className="max-w-6xl mx-auto px-6 pb-16"
        aria-labelledby="features-heading"
      >
        <h2 
          id="features-heading" 
          className="text-2xl font-bold text-center text-gray-800 mb-8"
        >
          Why Choose CV Studio?
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-green-600" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">100% Free Forever</h3>
            <p className="text-sm text-gray-600">
              No hidden fees, no premium plans. Our resume builder is completely free to use.
            </p>
          </article>
          
          {/* Feature 2 */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap size={24} className="text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">No Signup Required</h3>
            <p className="text-sm text-gray-600">
              Start building your resume instantly. No account creation, no email verification.
            </p>
          </article>
          
          {/* Feature 3 */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Star size={24} className="text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">ATS-Optimized</h3>
            <p className="text-sm text-gray-600">
              Built-in ATS score checker helps your resume pass applicant tracking systems.
            </p>
          </article>
          
          {/* Feature 4 */}
          <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <FileDown size={24} className="text-orange-600" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Export to PDF & DOCX</h3>
            <p className="text-sm text-gray-600">
              Download your resume in multiple formats. Perfect for any job application.
            </p>
          </article>
        </div>
        
        {/* SEO Text Content */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create Your Professional Resume Instantly
          </h2>
          <p className="text-gray-600 mb-4">
            CV Studio is the <strong>100% free resume builder</strong> that helps you create 
            professional, ATS-friendly resumes in minutes. Unlike other resume creators, 
            we require <strong>no signup and no payment</strong> – ever.
          </p>
          <p className="text-gray-600">
            Simply upload your existing resume or start from scratch. Our intelligent parser 
            extracts your information automatically, and our editor lets you customize every 
            detail. When you're done, export to PDF or DOCX with one click. 
            <strong> It's that simple – and it's free forever.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}

function MainContent() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const { setResumeData, hasData, resetResume } = useResume();

  const handleParsedResume = (data: Partial<ResumeData>) => {
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
      generalSections: data.generalSections && data.generalSections.length > 0 ? data.generalSections : prev.generalSections,
      sectionVisibility: data.sectionVisibility ? { 
        ...prev.sectionVisibility, 
        ...data.sectionVisibility 
      } : prev.sectionVisibility,
    }));
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print" role="banner">
        <nav className="max-w-6xl mx-auto px-4" aria-label="Main navigation">
          <div className="flex items-center">
            {/* Logo */}
            <a 
              href="/" 
              className="flex items-center gap-2 py-3 pr-8 border-r border-gray-200"
              aria-label="CV Studio - Home"
            >
              <Logo size={28} />
              <span className="text-xl font-bold text-gray-800">CV Studio</span>
              <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                100% Free
              </span>
            </a>
            
            {/* Tab Navigation */}
            <div className="flex" role="tablist" aria-label="Resume builder tabs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'upload' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
                role="tab"
                aria-selected={activeTab === 'upload'}
                aria-controls="upload-panel"
              >
                <Upload size={18} aria-hidden="true" />
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
                role="tab"
                aria-selected={activeTab === 'editor'}
                aria-controls="editor-panel"
              >
                <Edit3 size={18} aria-hidden="true" />
                Editor
                {hasData && (
                  <span 
                    className="ml-1 w-2 h-2 bg-green-500 rounded-full" 
                    aria-label="Resume data loaded"
                  />
                )}
              </button>
            </div>

            {/* Right side actions */}
            <div className="ml-auto flex items-center gap-4">
              {hasData && (
                <button
                  onClick={resetResume}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                  aria-label="Start a new resume"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  New Resume
                </button>
              )}
              <span className="text-sm text-gray-500 hidden sm:block">
                {activeTab === 'upload' 
                  ? 'Upload PDF or DOCX' 
                  : hasData 
                    ? 'Edit your resume' 
                    : 'No data yet'}
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* Tab Panels */}
      <div id="upload-panel" role="tabpanel" hidden={activeTab !== 'upload'}>
        {activeTab === 'upload' && <UploadTab onParsed={handleParsedResume} />}
      </div>
      <div id="editor-panel" role="tabpanel" hidden={activeTab !== 'editor'}>
        {activeTab === 'editor' && (
          <ResumeEditor 
            onSwitchToUpload={() => setActiveTab('upload')} 
            onStartFromScratch={() => {
              // Initialize blank resume with placeholder and switch to editor
              setResumeData({
                header: {
                  name: 'Your Name',
                  title: '',
                  contact: {
                    email: '',
                    phone: '',
                    linkedin: '',
                    github: '',
                    location: '',
                    workAuthorization: '',
                    relocation: '',
                    travel: '',
                  },
                },
                summary: '',
                skills: [],
                experience: [],
                education: [],
                forwardDeployedExpertise: '',
                generalSections: [],
                sectionVisibility: {
                  expertise: false,
                  summary: true,
                  skills: true,
                  education: true,
                },
              });
              setActiveTab('editor');
            }}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 no-print" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo size={24} />
            <span className="font-semibold text-gray-800">CV Studio</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <strong>100% Free Resume Builder</strong> - No Signup, No Payment Required
          </p>
          <p className="text-xs text-gray-500">
            Create professional resumes instantly. Export to PDF or DOCX. ATS-optimized templates.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            © {new Date().getFullYear()} CV Studio. Free forever.
          </p>
          
          {/* Developer Credit */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Built with ❤️ by{' '}
              <a
                href="https://www.linkedin.com/in/atif-shaikh/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                aria-label="Visit developer Atif Shaikh's LinkedIn profile"
              >
                Atif Shaikh
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ResumePage() {
  return (
    <StoreProvider>
      <ResumeProvider>
        <LayoutProvider>
          <MainContent />
        </LayoutProvider>
      </ResumeProvider>
    </StoreProvider>
  );
}
