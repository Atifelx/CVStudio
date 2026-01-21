import { ResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume';

/**
 * Resume Parser Utility
 * 
 * Strong PDF/DOCX parsing with intelligent text mapping
 */

// Section patterns for identifying resume sections
const SECTION_PATTERNS = {
  summary: /^(professional\s*)?summary|^profile|^objective|^about(\s*me)?|^career\s*summary/i,
  experience: /^(work\s*)?experience|^employment|^work\s*history|^professional\s*experience|^career\s*history/i,
  education: /^education|^academic|^qualifications|^degrees|^certifications?/i,
  skills: /^(technical\s*)?skills|^technologies|^competenc(y|ies)|^expertise|^proficienc(y|ies)|^core\s*skills/i,
};

// Patterns for extracting specific data
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi,
  github: /github\.com\/[a-zA-Z0-9_-]+/gi,
  dateRange: /(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.,]?\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}))\s*[-–—to]+\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.,]?\s*\d{4}|present|current|now|ongoing|\d{4})/gi,
  degree: /\b(?:bachelor|master|ph\.?d|b\.?s\.?c?|m\.?s\.?c?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?e\.?|mba|m\.?tech|b\.?tech|associate|diploma|certificate)\b/i,
};

/**
 * Main parsing function - takes raw text and returns structured resume data
 */
export function parseResumeText(text: string): Partial<ResumeData> {
  if (!text || text.trim().length < 20) {
    throw new Error('Not enough text extracted from the file');
  }

  const cleanedText = cleanText(text);
  const lines = cleanedText.split('\n').filter(l => l.trim());
  
  // Extract contact info from entire text first
  const contactInfo = extractContactInfo(cleanedText);
  
  // Find section boundaries
  const sections = findSections(lines);
  
  // Extract header (everything before first section, or first few lines)
  const headerInfo = extractHeader(lines, sections, contactInfo);
  
  // Extract each section content
  const summary = extractSectionContent(lines, sections, 'summary');
  const experienceText = extractSectionContent(lines, sections, 'experience');
  const educationText = extractSectionContent(lines, sections, 'education');
  const skillsText = extractSectionContent(lines, sections, 'skills');
  
  // Parse structured data
  const experience = parseExperience(experienceText);
  const education = parseEducation(educationText);
  const skills = parseSkills(skillsText);

  return {
    header: {
      name: headerInfo.name || '',
      title: headerInfo.title || '',
      contact: {
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        linkedin: contactInfo.linkedin || '',
        github: contactInfo.github || '',
        location: contactInfo.location || '',
        workAuthorization: '',
        relocation: '',
        travel: '',
      },
    },
    summary: summary || '',
    skills: skills,
    experience: experience,
    education: education,
    forwardDeployedExpertise: '',
    sectionVisibility: {
      expertise: false,
      summary: !!summary,
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
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Extract contact info from text
 */
function extractContactInfo(text: string): {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
} {
  const emails = text.match(PATTERNS.email) || [];
  const phones = text.match(PATTERNS.phone) || [];
  const linkedins = text.match(PATTERNS.linkedin) || [];
  const githubs = text.match(PATTERNS.github) || [];
  
  const locationMatch = text.match(/(?:^|\n|[|•,])\s*([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)(?:\s*[|•,\n]|$)/);
  
  return {
    email: emails[0] || '',
    phone: phones[0] || '',
    linkedin: linkedins[0] || '',
    github: githubs[0] || '',
    location: locationMatch ? locationMatch[1].trim() : '',
  };
}

/**
 * Find section boundaries in the text
 */
function findSections(lines: string[]): Map<string, { start: number; end: number }> {
  const sections = new Map<string, { start: number; end: number }>();
  const sectionOrder: { type: string; start: number }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (line.length < 50 && (pattern.test(line) || (line === line.toUpperCase() && pattern.test(line.toLowerCase())))) {
        sectionOrder.push({ type, start: i });
        break;
      }
    }
  }
  
  for (let i = 0; i < sectionOrder.length; i++) {
    const current = sectionOrder[i];
    const next = sectionOrder[i + 1];
    sections.set(current.type, {
      start: current.start,
      end: next ? next.start - 1 : lines.length - 1
    });
  }
  
  return sections;
}

/**
 * Extract header information
 */
function extractHeader(
  lines: string[], 
  sections: Map<string, { start: number; end: number }>,
  contactInfo: { email: string; phone: string }
): { name: string; title: string } {
  let firstSectionStart = lines.length;
  sections.forEach((bounds) => {
    if (bounds.start < firstSectionStart) {
      firstSectionStart = bounds.start;
    }
  });
  
  const headerLines = lines.slice(0, Math.min(firstSectionStart, 10));
  
  let name = '';
  let title = '';
  
  for (const line of headerLines) {
    const trimmed = line.trim();
    
    if (PATTERNS.email.test(trimmed) || PATTERNS.phone.test(trimmed) || 
        PATTERNS.linkedin.test(trimmed) || PATTERNS.github.test(trimmed)) {
      continue;
    }
    
    if (trimmed.length < 3 || /^[•\-|,\s]+$/.test(trimmed)) {
      continue;
    }
    
    if (!name) {
      const words = trimmed.split(/\s+/);
      if (words.length >= 1 && words.length <= 5 && /^[A-Za-z\s.\-']+$/.test(trimmed)) {
        name = trimmed;
        continue;
      }
    }
    
    if (name && !title && trimmed.length > 5 && trimmed.length < 150) {
      if (!trimmed.includes('@') && !PATTERNS.phone.test(trimmed)) {
        title = trimmed;
        break;
      }
    }
  }
  
  return { name, title };
}

/**
 * Extract content for a section
 */
function extractSectionContent(
  lines: string[], 
  sections: Map<string, { start: number; end: number }>,
  sectionType: string
): string {
  const bounds = sections.get(sectionType);
  if (!bounds) return '';
  
  const contentLines = lines.slice(bounds.start + 1, bounds.end + 1);
  return contentLines.join('\n');
}

/**
 * Parse experience section into structured data
 */
function parseExperience(text: string): ExperienceItem[] {
  if (!text.trim()) return [];
  
  const experiences: ExperienceItem[] = [];
  const lines = text.split('\n');
  
  let currentExp: Partial<ExperienceItem> | null = null;
  let bullets: string[] = [];
  let lineBuffer: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const dateMatch = line.match(PATTERNS.dateRange);
    
    const isNewEntry = dateMatch || (
      line.length < 100 && 
      !line.startsWith('•') && 
      !line.startsWith('-') && 
      !line.startsWith('*') &&
      (i === 0 || lines[i-1]?.trim() === '')
    );
    
    if (isNewEntry && (dateMatch || lineBuffer.length >= 2)) {
      if (currentExp && (currentExp.role || currentExp.company)) {
        currentExp.bullets = bullets.filter(b => b.length > 5);
        experiences.push({
          id: `exp-${experiences.length + 1}`,
          role: currentExp.role || '',
          company: currentExp.company || '',
          period: currentExp.period || '',
          description: currentExp.description || '',
          bullets: currentExp.bullets || [],
        });
      }
      
      let role = '';
      let company = '';
      let period = dateMatch ? dateMatch[0] : '';
      
      const processLines = [...lineBuffer, line];
      lineBuffer = [];
      
      for (const pLine of processLines) {
        const cleanLine = pLine.replace(PATTERNS.dateRange, '').trim();
        if (!cleanLine) continue;
        
        if (!role && cleanLine.length < 80) {
          role = cleanLine;
        } else if (!company && cleanLine.length < 80) {
          company = cleanLine;
        }
      }
      
      if (dateMatch) {
        period = dateMatch[0];
      }
      
      currentExp = { role, company, period, description: '' };
      bullets = [];
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const bulletText = line.replace(/^[•\-*]\s*/, '').trim();
      if (bulletText.length > 5) {
        bullets.push(bulletText);
      }
    } else if (currentExp) {
      if (!currentExp.company && line.length < 80) {
        currentExp.company = line;
      } else if (line.length > 20) {
        bullets.push(line);
      }
    } else {
      lineBuffer.push(line);
    }
  }
  
  if (currentExp && (currentExp.role || currentExp.company)) {
    currentExp.bullets = bullets.filter(b => b.length > 5);
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
 * Parse education section
 */
function parseEducation(text: string): EducationItem[] {
  if (!text.trim()) return [];
  
  const education: EducationItem[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentEdu: Partial<EducationItem> | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (PATTERNS.degree.test(trimmed) || (trimmed.length < 100 && !currentEdu)) {
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
      } else if (!currentEdu.location && trimmed.length < 60) {
        currentEdu.location = trimmed;
      }
    }
  }
  
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
 * Parse skills section
 */
function parseSkills(text: string): SkillCategory[] {
  if (!text.trim()) return [];
  
  const skills: SkillCategory[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    const categoryMatch = trimmed.match(/^([^:]+):\s*(.+)$/);
    
    if (categoryMatch && categoryMatch[2].length > 3) {
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: categoryMatch[1].trim(),
        skills: categoryMatch[2].trim(),
      });
    } else if (trimmed.length > 5 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: 'Technical Skills',
        skills: trimmed.replace(/^[•\-*]\s*/, ''),
      });
    }
  }
  
  const consolidated = new Map<string, string[]>();
  for (const skill of skills) {
    const existing = consolidated.get(skill.category) || [];
    existing.push(skill.skills);
    consolidated.set(skill.category, existing);
  }
  
  return Array.from(consolidated.entries()).map(([category, skillList], i) => ({
    id: `skill-${i + 1}`,
    category,
    skills: skillList.join(' | '),
  }));
}

/**
 * Parse DOCX file content using mammoth
 */
export async function parseDocxFile(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 20) {
      throw new Error('Could not extract text from DOCX file');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please try a different file.');
  }
}

/**
 * Parse PDF file using pdf.js with legacy build (no worker required)
 */
export async function parsePdfFile(file: File): Promise<string> {
  try {
    // Use dynamic import with legacy build
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    
    // Set up fake worker for legacy build
    pdfjs.GlobalWorkerOptions.workerSrc = '';
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with disableWorker option
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Build text with proper spacing
      let lastY: number | null = null;
      let pageText = '';
      
      for (const item of textContent.items) {
        if ('str' in item && typeof item.str === 'string') {
          const str = item.str;
          // @ts-ignore - transform exists on TextItem
          const y = item.transform ? item.transform[5] : 0;
          
          // New line if Y position changed significantly
          if (lastY !== null && Math.abs(y - lastY) > 8) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n') && str.length > 0) {
            pageText += ' ';
          }
          
          pageText += str;
          lastY = y;
        }
      }
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up the text
    fullText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (!fullText || fullText.length < 50) {
      throw new Error('No text extracted');
    }
    
    console.log('PDF text extracted:', fullText.substring(0, 500) + '...');
    
    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Try alternative extraction method
    try {
      return await extractPdfTextFallback(file);
    } catch (fallbackError) {
      console.error('Fallback PDF parsing also failed:', fallbackError);
      throw new Error(
        'Failed to parse PDF. Please try:\n' +
        '• Converting to DOCX format (recommended)\n' +
        '• Using a different PDF file\n' +
        '• Making sure the PDF contains selectable text'
      );
    }
  }
}

/**
 * Fallback PDF text extraction using basic binary parsing
 */
async function extractPdfTextFallback(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert to string
  let content = '';
  for (let i = 0; i < bytes.length; i++) {
    content += String.fromCharCode(bytes[i]);
  }
  
  // Extract text from PDF streams
  const texts: string[] = [];
  
  // Look for text in BT...ET blocks (text objects)
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj|<([^>]*)>\s*Tj|\[([^\]]*)\]\s*TJ/g;
    let tjMatch;
    
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const text = tjMatch[1] || tjMatch[2] || tjMatch[3] || '';
      if (text) {
        // Decode the text
        const decoded = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
        
        if (decoded.length > 0 && /[a-zA-Z]/.test(decoded)) {
          texts.push(decoded);
        }
      }
    }
  }
  
  // Also try to find plain text patterns
  const plainTextRegex = /\(([A-Za-z][A-Za-z0-9\s.,;:'"!?@#$%&*()-]+)\)/g;
  while ((match = plainTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 3 && /[a-zA-Z]{2,}/.test(text)) {
      texts.push(text);
    }
  }
  
  const result = texts.join(' ').trim();
  
  if (result.length < 50) {
    throw new Error('Could not extract sufficient text');
  }
  
  return result;
}
