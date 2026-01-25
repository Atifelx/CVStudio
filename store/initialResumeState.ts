import type { ResumeData, SectionType } from '@/types/resume';

export const initialResumeData: ResumeData = {
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
  generalSections: [],
  sectionVisibility: {
    expertise: false,
    summary: true,
    skills: true,
    education: true,
  },
};

export interface ResumeState {
  resumeData: ResumeData;
  editingSection: SectionType | null;
  editingItemId: string | null;
}

export const initialResumeState: ResumeState = {
  resumeData: initialResumeData,
  editingSection: null,
  editingItemId: null,
};
