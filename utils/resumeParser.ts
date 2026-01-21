import { ResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume';

/**
 * Resume Parser Utility
 * Simple and reliable PDF/DOCX parsing
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
 * Main entry point - parses a file and returns structured resume data
 */
export async function parseResumeFile(file: File): Promise<Partial<ResumeData>> {
  const fileName = file.name.toLowerCase();
  
  let text = '';
  
  if (fileName.endsWith('.docx')) {
    text = await parseDocxFile(file);
  } else if (fileName.endsWith('.pdf')) {
    text = await parsePdfFile(file);
  } else if (fileName.endsWith('.txt')) {
    text = await file.text();
  } else {
    throw new Error('Please upload a PDF, DOCX, or TXT file');
  }
  
  if (!text || text.trim().length < 30) {
    throw new Error('Could not extract enough text from the file. Try uploading a DOCX file instead.');
  }
  
  console.log('Extracted text preview:', text.substring(0, 500));
  
  return parseResumeText(text);
}

/**
 * Parse DOCX file using mammoth
 */
async function parseDocxFile(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 20) {
      throw new Error('Empty DOCX file');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parse error:', error);
    throw new Error('Failed to read DOCX file. The file may be corrupted.');
  }
}

/**
 * Parse PDF file - simple text extraction without heavy dependencies
 */
async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to string for pattern matching
    let content = '';
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      // Only include printable ASCII and common characters
      if (byte >= 32 && byte <= 126) {
        content += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) {
        content += '\n';
      }
    }
    
    // Extract text from PDF content streams
    const extractedTexts: string[] = [];
    
    // Method 1: Extract from BT...ET blocks (PDF text objects)
    const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
    let match;
    
    while ((match = btEtRegex.exec(content)) !== null) {
      const block = match[1];
      
      // Extract text from Tj operator (show text)
      const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g);
      if (tjMatches) {
        for (const tjMatch of tjMatches) {
          const textMatch = tjMatch.match(/\(([^)]+)\)/);
          if (textMatch) {
            const decoded = decodeEscapes(textMatch[1]);
            if (decoded.length > 0) {
              extractedTexts.push(decoded);
            }
          }
        }
      }
      
      // Extract text from TJ operator (show text array)
      const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g);
      if (tjArrayMatches) {
        for (const tjMatch of tjArrayMatches) {
          const arrayContent = tjMatch.match(/\[([^\]]+)\]/);
          if (arrayContent) {
            // Extract strings from the array
            const strings = arrayContent[1].match(/\(([^)]*)\)/g);
            if (strings) {
              for (const str of strings) {
                const textMatch = str.match(/\(([^)]*)\)/);
                if (textMatch) {
                  const decoded = decodeEscapes(textMatch[1]);
                  if (decoded.length > 0) {
                    extractedTexts.push(decoded);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Method 2: Look for readable text patterns directly
    // Find strings that look like real text (not PDF commands)
    const readableTextRegex = /\(([A-Za-z][A-Za-z0-9\s.,;:'"\-!?@#$%&*()+=/]+)\)/g;
    while ((match = readableTextRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 2 && /[a-zA-Z]{2,}/.test(text) && !extractedTexts.includes(text)) {
        extractedTexts.push(text);
      }
    }
    
    // Method 3: Extract any sequences of readable characters
    const sequences = content.match(/[A-Za-z][A-Za-z0-9\s.,;:'"@\-!?#$%&*()+=/]{10,}/g);
    if (sequences) {
      for (const seq of sequences) {
        const cleaned = seq.trim();
        // Filter out PDF commands and encoding
        if (
          cleaned.length > 10 &&
          !cleaned.match(/^(stream|endstream|obj|endobj|xref|trailer)/i) &&
          !cleaned.match(/^[0-9\s]+$/) &&
          /[a-zA-Z]{3,}/.test(cleaned)
        ) {
          extractedTexts.push(cleaned);
        }
      }
    }
    
    // Combine and clean up extracted text
    let result = extractedTexts.join(' ');
    
    // Clean up the text
    result = result
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (result.length < 50) {
      throw new Error('Could not extract readable text from PDF');
    }
    
    return result;
    
  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error(
      'Could not parse PDF file. This can happen with:\n' +
      '• Scanned/image-based PDFs\n' +
      '• Password-protected PDFs\n' +
      '• Complex PDF formatting\n\n' +
      'Try saving your resume as DOCX instead.'
    );
  }
}

/**
 * Decode PDF escape sequences
 */
function decodeEscapes(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : ' ';
    });
}

/**
 * Main parsing function - takes raw text and returns structured resume data
 */
export function parseResumeText(text: string): Partial<ResumeData> {
  if (!text || text.trim().length < 20) {
    throw new Error('Not enough text to parse');
  }

  const cleanedText = cleanText(text);
  const lines = cleanedText.split('\n').filter(l => l.trim());
  
  // Extract contact info from entire text first
  const contactInfo = extractContactInfo(cleanedText);
  
  // Find section boundaries
  const sections = findSections(lines);
  
  // Extract header (everything before first section)
  const headerInfo = extractHeader(lines, sections, contactInfo);
  
  // Extract each section content
  const summaryText = extractSectionContent(lines, sections, 'summary');
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
    summary: summaryText || '',
    skills: skills,
    experience: experience,
    education: education,
    forwardDeployedExpertise: '',
    sectionVisibility: {
      expertise: false,
      summary: !!summaryText,
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
    .replace(/[ ]+/g, ' ')
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
  
  // Try to find location (City, State format)
  const locationMatch = text.match(/(?:^|\n|[|•,])\s*([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)(?:\s*[|•,\n]|$)/);
  
  return {
    email: emails[0] || '',
    phone: phones[0] || '',
    linkedin: linkedins[0] ? `https://${linkedins[0]}` : '',
    github: githubs[0] ? `https://${githubs[0]}` : '',
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
    const isShortLine = line.length < 50;
    const isUpperCase = line === line.toUpperCase() && line.length > 3;
    
    for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (isShortLine && (pattern.test(line) || (isUpperCase && pattern.test(line.toLowerCase())))) {
        // Check if we already found this section type
        if (!sectionOrder.find(s => s.type === type)) {
          sectionOrder.push({ type, start: i });
        }
        break;
      }
    }
  }
  
  // Set end boundaries
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
  // Find where first section starts
  let firstSectionStart = lines.length;
  sections.forEach((bounds) => {
    if (bounds.start < firstSectionStart) {
      firstSectionStart = bounds.start;
    }
  });
  
  // Get header lines (before any section)
  const headerLines = lines.slice(0, Math.min(firstSectionStart, 8));
  
  let name = '';
  let title = '';
  
  for (const line of headerLines) {
    const trimmed = line.trim();
    
    // Skip contact info lines
    if (PATTERNS.email.test(trimmed) || PATTERNS.phone.test(trimmed) || 
        PATTERNS.linkedin.test(trimmed) || PATTERNS.github.test(trimmed)) {
      continue;
    }
    
    // Skip very short or symbol-only lines
    if (trimmed.length < 3 || /^[•\-|,\s]+$/.test(trimmed)) {
      continue;
    }
    
    // First non-contact line is likely the name
    if (!name) {
      const words = trimmed.split(/\s+/);
      // Name is typically 1-4 words, letters only
      if (words.length >= 1 && words.length <= 5 && /^[A-Za-z\s.\-']+$/.test(trimmed)) {
        name = trimmed;
        continue;
      }
    }
    
    // Second suitable line is likely the title
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
  
  // Skip the section header line itself
  const contentLines = lines.slice(bounds.start + 1, bounds.end + 1);
  return contentLines.join('\n');
}

/**
 * Parse experience section into structured data
 */
function parseExperience(text: string): ExperienceItem[] {
  if (!text.trim()) return [];
  
  const experiences: ExperienceItem[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentExp: Partial<ExperienceItem> | null = null;
  let bullets: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if this line contains a date range
    const dateMatch = line.match(PATTERNS.dateRange);
    
    // Detect new experience entry
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('●');
    const isNewEntry = dateMatch && !isBullet;
    
    if (isNewEntry) {
      // Save previous entry
      if (currentExp && (currentExp.role || currentExp.company)) {
        currentExp.bullets = bullets.filter(b => b.length > 5);
        experiences.push({
          id: `exp-${experiences.length + 1}`,
          role: currentExp.role || '',
          company: currentExp.company || '',
          period: currentExp.period || '',
          description: '',
          bullets: currentExp.bullets || [],
        });
      }
      
      // Parse the new entry
      const period = dateMatch[0];
      const beforeDate = line.substring(0, line.indexOf(dateMatch[0])).trim();
      
      // Try to split role and company
      let role = '';
      let company = '';
      
      if (beforeDate.includes('|')) {
        const parts = beforeDate.split('|').map(p => p.trim());
        role = parts[0] || '';
        company = parts[1] || '';
      } else if (beforeDate.includes(' at ')) {
        const parts = beforeDate.split(' at ').map(p => p.trim());
        role = parts[0] || '';
        company = parts[1] || '';
      } else if (beforeDate.includes(' - ')) {
        const parts = beforeDate.split(' - ').map(p => p.trim());
        role = parts[0] || '';
        company = parts[1] || '';
      } else {
        role = beforeDate;
      }
      
      currentExp = { role, company, period };
      bullets = [];
      
    } else if (isBullet) {
      // It's a bullet point
      const bulletText = line.replace(/^[•\-*●]\s*/, '').trim();
      if (bulletText.length > 5) {
        bullets.push(bulletText);
      }
      
    } else if (currentExp && !currentExp.company && line.length < 80) {
      // Might be the company name on a separate line
      currentExp.company = line;
      
    } else if (line.length > 20 && !line.match(PATTERNS.dateRange)) {
      // Long line without date - treat as bullet
      bullets.push(line);
    }
  }
  
  // Don't forget the last entry
  if (currentExp && (currentExp.role || currentExp.company)) {
    currentExp.bullets = bullets.filter(b => b.length > 5);
    experiences.push({
      id: `exp-${experiences.length + 1}`,
      role: currentExp.role || '',
      company: currentExp.company || '',
      period: currentExp.period || '',
      description: '',
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
    const hasDegree = PATTERNS.degree.test(trimmed);
    
    // New education entry if it has a degree keyword or is a short line
    if (hasDegree || (trimmed.length < 100 && !currentEdu)) {
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
  
  // Add the last entry
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
    
    // Check for "Category: skills" format
    const categoryMatch = trimmed.match(/^([^:]+):\s*(.+)$/);
    
    if (categoryMatch && categoryMatch[2].length > 3) {
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: categoryMatch[1].trim(),
        skills: categoryMatch[2].trim(),
      });
    } else if (trimmed.length > 5 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
      // Skills list without category
      skills.push({
        id: `skill-${skills.length + 1}`,
        category: 'Skills',
        skills: trimmed.replace(/^[•\-*]\s*/, ''),
      });
    }
  }
  
  // Consolidate skills by category
  const consolidated = new Map<string, string[]>();
  for (const skill of skills) {
    const existing = consolidated.get(skill.category) || [];
    existing.push(skill.skills);
    consolidated.set(skill.category, existing);
  }
  
  return Array.from(consolidated.entries()).map(([category, skillList], i) => ({
    id: `skill-${i + 1}`,
    category,
    skills: skillList.join(', '),
  }));
}
