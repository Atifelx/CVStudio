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

/** Custom section content type */
export type CustomSectionType = 'paragraph' | 'bullets' | 'items';

/** Custom section: fully customizable section with title and flexible content */
export interface CustomSection {
  id: string;
  title: string;           // Section title (e.g., "Hobbies", "Certifications", "Languages")
  contentType: CustomSectionType;
  content: string;         // For paragraph type
  bullets: string[];       // For bullets type
  items: Array<{           // For items type (e.g., certifications, languages)
    label: string;
    value: string;
  }>;
  order: number;           // Display order
}

// Preset section templates for quick adding
export const CUSTOM_SECTION_PRESETS = [
  { title: 'Certifications', contentType: 'items' as CustomSectionType, icon: 'award' },
  { title: 'Languages', contentType: 'items' as CustomSectionType, icon: 'globe' },
  { title: 'Hobbies & Interests', contentType: 'paragraph' as CustomSectionType, icon: 'heart' },
  { title: 'Volunteer Experience', contentType: 'bullets' as CustomSectionType, icon: 'users' },
  { title: 'Awards & Honors', contentType: 'bullets' as CustomSectionType, icon: 'trophy' },
  { title: 'Publications', contentType: 'bullets' as CustomSectionType, icon: 'book' },
  { title: 'Projects', contentType: 'bullets' as CustomSectionType, icon: 'folder' },
  { title: 'Professional Memberships', contentType: 'items' as CustomSectionType, icon: 'briefcase' },
  { title: 'References', contentType: 'paragraph' as CustomSectionType, icon: 'users' },
  { title: 'Custom Section', contentType: 'paragraph' as CustomSectionType, icon: 'plus' },
];

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
  customSections: CustomSection[];   // New: fully customizable sections
  sectionVisibility: SectionVisibility;
}

// Section types for editing
export type SectionType = 
  | 'header' 
  | 'summary' 
  | 'skills' 
  | 'experience' 
  | 'education' 
  | 'expertise'
  | 'custom';
