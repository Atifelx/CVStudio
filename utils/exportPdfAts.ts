import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from 'pdf-lib';
import { ResumeData } from '@/types/resume';
import { LayoutSettings, PAGE_DIMENSIONS, MARGIN_VALUES } from '@/types/layout';

/**
 * ATS-Friendly PDF Export using pdf-lib
 *
 * Produces a **text-based PDF** (native text, no images). ATS systems can parse
 * and extract keywords from this format. Use this for job applications.
 *
 * Uses pdf-lib instead of jsPDF to avoid text corruption issues.
 */

const DEFAULT_MARGIN_MM = 12;

// Convert mm to points (1 mm = 2.83465 points)
const mmToPoints = (mm: number) => mm * 2.83465;

/**
 * Sanitize text to remove problematic characters
 */
function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    // Normalize unicode characters
    .normalize('NFKC')
    // Replace smart quotes with straight quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace en-dash and em-dash with hyphen
    .replace(/[\u2013\u2014]/g, '-')
    // Replace bullet points with standard bullet
    .replace(/[\u2022\u2023\u2043\u204C\u204D]/g, '*')
    // Replace ellipsis
    .replace(/\u2026/g, '...')
    // Remove zero-width characters
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    // Replace non-breaking space
    .replace(/\u00A0/g, ' ')
    // Remove other problematic unicode but keep basic ASCII and accented chars
    .replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Wrap text to fit within content width
 */
function wrapText(
  text: string, 
  font: PDFFont, 
  fontSize: number, 
  contentWidth: number
): string[] {
  const sanitized = sanitizeText(text);
  if (!sanitized) return [];
  
  const words = sanitized.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width <= contentWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Wrap skills text - tries to keep on one line, breaks at | separators if needed
 */
function wrapSkillsText(
  text: string,
  font: PDFFont,
  fontSize: number,
  contentWidth: number
): string[] {
  const sanitized = sanitizeText(text);
  if (!sanitized) return [];
  
  // First, check if entire text fits on one line
  const fullWidth = font.widthOfTextAtSize(sanitized, fontSize);
  if (fullWidth <= contentWidth) {
    return [sanitized];
  }
  
  // If it doesn't fit, try breaking at | separators (skill separators)
  if (sanitized.includes('|')) {
    const skills = sanitized.split('|').map(s => s.trim());
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const separator = i > 0 ? ' | ' : '';
      const testLine = currentLine ? `${currentLine}${separator}${skill}` : skill;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = skill;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [sanitized];
  }
  
  // Fallback to regular word wrapping
  return wrapText(sanitized, font, fontSize, contentWidth);
}

export async function exportToPdfAts(
  resumeData: ResumeData,
  filename: string,
  layoutSettings?: LayoutSettings
): Promise<void> {
  try {
    const { header, summary, skills, experience, education, generalSections, sectionVisibility } = resumeData;
    const settings = layoutSettings || ({} as LayoutSettings);
    const pageSize = settings.pageSize === 'letter' ? 'letter' : 'a4';
    const pageDim = PAGE_DIMENSIONS[pageSize];
    const marginMm = settings.margin ? MARGIN_VALUES[settings.margin].value : DEFAULT_MARGIN_MM;

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page dimensions in points
    const pageWidth = mmToPoints(pageDim.width);
    const pageHeight = mmToPoints(pageDim.height);
    const margin = mmToPoints(marginMm);
    const contentWidth = pageWidth - 2 * margin;
    
    // Font sizes
    const baseFontSize = settings.fontSize || 11;
    const headingSize = Math.round(baseFontSize * 1.3);
    const nameSize = Math.round(baseFontSize * 1.8);
    const lineHeight = baseFontSize * 1.4;
    
    // Colors
    const blueColor = rgb(37/255, 99/255, 235/255);
    const blackColor = rgb(0, 0, 0);

    // Track current page and Y position
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Check if we need a new page
    const checkNewPage = (neededHeight: number): void => {
      if (y - neededHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    };

    // Add text to PDF
    const addText = (
      text: string,
      options: {
        fontSize?: number;
        bold?: boolean;
        color?: RGB;
        align?: 'left' | 'center';
        isSkills?: boolean; // Special handling for skills
      } = {}
    ): void => {
      const fontSize = options.fontSize || baseFontSize;
      const font = options.bold ? fontBold : fontRegular;
      const color = options.color || blackColor;
      const align = options.align || 'left';
      
      // Use special wrapping for skills to keep them on one line when possible
      const lines = options.isSkills 
        ? wrapSkillsText(text, font, fontSize, contentWidth)
        : wrapText(text, font, fontSize, contentWidth);
      if (lines.length === 0) return;
      
      const totalHeight = lines.length * lineHeight;
      checkNewPage(totalHeight);
      
      for (const line of lines) {
        const textWidth = font.widthOfTextAtSize(line, fontSize);
        let x = margin;
        
        if (align === 'center') {
          x = (pageWidth - textWidth) / 2;
        }
        
        currentPage.drawText(line, {
          x,
          y,
          size: fontSize,
          font,
          color,
        });
        
        y -= lineHeight;
      }
    };

    // Add vertical space
    const addSpace = (points: number): void => {
      y -= points;
      if (y < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    };

    // --- Header ---
    if (header.name) {
      addText(header.name, { fontSize: nameSize, bold: true, color: blueColor, align: 'center' });
      addSpace(3);
    }
    
    if (header.title) {
      addText(header.title, { fontSize: Math.round(baseFontSize * 1.1), align: 'center' });
      addSpace(5);
    }
    
    // Contact information on separate lines, grouped logically
    if (header.contact.email || header.contact.phone || header.contact.linkedin || header.contact.github) {
      const contactLine1 = [header.contact.email, header.contact.phone].filter(Boolean).join(' | ');
      const contactLine2 = [header.contact.linkedin, header.contact.github].filter(Boolean).join(' | ');
      
      if (contactLine1) addText(contactLine1, { align: 'center' });
      if (contactLine2) addText(contactLine2, { align: 'center' });
    }
    
    // Location and work authorization on one line
    if (header.contact.location) {
      const locationParts = [header.contact.location, header.contact.workAuthorization].filter(Boolean);
      if (locationParts.length > 0) {
        addText(`Location: ${locationParts.join(' | ')}`, { align: 'center' });
      }
    }
    
    // Relocation on separate line if exists
    if (header.contact.relocation || header.contact.travel) {
      const relocationParts = [header.contact.relocation, header.contact.travel].filter(Boolean);
      if (relocationParts.length > 0) {
        addText(`Relocation: ${relocationParts.join(' | ')}`, { align: 'center' });
      }
    }
    
    addSpace(15);

    // --- Professional Summary ---
    if (sectionVisibility?.summary !== false && summary) {
      addText('PROFESSIONAL SUMMARY', { fontSize: headingSize, bold: true, color: blueColor });
      addSpace(5);
      addText(summary);
      addSpace(15);
    }

    // --- Technical Skills ---
    if (sectionVisibility?.skills !== false && skills.length > 0) {
      addText('TECHNICAL SKILLS', { fontSize: headingSize, bold: true, color: blueColor });
      addSpace(5);
      skills.forEach((s) => {
        // Use isSkills flag for special wrapping that respects | separators
        addText(`${s.category}: ${s.skills}`, { isSkills: true });
      });
      addSpace(15);
    }

    // --- Professional Experience ---
    if (experience.length > 0) {
      addText('PROFESSIONAL EXPERIENCE', { fontSize: headingSize, bold: true, color: blueColor });
      addSpace(5);

      experience.forEach((exp, idx) => {
        if (idx > 0) addSpace(10);
        
        if (exp.role) {
          addText(exp.role, { bold: true, fontSize: Math.round(baseFontSize * 1.05) });
        }
        
        const companyLine = [exp.company, exp.period].filter(Boolean).join(' | ');
        if (companyLine) addText(companyLine);
        
        if (exp.clientNote) addText(exp.clientNote);
        if (exp.description) addText(exp.description);
        
        exp.bullets.forEach((bullet) => {
          addText(`* ${bullet}`);
        });
        
        if (exp.achievements?.length) {
          addSpace(5);
          addText('Key Achievements:', { bold: true });
          exp.achievements.forEach((achievement) => {
            addText(`* ${achievement}`);
          });
        }
      });
      addSpace(15);
    }

    // --- Education ---
    if (sectionVisibility?.education !== false && education.length > 0) {
      addText('EDUCATION', { fontSize: headingSize, bold: true, color: blueColor });
      addSpace(5);
      education.forEach((edu) => {
        if (edu.degree) addText(edu.degree, { bold: true });
        const institutionLine = [edu.institution, edu.location].filter(Boolean).join(' | ');
        if (institutionLine) addText(institutionLine);
      });
      addSpace(15);
    }

    // --- General Sections ---
    if (sectionVisibility?.expertise && generalSections.length > 0) {
      addText('ADDITIONAL INFORMATION', { fontSize: headingSize, bold: true, color: blueColor });
      addSpace(5);
      generalSections.forEach((section) => {
        if (section.title.trim()) {
          addText(section.title, { bold: true, fontSize: Math.round(baseFontSize * 1.05) });
        }
        if (section.summary.trim()) {
          addText(section.summary);
        }
        addSpace(8);
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Download - convert to regular array buffer for browser compatibility
    const blob = new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup after a delay to ensure download starts
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('PDF ATS Export Error:', error);
    alert('Failed to generate PDF. Please try again or use Print → PDF instead.');
    throw error;
  }
}
