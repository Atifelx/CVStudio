'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ResumeData, SectionType } from '@/types/resume';

/**
 * BLANK SKELETON RESUME
 * 
 * Users upload their own resume to populate this data
 * All fields start empty - no pre-filled content
 */
const initialResumeData: ResumeData = {
  header: {
    name: '',
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
  sectionVisibility: {
    expertise: false,
    summary: true,
    skills: true,
    education: true,
  },
};

// Context type
interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  editingSection: SectionType | null;
  setEditingSection: React.Dispatch<React.SetStateAction<SectionType | null>>;
  editingItemId: string | null;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  hasData: boolean; // Track if user has uploaded/entered data
  resetResume: () => void; // Reset to blank state
}

// Create context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider component
export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Check if user has entered any data
  const hasData = Boolean(
    resumeData.header.name ||
    resumeData.summary ||
    resumeData.skills.length > 0 ||
    resumeData.experience.length > 0 ||
    resumeData.education.length > 0
  );

  // Reset to blank state
  const resetResume = () => {
    setResumeData(initialResumeData);
    setEditingSection(null);
    setEditingItemId(null);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        editingSection,
        setEditingSection,
        editingItemId,
        setEditingItemId,
        hasData,
        resetResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook for using the context
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
