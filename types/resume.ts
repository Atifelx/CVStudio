// TypeScript types for resume data structure

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  workAuthorization: string;
  relocation: string;
  travel: string;
}

export interface HeaderData {
  name: string;
  title: string;
  contact: ContactInfo;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  clientNote?: string;
  description: string;
  bullets: string[];
  achievements?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string;
}

/** General section: custom block with title + summary (replaces Forward Deployed Expertise) */
export interface GeneralSectionItem {
  id: string;
  title: string;
  summary: string;
}

// Section visibility settings - for optional/deletable sections
export interface SectionVisibility {
  expertise: boolean;   // General Sections (optional block)
  summary: boolean;     // Professional Summary (optional for some roles)
  skills: boolean;      // Technical Skills
  education: boolean;   // Education section
}

export interface ResumeData {
  header: HeaderData;
  summary: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  forwardDeployedExpertise: string;  // legacy; use generalSections
  generalSections: GeneralSectionItem[];
  sectionVisibility: SectionVisibility;
}

// Section types for editing
export type SectionType = 
  | 'header' 
  | 'summary' 
  | 'skills' 
  | 'experience' 
  | 'education' 
  | 'expertise';
