import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from 'pdf-lib';
import { ResumeData } from '@/types/resume';
import { LayoutSettings, getPageDimensions, MARGIN_VALUES, COLOR_THEMES } from '@/types/layout';

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
 * Wrap skills text - tries to keep on one line, reduces font size if needed
 * Returns: { lines: string[], fontSize: number } - adjusted font size if needed
 */
function wrapSkillsText(
  text: string,
  font: PDFFont,
  fontSize: number,
  contentWidth: number
): { lines: string[]; fontSize: number } {
  const sanitized = sanitizeText(text);
  if (!sanitized) return { lines: [], fontSize };
  
  // First, check if entire text fits on one line at current size
  let currentFontSize = fontSize;
  let fullWidth = font.widthOfTextAtSize(sanitized, currentFontSize);
  
  // If it fits, return as single line
  if (fullWidth <= contentWidth) {
    return { lines: [sanitized], fontSize: currentFontSize };
  }
  
  // Try reducing font size to fit on one line (minimum 8pt)
  const minFontSize = 8;
  let adjustedFontSize = currentFontSize;
  
  while (adjustedFontSize > minFontSize && fullWidth > contentWidth) {
    adjustedFontSize -= 0.5; // Reduce by 0.5pt each iteration
    fullWidth = font.widthOfTextAtSize(sanitized, adjustedFontSize);
    
    // If it now fits, use this smaller size
    if (fullWidth <= contentWidth) {
      return { lines: [sanitized], fontSize: adjustedFontSize };
    }
  }
  
  // If still doesn't fit even at minimum size, try breaking at | separators
  if (sanitized.includes('|')) {
    const skills = sanitized.split('|').map(s => s.trim());
    const lines: string[] = [];
    let currentLine = '';
    
    // Use the adjusted (smaller) font size for wrapping calculation
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const separator = i > 0 ? ' | ' : '';
      const testLine = currentLine ? `${currentLine}${separator}${skill}` : skill;
      const width = font.widthOfTextAtSize(testLine, adjustedFontSize);
      
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
    
    return { 
      lines: lines.length > 0 ? lines : [sanitized], 
      fontSize: adjustedFontSize 
    };
  }
  
  // Fallback to regular word wrapping with adjusted font size
  const wrappedLines = wrapText(sanitized, font, adjustedFontSize, contentWidth);
  return { lines: wrappedLines, fontSize: adjustedFontSize };
}

export async function exportToPdfAts(
  resumeData: ResumeData,
  filename: string,
  layoutSettings?: LayoutSettings
): Promise<void> {
  try {
    const { header, summary, skills, experience, education, generalSections, customSections, sectionVisibility } = resumeData;
    const settings = layoutSettings || ({} as LayoutSettings);
    const pageDim = getPageDimensions(settings);
    const marginMm = settings.margin ? MARGIN_VALUES[settings.margin].value : DEFAULT_MARGIN_MM;

    const pdfDoc = await PDFDocument.create();

    // ATS-friendly metadata (title, author help parsing and search)
    const docTitle = sanitizeText(header.name) ? `Resume - ${sanitizeText(header.name)}` : 'Resume';
    pdfDoc.setTitle(docTitle);
    pdfDoc.setAuthor(sanitizeText(header.name) || 'Applicant');
    pdfDoc.setSubject('Resume');
    pdfDoc.setCreator('CV Studio');
    pdfDoc.setProducer('CV Studio');

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
    
    // Template-specific settings
    const isClassic = settings.template === 'classic';
    
    // Get color theme
    const colorTheme = COLOR_THEMES.find(c => c.value === settings.colorTheme) || COLOR_THEMES[0];
    
    // Parse hex color to RGB
    const hexToRgb = (hex: string): RGB => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        );
      }
      return rgb(30/255, 64/255, 175/255); // Default blue
    };
    
    // Colors – for light themes use titleColor (dark) so section titles have contrast on white
    const sectionTitleHex = colorTheme.titleColor || colorTheme.primary;
    const accentColorRgb = hexToRgb(sectionTitleHex);
    const blackColor = rgb(0, 0, 0);
    const grayColor = rgb(80/255, 80/255, 80/255);
    
    // Use black for classic template; for modern use dark section title color (fixes light theme contrast)
    const accentColor = isClassic ? blackColor : accentColorRgb;

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
      let fontSize = options.fontSize || baseFontSize;
      const font = options.bold ? fontBold : fontRegular;
      const color = options.color || blackColor;
      const align = options.align || 'left';
      
      // Use special wrapping for skills - may adjust font size to fit on one line
      let lines: string[];
      if (options.isSkills) {
        const result = wrapSkillsText(text, font, fontSize, contentWidth);
        lines = result.lines;
        fontSize = result.fontSize; // Use adjusted font size if it was reduced
      } else {
        lines = wrapText(text, font, fontSize, contentWidth);
      }
      
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
      addText(header.name, { fontSize: nameSize, bold: true, color: accentColor, align: 'center' });
      addSpace(3);
    }
    
    if (header.title) {
      addText(header.title, { fontSize: Math.round(baseFontSize * 1.1), color: isClassic ? grayColor : blackColor, align: 'center' });
      addSpace(5);
    }
    
    // Contact information - classic uses diamond separators
    const separator = isClassic ? ' * ' : ' | ';
    
    if (header.contact.email || header.contact.phone || header.contact.linkedin || header.contact.github) {
      const contactLine1 = [header.contact.email, header.contact.phone].filter(Boolean).join(separator);
      const contactLine2 = [header.contact.linkedin, header.contact.github].filter(Boolean).join(separator);
      
      // Classic template: combine all contact on one line if fits
      if (isClassic) {
        const allContacts = [header.contact.email, header.contact.phone, header.contact.location].filter(Boolean).join(separator);
        if (allContacts) addText(allContacts, { align: 'center' });
        const links = [header.contact.linkedin, header.contact.github].filter(Boolean).join(separator);
        if (links) addText(links, { align: 'center' });
      } else {
        if (contactLine1) addText(contactLine1, { align: 'center' });
        if (contactLine2) addText(contactLine2, { align: 'center' });
      }
    }
    
    // Location and work authorization on one line (modern only - classic includes in contact)
    if (!isClassic && header.contact.location) {
      const locationParts = [header.contact.location, header.contact.workAuthorization].filter(Boolean);
      if (locationParts.length > 0) {
        addText(`Location: ${locationParts.join(' | ')}`, { align: 'center' });
      }
    }
    
    // Relocation on separate line if exists
    if (header.contact.relocation || header.contact.travel) {
      const relocationParts = [header.contact.relocation, header.contact.travel].filter(Boolean);
      if (relocationParts.length > 0) {
        addText(`${isClassic ? 'Open to: ' : 'Relocation: '}${relocationParts.join(separator)}`, { align: 'center' });
      }
    }
    
    addSpace(15);

    // Helper to add section heading (centered for classic, left for modern)
    const addSectionHeading = (title: string): void => {
      if (isClassic) {
        // Classic template: centered title (uppercase with tracking)
        addText(title.toUpperCase(), { fontSize: headingSize, bold: true, color: accentColor, align: 'center' });
      } else {
        // Modern template: left-aligned blue title
        addText(title.toUpperCase(), { fontSize: headingSize, bold: true, color: accentColor });
      }
      addSpace(5);
    };

    // --- Professional Summary ---
    if (sectionVisibility?.summary !== false && summary) {
      addSectionHeading(isClassic ? 'Summary' : 'Professional Summary');
      addText(summary);
      addSpace(15);
    }

    // --- Technical Skills ---
    if (sectionVisibility?.skills !== false && skills.length > 0) {
      addSectionHeading(isClassic ? 'Skills' : 'Technical Skills');
      skills.forEach((s) => {
        if (isClassic) {
          // Classic: Category — Skill1 — Skill2
          const skillList = s.skills.split('|').map(sk => sk.trim()).filter(Boolean).join(' - ');
          addText(`${s.category} - ${skillList}`, { isSkills: true });
        } else {
          // Modern: Category: Skill1 | Skill2
          addText(`${s.category}: ${s.skills}`, { isSkills: true });
        }
      });
      addSpace(15);
    }

    // --- Professional Experience ---
    if (experience.length > 0) {
      addSectionHeading(isClassic ? 'Experience' : 'Professional Experience');

      experience.forEach((exp, idx) => {
        if (idx > 0) addSpace(10);
        
        if (exp.role) {
          addText(exp.role, { bold: true, fontSize: Math.round(baseFontSize * 1.05) });
        }
        
        // Classic: Company — Date on same line
        // Modern: Company | Date
        const companyLine = [exp.company, exp.period].filter(Boolean).join(isClassic ? ' - ' : ' | ');
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
      addSectionHeading('Education');
      education.forEach((edu) => {
        if (edu.degree) addText(edu.degree, { bold: true });
        const institutionLine = [edu.institution, edu.location].filter(Boolean).join(isClassic ? ' - ' : ' | ');
        if (institutionLine) addText(institutionLine);
      });
      addSpace(15);
    }

    // --- General Sections ---
    if (sectionVisibility?.expertise && generalSections.length > 0) {
      addSectionHeading(isClassic ? 'Additional' : 'Additional Information');
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

    // --- Custom Sections ---
    if (customSections && customSections.length > 0) {
      customSections.forEach((section) => {
        if (!section.title.trim()) return;
        
        addSectionHeading(section.title);
        
        // Handle different content types
        if (section.contentType === 'paragraph' && section.content.trim()) {
          addText(section.content);
        } else if (section.contentType === 'bullets') {
          const validBullets = section.bullets.filter(b => b.trim());
          validBullets.forEach((bullet) => {
            addText(`* ${bullet}`);
          });
        } else if (section.contentType === 'items') {
          const validItems = section.items.filter(i => i.label.trim());
          validItems.forEach((item) => {
            const itemText = item.value ? `${item.label} - ${item.value}` : item.label;
            addText(itemText);
          });
        }
        
        addSpace(15);
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
