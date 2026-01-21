import { ResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume';

/**
 * Resume Parser Utility
 * 
 * Parses text from PDF/DOCX files and intelligently maps to resume structure
 */

// Section patterns for identifying resume sections
const SECTION_PATTERNS = {
  summary: /(?:professional\s*)?summary|profile|objective|about\s*me/i,
  experience: /(?:work\s*)?experience|employment|work\s*history|professional\s*experience/i,
  education: /education|academic|qualifications|degrees/i,
  skills: /(?:technical\s*)?skills|technologies|competencies|expertise|proficiencies/i,
  contact: /contact|email|phone|address/i,
};

// Patterns for extracting specific data
const PATTERNS = {
  email: /[\w.-]+@[\w.-]+\.\w+/i,
  phone: /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
  linkedin: /linkedin\.com\/in\/[\w-]+/i,
  github: /github\.com\/[\w-]+/i,
  date: /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}\s*[-–]\s*(?:present|\d{4}|current))/gi,
  dateRange: /(\w+\s*\d{4})\s*[-–]\s*(present|current|\w+\s*\d{4})/i,
  bullets: /^[\s]*[•\-\*▪◦⦁]\s*/gm,
  degree: /(?:bachelor|master|ph\.?d|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?e\.?|mba|associate)/i,
};

interface ParsedSection {
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Main parsing function - takes raw text and returns structured resume data
 */
export function parseResumeText(text: string): Partial<ResumeData> {
  const cleanedText = cleanText(text);
  const sections = identifySections(cleanedText);
  
  // Extract header information (usually at the top)
  const header = extractHeader(cleanedText, sections);
  
  // Extract each section
  const summary = extractSummary(sections);
  const experience = extractExperience(sections);
  const education = extractEducation(sections);
  const skills = extractSkills(sections);
  
  return {
    header: {
      name: header.name || '',
      title: header.title || '',
      contact: {
        email: header.email || '',
        phone: header.phone || '',
        linkedin: header.linkedin || '',
        github: header.github || '',
        location: header.location || '',
        workAuthorization: '',
        relocation: '',
        travel: '',
      },
    },
    summary: summary || '',
    skills: skills.length > 0 ? skills : [],
    experience: experience.length > 0 ? experience : [],
    education: education.length > 0 ? education : [],
    forwardDeployedExpertise: '',
    sectionVisibility: {
      expertise: false, // Hide by default for uploaded resumes
      summary: summary ? true : false,
      skills: skills.length > 0,
      education: education.length > 0,
    },
  };
}

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Identify sections in the resume text
 */
function identifySections(text: string): ParsedSection[] {
  const lines = text.split('\n');
  const sections: ParsedSection[] = [];
  
  let currentSection: ParsedSection | null = null;
  let contentLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();
    
    // Check if this line is a section header
    let isHeader = false;
    let sectionType = '';
    
    for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line) && line.length < 50) {
        isHeader = true;
        sectionType = type;
        break;
      }
    }
    
    // Also check for all-caps headers
    if (!isHeader && upperLine === line && line.length > 3 && line.length < 40 && /^[A-Z\s&]+$/.test(line)) {
      isHeader = true;
      for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(line)) {
          sectionType = type;
          break;
        }
      }
    }
    
    if (isHeader) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        currentSection.endIndex = i - 1;
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: sectionType || line.toLowerCase(),
        content: '',
        startIndex: i,
        endIndex: i,
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    } else {
      // Content before first section (usually header info)
      if (!sections.find(s => s.title === 'header')) {
        sections.push({
          title: 'header',
          content: line,
          startIndex: 0,
          endIndex: i,
        });
      } else {
        const headerSection = sections.find(s => s.title === 'header');
        if (headerSection) {
          headerSection.content += '\n' + line;
          headerSection.endIndex = i;
        }
      }
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    currentSection.endIndex = lines.length - 1;
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * Extract header information (name, title, contact)
 */
function extractHeader(text: string, sections: ParsedSection[]): {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
} {
  // Get the first part of the resume (before any sections)
  const headerSection = sections.find(s => s.title === 'header');
  const headerText = headerSection?.content || text.substring(0, 500);
  
  const lines = headerText.split('\n').filter(l => l.trim());
  
  // First non-empty line is usually the name
  let name = '';
  let title = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!name && trimmed.length > 2 && trimmed.length < 50 && !PATTERNS.email.test(trimmed) && !PATTERNS.phone.test(trimmed)) {
      // Likely the name - check if it looks like a name (mostly letters)
      if (/^[A-Za-z\s.-]+$/.test(trimmed) && trimmed.split(' ').length <= 4) {
        name = trimmed;
        continue;
      }
    }
    if (name && !title && trimmed.length > 5 && trimmed.length < 100 && !PATTERNS.email.test(trimmed)) {
      // Likely the title
      if (!PATTERNS.phone.test(trimmed) && !trimmed.includes('@')) {
        title = trimmed;
        break;
      }
    }
  }
  
  // Extract contact info
  const email = (headerText.match(PATTERNS.email) || [''])[0];
  const phone = (headerText.match(PATTERNS.phone) || [''])[0];
  const linkedin = (headerText.match(PATTERNS.linkedin) || [''])[0];
  const github = (headerText.match(PATTERNS.github) || [''])[0];
  
  // Extract location (look for city, state/country patterns)
  const locationMatch = headerText.match(/(?:location|address)?:?\s*([A-Za-z\s]+,\s*[A-Za-z\s]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : '';
  
  return { name, title, email, phone, linkedin, github, location };
}

/**
 * Extract professional summary
 */
function extractSummary(sections: ParsedSection[]): string {
  const summarySection = sections.find(s => 
    SECTION_PATTERNS.summary.test(s.title) || s.title === 'summary'
  );
  
  if (summarySection) {
    return summarySection.content.replace(PATTERNS.bullets, '').trim();
  }
  
  return '';
}

/**
 * Extract work experience
 */
function extractExperience(sections: ParsedSection[]): ExperienceItem[] {
  const expSection = sections.find(s => 
    SECTION_PATTERNS.experience.test(s.title) || s.title === 'experience'
  );
  
  if (!expSection) return [];
  
  const experiences: ExperienceItem[] = [];
  const content = expSection.content;
  
  // Split by date patterns or job title patterns
  const lines = content.split('\n');
  let currentExp: Partial<ExperienceItem> | null = null;
  let bullets: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check for date range (indicates new job)
    const dateMatch = line.match(PATTERNS.dateRange);
    const hasDate = PATTERNS.date.test(line);
    
    // Check if this looks like a job title/company line
    const looksLikeJobHeader = (
      (line.length < 100 && (hasDate || dateMatch)) ||
      (i < lines.length - 1 && PATTERNS.dateRange.test(lines[i + 1] || ''))
    );
    
    if (looksLikeJobHeader || (currentExp === null && line.length < 80)) {
      // Save previous experience
      if (currentExp && currentExp.role) {
        currentExp.bullets = bullets.filter(b => b.length > 10);
        experiences.push({
          id: `exp-${experiences.length + 1}`,
          role: currentExp.role || '',
          company: currentExp.company || '',
          period: currentExp.period || '',
          description: currentExp.description || '',
          bullets: currentExp.bullets || [],
        });
      }
      
      // Start new experience
      let role = '';
      let company = '';
      let period = '';
      
      // Extract date
      if (dateMatch) {
        period = dateMatch[0];
        const withoutDate = line.replace(dateMatch[0], '').trim();
        // Try to split role and company
        const parts = withoutDate.split(/\s*[|–-]\s*|\s+at\s+/i);
        if (parts.length >= 2) {
          role = parts[0].trim();
          company = parts[1].trim();
        } else {
          role = withoutDate;
        }
      } else {
        // No date in this line, might be in next line
        const parts = line.split(/\s*[|–-]\s*|\s+at\s+/i);
        if (parts.length >= 2) {
          role = parts[0].trim();
          company = parts[1].trim();
        } else {
          role = line;
        }
      }
      
      currentExp = { role, company, period, description: '' };
      bullets = [];
    } else if (currentExp) {
      // This is content for current experience
      const cleanLine = line.replace(PATTERNS.bullets, '').trim();
      
      if (cleanLine.length > 10) {
        // Check if it's a bullet point
        if (/^[•\-\*▪◦⦁]/.test(line) || cleanLine.length < 200) {
          bullets.push(cleanLine);
        } else {
          // Might be a description
          if (!currentExp.description) {
            currentExp.description = cleanLine;
          } else {
            bullets.push(cleanLine);
          }
        }
      }
      
      // Check for company/date on separate lines
      if (!currentExp.company && cleanLine.length < 60 && !PATTERNS.bullets.test(line)) {
        currentExp.company = cleanLine;
      }
      if (!currentExp.period && PATTERNS.dateRange.test(cleanLine)) {
        const match = cleanLine.match(PATTERNS.dateRange);
        if (match) currentExp.period = match[0];
      }
    }
  }
  
  // Save last experience
  if (currentExp && currentExp.role) {
    currentExp.bullets = bullets.filter(b => b.length > 10);
    experiences.push({
      id: `exp-${experiences.length + 1}`,
      role: currentExp.role || '',
      company: currentExp.company || '',
      period: currentExp.period || '',
      description: currentExp.description || '',
      bullets: currentExp.bullets || [],
    });
  }
  
  return experiences;
}

/**
 * Extract education
 */
function extractEducation(sections: ParsedSection[]): EducationItem[] {
  const eduSection = sections.find(s => 
    SECTION_PATTERNS.education.test(s.title) || s.title === 'education'
  );
  
  if (!eduSection) return [];
  
  const education: EducationItem[] = [];
  const lines = eduSection.content.split('\n').filter(l => l.trim());
  
  let currentEdu: Partial<EducationItem> | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this looks like a degree
    if (PATTERNS.degree.test(trimmed) || trimmed.length < 80) {
      if (currentEdu && currentEdu.degree) {
        education.push({
          id: `edu-${education.length + 1}`,
          degree: currentEdu.degree || '',
          institution: currentEdu.institution || '',
          location: currentEdu.location || '',
        });
      }
      
      currentEdu = { degree: trimmed };
    } else if (currentEdu) {
      if (!currentEdu.institution && trimmed.length < 100) {
        currentEdu.institution = trimmed;
      } else if (!currentEdu.location) {
        currentEdu.location = trimmed;
      }
    }
  }
  
  // Save last education
  if (currentEdu && currentEdu.degree) {
    education.push({
      id: `edu-${education.length + 1}`,
      degree: currentEdu.degree || '',
      institution: currentEdu.institution || '',
      location: currentEdu.location || '',
    });
  }
  
  return education;
}

/**
 * Extract skills
 */
function extractSkills(sections: ParsedSection[]): SkillCategory[] {
  const skillSection = sections.find(s => 
    SECTION_PATTERNS.skills.test(s.title) || s.title === 'skills'
  );
  
  if (!skillSection) return [];
  
  const skills: SkillCategory[] = [];
  const lines = skillSection.content.split('\n').filter(l => l.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for category: skills pattern
    const categoryMatch = line.match(/^([^:]+):\s*(.+)$/);
    
    if (categoryMatch) {
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: categoryMatch[1].trim(),
        skills: categoryMatch[2].trim(),
      });
    } else if (line.length > 5) {
      // Generic skill line
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: 'Skills',
        skills: line.replace(PATTERNS.bullets, '').trim(),
      });
    }
  }
  
  // Consolidate if there are many "Skills" categories
  const genericSkills = skills.filter(s => s.category === 'Skills');
  if (genericSkills.length > 1) {
    const consolidated = {
      id: 'skill-consolidated',
      category: 'Technical Skills',
      skills: genericSkills.map(s => s.skills).join(' | '),
    };
    return [consolidated, ...skills.filter(s => s.category !== 'Skills')];
  }
  
  return skills;
}

/**
 * Parse DOCX file content
 */
export async function parseDocxFile(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please try a different file.');
  }
}

/**
 * Parse PDF file content (client-side using FileReader)
 * Simple text extraction without external PDF libraries
 */
export async function parsePdfFile(file: File): Promise<string> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and try to extract text
    let text = '';
    
    // Try to decode as text (works for some PDFs)
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(uint8Array);
    
    // Extract text between stream markers (basic PDF text extraction)
    const streamMatches = rawText.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
    
    if (streamMatches) {
      for (const match of streamMatches) {
        // Try to extract readable text
        const content = match.replace(/stream[\r\n]+/, '').replace(/[\r\n]+endstream/, '');
        
        // Look for text between parentheses (PDF text objects)
        const textMatches = content.match(/\(([^)]+)\)/g);
        if (textMatches) {
          for (const tm of textMatches) {
            const cleanText = tm.slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
            
            if (cleanText.length > 1 && /[a-zA-Z]/.test(cleanText)) {
              text += cleanText + ' ';
            }
          }
        }
        
        // Also look for Tj and TJ operators
        const tjMatches = content.match(/\[([^\]]+)\]\s*TJ|\(([^)]+)\)\s*Tj/g);
        if (tjMatches) {
          for (const tj of tjMatches) {
            const cleanText = tj.replace(/\[|\]|TJ|Tj|\(|\)/g, ' ').trim();
            if (cleanText.length > 1 && /[a-zA-Z]/.test(cleanText)) {
              text += cleanText + ' ';
            }
          }
        }
      }
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .trim();
    
    // If we got some meaningful text, return it
    if (text.length > 100 && /[a-zA-Z]{3,}/.test(text)) {
      return text;
    }
    
    // Fallback: Try a simpler extraction for ASCII-based PDFs
    const simpleText = rawText
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Look for recognizable resume keywords
    if (simpleText.includes('experience') || simpleText.includes('education') || 
        simpleText.includes('skills') || simpleText.includes('summary') ||
        simpleText.includes('@') || simpleText.match(/\d{3}[-.\s]\d{3}/)) {
      return simpleText;
    }
    
    throw new Error('Could not extract text from PDF. Please try uploading a DOCX file instead, or copy-paste your resume content.');
    
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. DOCX files work better - please try converting your resume to DOCX format.');
  }
}
