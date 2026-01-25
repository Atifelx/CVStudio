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
 * Parse experience section - DATE-DRIVEN ANCHORING with duplicate prevention
 * 
 * Rules:
 * 1. Dates are primary anchors - when found, look ABOVE and BELOW for company/title
 * 2. Each (company + title + date) is ONE atomic block
 * 3. Check for duplicates before creating new entry
 * 4. Preserve ALL bullets exactly as they appear
 * 5. Stop at section boundaries (Education, Skills, etc.)
 */
function parseExperience(text: string): ExperienceItem[] {
  if (!text.trim()) return [];
  
  const experiences: ExperienceItem[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  // Track seen entries to prevent duplicates: key = "company|title|date"
  const seenKeys = new Set<string>();
  
  // Section boundary patterns - stop parsing when we hit these
  const sectionBoundaryPattern = /^(education|skills|projects?|certifications?|awards|publications?|languages?|references?|summary|profile|objective)$/i;
  
  /**
   * Create unique key for duplicate detection
   */
  const createKey = (company: string, role: string, period: string): string => {
    return `${(company || '').toLowerCase().trim()}|${(role || '').toLowerCase().trim()}|${(period || '').toLowerCase().trim()}`;
  };
  
  /**
   * Parse role and company from a line
   * Supports: "Role | Company", "Role – Company", "Role at Company"
   */
  const parseRoleCompany = (line: string): { role: string; company: string } | null => {
    const cleaned = line.trim();
    if (!cleaned || cleaned.length > 150) return null;

    // Format 1: "Role | Company" or "Role | Company | Extra"
    if (cleaned.includes('|')) {
      const parts = cleaned.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const role = parts[0].trim();
        const company = parts[1].trim();
        if (role.length >= 3 && role.length <= 100 && company.length >= 2 && company.length <= 80) {
          return { role, company };
        }
      }
    }

    // Format 2: "Role – Company" or "Role - Company" or "Role — Company"
    const dashMatch = cleaned.match(/^(.+?)\s*(?:–|—|-)\s*(.+)$/);
    if (dashMatch) {
      const role = dashMatch[1].trim();
      const company = dashMatch[2].trim();
      if (role.length >= 3 && role.length <= 100 && company.length >= 2 && company.length <= 80) {
        return { role, company };
      }
    }

    // Format 3: "Role at Company"
    if (cleaned.toLowerCase().includes(' at ')) {
      const parts = cleaned.split(/\s+at\s+/i).map(p => p.trim());
      if (parts.length >= 2) {
        const role = parts[0];
        const company = parts.slice(1).join(' at ').trim();
        if (role.length >= 3 && role.length <= 100 && company.length >= 2 && company.length <= 80) {
          return { role, company };
        }
      }
    }

    return null;
  };
  
  /**
   * Extract date range from a line - improved to handle all formats including spacing variations
   */
  const extractDate = (line: string): string | null => {
    // Try the main pattern first
    let match = line.match(PATTERNS.dateRange);
    if (match) {
      let dateStr = match[0].trim();
      // Normalize spacing: "Jan 2020– Sep 2021" -> "Jan 2020 – Sep 2021"
      // Handle cases where dash has no space after it
      dateStr = dateStr.replace(/(\d{4}|[a-z]+\s+\d{4})\s*([–—\-])\s*([a-z]+|\d{4})/gi, (m, start, dash, end) => {
        return `${start.trim()} – ${end.trim()}`;
      });
      return dateStr;
    }
    
    // Fallback: try to match dates with no space after dash (e.g., "Jan 2020– Sep 2021")
    const noSpaceMatch = line.match(/(\d{4}|[a-z]+\s+\d{4})\s*([–—\-])\s*([a-z]+\s+\d{4}|present|current|now|ongoing|\d{4})/gi);
    if (noSpaceMatch) {
      let dateStr = noSpaceMatch[0].trim();
      // Normalize spacing
      dateStr = dateStr.replace(/(\d{4}|[a-z]+\s+\d{4})\s*([–—\-])\s*([a-z]+\s+\d{4}|present|current|now|ongoing|\d{4})/gi, (m, start, dash, end) => {
        return `${start.trim()} – ${end.trim()}`;
      });
      return dateStr;
    }
    
    return null;
  };
  
  /**
   * Check if line is a bullet point - improved to catch all formats
   */
  const isBullet = (line: string): boolean => {
    const trimmed = line.trim();
    // Match: •, -, *, ●, or numbered (1. 2) 3) etc)
    return /^[•\-*●]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);
  };
  
  /**
   * Extract bullet text (remove marker)
   */
  const extractBulletText = (line: string): string => {
    return line.replace(/^[•\-*●]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
  };
  
  /**
   * Check if line looks like a role/company header (not a bullet, not a date, reasonable length)
   */
  const isLikelyHeader = (line: string): boolean => {
    if (!line || line.length < 5 || line.length > 150) return false;
    if (isBullet(line)) return false;
    if (extractDate(line)) return false;
    if (sectionBoundaryPattern.test(line)) return false;
    // If it contains separators like | or –, likely a header
    if (line.includes('|') || line.includes('–') || line.includes(' - ')) return true;
    // If it's short and doesn't look like a sentence, might be a header
    if (line.length < 80 && !/[.!?]$/.test(line)) return true;
    return false;
  };
  
  // DATE-DRIVEN PARSING: Find all date lines, then build entries around them
  // Track which lines we've processed to avoid reprocessing bullets
  const processedLines = new Set<number>();
  
  for (let i = 0; i < lines.length; i++) {
    if (processedLines.has(i)) continue;
    
    const line = lines[i].trim();
    if (!line) continue;
    
    // Stop at section boundaries
    if (sectionBoundaryPattern.test(line)) {
      break;
    }
    
    // Look for date ranges - these are our PRIMARY ANCHORS
    const dateRange = extractDate(line);
    if (!dateRange) {
      // No date on this line - check if it's a potential header we should track
      // But don't process it yet - wait for its date anchor
      continue;
    }
    
    // Found a date anchor - build the experience entry around it
    let role = '';
    let company = '';
    const bullets: string[] = [];
    
    // RULE 1: Look ABOVE the date line (previous 1-3 lines) for role/company
    // Check up to 3 lines back to catch headers that might be separated
    for (let lookback = 1; lookback <= 3 && i - lookback >= 0; lookback++) {
      const prevIdx = i - lookback;
      if (processedLines.has(prevIdx)) break;
      
      const prevLine = lines[prevIdx]?.trim() || '';
      if (!prevLine) continue;
      
      // Stop if we hit another date (this date belongs to that entry)
      if (extractDate(prevLine)) break;
      
      // Stop if we hit a section boundary
      if (sectionBoundaryPattern.test(prevLine)) break;
      
      // If this looks like a header, try to parse it
      if (isLikelyHeader(prevLine) || parseRoleCompany(prevLine)) {
        const parsed = parseRoleCompany(prevLine);
        if (parsed) {
          role = parsed.role;
          company = parsed.company;
          // Mark all lines between header and date as processed
          for (let k = prevIdx; k < i; k++) {
            processedLines.add(k);
          }
          break;
        } else if (prevLine.length > 5 && prevLine.length < 100 && !isBullet(prevLine)) {
          // Fallback: use the line as role if it looks reasonable
          role = prevLine;
          processedLines.add(prevIdx);
          break;
        }
      }
    }
    
    // RULE 2: Also check if date line itself contains role/company (e.g., "Role | Company | Date")
    if (!role || !company) {
      const beforeDate = line.substring(0, line.indexOf(dateRange)).trim();
      if (beforeDate) {
        const parsed = parseRoleCompany(beforeDate);
        if (parsed) {
          role = parsed.role || role;
          company = parsed.company || company;
        }
      }
    }
    
    // RULE 3: Check for duplicate BEFORE creating entry
    const key = createKey(company, role, dateRange);
    if (seenKeys.has(key)) {
      // DUPLICATE DETECTED - append bullets to existing entry instead of creating new one
      const existing = experiences.find(e => 
        createKey(e.company, e.role, e.period) === key
      );
      if (existing) {
        // Collect bullets BELOW this date line until next entry/section
        let j = i + 1;
        while (j < lines.length && !processedLines.has(j)) {
          const nextLine = lines[j]?.trim() || '';
          if (!nextLine) {
            j++;
            continue;
          }
          
          // Stop at section boundaries
          if (sectionBoundaryPattern.test(nextLine)) {
            processedLines.add(j);
            break;
          }
          
          // Stop at next date anchor (new entry)
          const nextDate = extractDate(nextLine);
          if (nextDate && !isBullet(nextLine)) {
            // Check if this is a new entry (has role/company on previous line)
            if (j > 0) {
              const beforeNextDate = lines[j - 1]?.trim() || '';
              if (parseRoleCompany(beforeNextDate) || isLikelyHeader(beforeNextDate)) {
                break; // New entry starts here
              }
            }
            // If we already have role/company for current entry, next date is new entry
            if (role && company) break;
          }
          
          // Collect ALL bullets - preserve exactly as they appear
          if (isBullet(nextLine)) {
            const bulletText = extractBulletText(nextLine);
            if (bulletText.length > 0) {
              existing.bullets.push(bulletText);
            }
          } else if (nextLine.length > 5 && !parseRoleCompany(nextLine) && !extractDate(nextLine) && !sectionBoundaryPattern.test(nextLine) && !isLikelyHeader(nextLine)) {
            // Non-bullet text that's not a header/date/section - preserve as bullet
            existing.bullets.push(nextLine);
          }
          
          processedLines.add(j);
          j++;
        }
      }
      processedLines.add(i); // Mark date line as processed
      continue; // Skip creating duplicate entry
    }
    
    // Not a duplicate - create new entry
    seenKeys.add(key);
    processedLines.add(i); // Mark date line as processed
    
    // RULE 4: Collect bullets BELOW the date line until next entry/section
    let j = i + 1;
    while (j < lines.length && !processedLines.has(j)) {
      const nextLine = lines[j]?.trim() || '';
      if (!nextLine) {
        j++;
        continue;
      }
      
      // Stop at section boundaries
      if (sectionBoundaryPattern.test(nextLine)) {
        processedLines.add(j);
        break;
      }
      
      // Stop at next date anchor (new entry)
      const nextDate = extractDate(nextLine);
      if (nextDate && !isBullet(nextLine)) {
        // Check if this date has role/company on previous line (new entry)
        if (j > 0) {
          const beforeNextDate = lines[j - 1]?.trim() || '';
          if (parseRoleCompany(beforeNextDate) || isLikelyHeader(beforeNextDate)) {
            break; // New entry starts here
          }
        }
        // If we have complete entry (role + company), next date is new entry
        if (role && company) {
          break;
        }
      }
      
      // RULE 5: Preserve ALL bullets exactly as they appear
      if (isBullet(nextLine)) {
        const bulletText = extractBulletText(nextLine);
        if (bulletText.length > 0) {
          bullets.push(bulletText);
        }
      } else if (nextLine.length > 5 && !parseRoleCompany(nextLine) && !extractDate(nextLine) && !sectionBoundaryPattern.test(nextLine) && !isLikelyHeader(nextLine)) {
        // Non-bullet text that's not a header/date/section - preserve as bullet
        bullets.push(nextLine);
      }
      
      processedLines.add(j);
      j++;
    }
    
    // RULE 6: Create the experience entry (atomic block: company + title + date + bullets)
    if (role || company) {
      experiences.push({
        id: `exp-${experiences.length + 1}`,
        role: role || 'Unknown Role',
        company: company || 'Unknown Company',
        period: dateRange,
        description: '',
        bullets: bullets, // ALL bullets preserved exactly
      });
    }
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
