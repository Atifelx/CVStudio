import { ResumeData, ExperienceItem, EducationItem, SkillCategory } from '@/types/resume';

/**
 * Resume Parser Utility
 * Robust PDF/DOCX parsing with multiple fallback methods
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
  // Also match standalone dates like "2023 – Dec 2024" or "2020– Sep 2021"
  dateRangeStandalone: /^(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.,]?\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}))\s*[-–—to]+\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.,]?\s*\d{4}|present|current|now|ongoing|\d{4})$/i,
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
 * Parse PDF file using PDF.js
 */
async function parsePdfFile(file: File): Promise<string> {
  console.log('Starting PDF parsing...');
  
  try {
    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker - use CDN for reliability
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded: ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Sort items by position (top to bottom, left to right)
      const items = textContent.items
        .filter((item: any) => {
          return 'str' in item && typeof item.str === 'string' && 'transform' in item && Array.isArray(item.transform);
        })
        .map((item: any) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
        }))
        .sort((a, b) => {
          // Sort by Y (top to bottom) then X (left to right)
          const yDiff = b.y - a.y;
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.x - b.x;
        });
      
      // Build text with proper line breaks
      let lastY: number | null = null;
      let lineText = '';
      
      for (const item of items) {
        if (lastY !== null && Math.abs(item.y - lastY) > 5) {
          // New line
          fullText += lineText.trim() + '\n';
          lineText = '';
        }
        
        // Add space between items on same line
        if (lineText && !lineText.endsWith(' ') && item.text && !item.text.startsWith(' ')) {
          lineText += ' ';
        }
        
        lineText += item.text;
        lastY = item.y;
      }
      
      // Don't forget the last line
      if (lineText.trim()) {
        fullText += lineText.trim() + '\n';
      }
      
      fullText += '\n'; // Page break
    }
    
    // Clean up the text
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    
    console.log('PDF text extracted successfully, length:', fullText.length);
    
    if (fullText.length < 50) {
      throw new Error('Not enough text extracted from PDF');
    }
    
    return fullText;
    
  } catch (error: unknown) {
    console.error('PDF.js parsing failed:', error);
    
    // Try fallback method
    console.log('Trying fallback PDF parsing...');
    try {
      const fallbackText = await parsePdfFallback(file);
      if (fallbackText && fallbackText.length >= 50) {
        return fallbackText;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Could not parse PDF file: ${errorMessage}\n\n` +
      'This can happen with:\n' +
      '• Scanned/image-based PDFs\n' +
      '• Password-protected PDFs\n' +
      '• Complex PDF formatting\n\n' +
      'Try saving your resume as DOCX instead.'
    );
  }
}

/**
 * Fallback PDF parser using binary text extraction
 */
async function parsePdfFallback(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert to string
  let content = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte >= 32 && byte <= 126) {
      content += String.fromCharCode(byte);
    } else if (byte === 10 || byte === 13) {
      content += '\n';
    }
  }
  
  const extractedTexts: string[] = [];
  
  // Method 1: Extract from BT...ET blocks
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    
    // Extract Tj strings
    const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g);
    if (tjMatches) {
      for (const tjMatch of tjMatches) {
        const textMatch = tjMatch.match(/\(([^)]+)\)/);
        if (textMatch) {
          const decoded = decodeEscapes(textMatch[1]);
          if (decoded.length > 0 && /[a-zA-Z]/.test(decoded)) {
            extractedTexts.push(decoded);
          }
        }
      }
    }
    
    // Extract TJ arrays
    const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/gi);
    if (tjArrayMatches) {
      for (const tjMatch of tjArrayMatches) {
        const strings = tjMatch.match(/\(([^)]*)\)/g);
        if (strings) {
          for (const str of strings) {
            const textMatch = str.match(/\(([^)]*)\)/);
            if (textMatch) {
              const decoded = decodeEscapes(textMatch[1]);
              if (decoded.length > 0 && /[a-zA-Z]/.test(decoded)) {
                extractedTexts.push(decoded);
              }
            }
          }
        }
      }
    }
  }
  
  // Method 2: Look for readable text patterns
  const readableRegex = /\(([A-Za-z][A-Za-z0-9\s.,;:'"\-!?@#$%&*()+=/]{2,})\)/g;
  while ((match = readableRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 2 && /[a-zA-Z]{2,}/.test(text)) {
      extractedTexts.push(text);
    }
  }
  
  // Combine and deduplicate
  const seen = new Set<string>();
  const uniqueTexts: string[] = [];
  for (const text of extractedTexts) {
    const cleaned = text.trim();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      uniqueTexts.push(cleaned);
    }
  }
  
  return uniqueTexts.join(' ').replace(/\s+/g, ' ').trim();
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
    generalSections: [],
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
  // Normalize common Markdown formatting (paste-text resumes often include markdown)
  const normalized = text
    // Convert markdown links: [Text](url) -> Text url
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2')
    // Remove bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules like --- or ***
    .replace(/^\s*([-*_])\1{2,}\s*$/gm, '')
    // Remove common emoji/icons used in contact lines (keep the actual text)
    .replace(/[📧📩📨📱☎️📞🔗]/g, ' ');

  return normalized
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[ ]+/g, ' ')
    .split('\n')
    .map((line) => {
      let l = line.trim();
      // Strip markdown heading markers: ### TITLE -> TITLE
      l = l.replace(/^\s{0,3}#{1,6}\s+/g, '');
      // Strip blockquote marker
      l = l.replace(/^>\s+/g, '');
      // Strip list markers (-, *, •) but keep content
      l = l.replace(/^[-*•]\s+/g, '');
      return l.trim();
    })
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
  let achievements: string[] = [];
  let inAchievementsSection = false;
  
  /**
   * Check if line looks like a job title (not a bullet, reasonable length, no date)
   */
  const isJobTitle = (line: string): boolean => {
    if (!line || line.length < 5 || line.length > 150) return false;
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('●')) return false;
    if (PATTERNS.dateRange.test(line)) return false;
    if (/^(tech|key achievements?):/i.test(line)) return false;
    // Job titles often contain: Engineer, Developer, Manager, etc. or have separators like - or |
    if (/\b(engineer|developer|manager|director|lead|senior|junior|architect|specialist|analyst|coordinator|executive|officer|product|engineer)\b/i.test(line)) return true;
    if (line.includes(' - ') || line.includes('–') || line.includes(' | ')) return true;
    // If it's a short line without sentence-ending punctuation, might be a title
    if (line.length < 100 && !/[.!?]$/.test(line) && !line.toLowerCase().startsWith('built') && !line.toLowerCase().startsWith('designed')) return true;
    return false;
  };
  
  /**
   * Parse company and date from line like "Company | Date" or "Company - Date"
   */
  const parseCompanyDate = (line: string): { company: string; date: string } | null => {
    const dateMatch = line.match(PATTERNS.dateRange);
    if (!dateMatch) return null;
    
    const date = dateMatch[0];
    const beforeDate = line.substring(0, line.indexOf(date)).trim();
    const afterDate = line.substring(line.indexOf(date) + date.length).trim();
    
    // Format: "Company | Date" or "Company | Date | extra"
    if (beforeDate.includes('|')) {
      const parts = beforeDate.split('|').map(p => p.trim()).filter(Boolean);
      return { company: parts[0] || '', date };
    }
    
    // Format: "Company - Date" or just "Date"
    if (beforeDate) {
      return { company: beforeDate, date };
    }
    
    // Date only, company might be on previous line
    return { company: '', date };
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('●');
    const dateMatch = line.match(PATTERNS.dateRange);
    
    // Check for "Key Achievements:" section
    if (/^key\s+achievements?:/i.test(line)) {
      inAchievementsSection = true;
      achievements = [];
      continue;
    }
    
    // Check for "Tech:" line - skip it
    if (/^tech:/i.test(line)) {
      continue;
    }
    
    // If we're in achievements section, collect achievements
    if (inAchievementsSection && currentExp) {
      if (isBullet || line.length > 20) {
        const achievementText = isBullet ? line.replace(/^[•\-*●]\s*/, '').trim() : line;
        if (achievementText.length > 5) {
          achievements.push(achievementText);
        }
      } else {
        // End of achievements section (hit a new entry or section)
        inAchievementsSection = false;
        if (achievements.length > 0) {
          currentExp.achievements = [...achievements];
          achievements = [];
        }
      }
    }
    
    // Detect new experience entry: line with date (and possibly company)
    if (dateMatch && !isBullet) {
      // Save previous entry
      if (currentExp && (currentExp.role || currentExp.company)) {
        currentExp.bullets = bullets.filter(b => b.length > 5);
        if (achievements.length > 0) {
          currentExp.achievements = achievements;
        }
        experiences.push({
          id: `exp-${experiences.length + 1}`,
          role: currentExp.role || '',
          company: currentExp.company || '',
          period: currentExp.period || '',
          description: '',
          bullets: currentExp.bullets || [],
          achievements: currentExp.achievements || [],
        });
      }
      
      // Parse company and date from current line
      const companyDate = parseCompanyDate(line);
      const period = companyDate?.date || dateMatch[0];
      let company = companyDate?.company || '';
      let role = '';
      
      // Look back at previous line(s) for job title - CHECK UP TO 3 LINES
      if (i > 0) {
        for (let lookback = 1; lookback <= 3 && i - lookback >= 0; lookback++) {
          const prevLine = lines[i - lookback]?.trim() || '';
          if (!prevLine) continue;
          
          // Skip bullets, dates, and section headers
          const prevIsBullet = prevLine.startsWith('•') || prevLine.startsWith('-') || prevLine.startsWith('*') || prevLine.startsWith('●');
          if (prevIsBullet || prevLine.match(PATTERNS.dateRange)) continue;
          if (/^(tech|key achievements?):/i.test(prevLine)) continue;
          
          // Check if previous line is a job title
          if (isJobTitle(prevLine)) {
            role = prevLine;
            break;
          }
          
          // Also check if it has role/company separators
          if (prevLine.includes('|')) {
            const parts = prevLine.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              role = parts[0];
              if (!company) company = parts[1];
              break;
            }
          } else if (prevLine.includes(' - ') || prevLine.includes('–')) {
            const parts = prevLine.split(/[-–]/).map(p => p.trim());
            if (parts.length >= 2) {
              role = parts[0];
              if (!company) company = parts[1];
              break;
            }
          }
        }
      }
      
      // If still no role, try to extract from date line itself
      if (!role && companyDate) {
        const beforeDate = line.substring(0, line.indexOf(companyDate.date)).trim();
        if (beforeDate && beforeDate.includes('|')) {
          const parts = beforeDate.split('|').map(p => p.trim());
          company = parts[0] || company;
        }
      }
      
      currentExp = { role, company, period };
      bullets = [];
      achievements = [];
      inAchievementsSection = false;
      
    } else if (isBullet && currentExp) {
      // It's a bullet point
      const bulletText = line.replace(/^[•\-*●]\s*/, '').trim();
      if (bulletText.length > 5) {
        if (inAchievementsSection) {
          achievements.push(bulletText);
        } else {
          bullets.push(bulletText);
        }
      }
      
    } else if (currentExp && line.length > 20 && !line.match(PATTERNS.dateRange) && !isJobTitle(line)) {
      // Long line without date - treat as bullet or achievement
      if (inAchievementsSection) {
        achievements.push(line);
      } else {
        bullets.push(line);
      }
    } else if (!currentExp && isJobTitle(line)) {
      // Potential job title without date yet - wait for date line
      // This handles cases where title comes before company/date
    }
  }
  
  // Don't forget the last entry
  if (currentExp && (currentExp.role || currentExp.company)) {
    currentExp.bullets = bullets.filter(b => b.length > 5);
    if (achievements.length > 0) {
      currentExp.achievements = achievements;
    }
    experiences.push({
      id: `exp-${experiences.length + 1}`,
      role: currentExp.role || '',
      company: currentExp.company || '',
      period: currentExp.period || '',
      description: '',
      bullets: currentExp.bullets || [],
      achievements: currentExp.achievements || [],
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
