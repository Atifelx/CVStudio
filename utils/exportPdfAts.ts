import { PDFDocument, rgb, StandardFonts, PDFFont, RGB } from 'pdf-lib';
import { ResumeData } from '@/types/resume';
import { LayoutSettings, getPageDimensions, MARGIN_VALUES } from '@/types/layout';
import type { FontFamily } from '@/types/layout';

/**
 * ATS-Friendly PDF Export using pdf-lib
 *
 * Produces a **text-based PDF** (native text, no images). ATS systems can parse
 * and extract keywords from this format. Respects user font family and size.
 */

const DEFAULT_MARGIN_MM = 12;

/** Standard bullet character for list items (kept in sanitize for PDF). */
const BULLET = '\u2022';

/** Map app font to PDF standard fonts (pdf-lib only supports StandardFonts). */
function getStandardFonts(fontFamily: FontFamily | undefined): { regular: StandardFonts; bold: StandardFonts } {
  const serif = ['Times New Roman', 'Georgia', 'Garamond'];
  const f = fontFamily || 'Calibri';
  if (serif.includes(f)) {
    return { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold };
  }
  return { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold };
}

// Convert mm to points (1 mm = 2.83465 points)
const mmToPoints = (mm: number) => mm * 2.83465;

/**
 * Sanitize text to remove problematic characters
 */
function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2023\u2043\u204C\u204D]/g, BULLET)
    .replace(/\u2026/g, '...')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\u00C0-\u00FF\u2022]/g, ' ')
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
 * Wrap skills text at same font size as body (no shrinking – keeps font consistent).
 */
function wrapSkillsText(
  text: string,
  font: PDFFont,
  fontSize: number,
  contentWidth: number
): string[] {
  return wrapText(text, font, fontSize, contentWidth);
}

export async function exportToPdfAts(
  resumeData: ResumeData,
  filename: string,
  layoutSettings?: LayoutSettings
): Promise<void> {
  try {
    const { header, summary, skills, experience, education, generalSections, sectionVisibility } = resumeData;
    const settings = layoutSettings || ({} as LayoutSettings);
    const pageDim = getPageDimensions(settings);
    const marginMm = settings.margin ? MARGIN_VALUES[settings.margin].value : DEFAULT_MARGIN_MM;

    const pdfDoc = await PDFDocument.create();

    const { regular: regularFontKey, bold: boldFontKey } = getStandardFonts(settings.fontFamily);
    const fontRegular = await pdfDoc.embedFont(regularFontKey);
    const fontBold = await pdfDoc.embedFont(boldFontKey);

    const pageWidth = mmToPoints(pageDim.width);
    const pageHeight = mmToPoints(pageDim.height);
    const margin = mmToPoints(marginMm);
    const contentWidth = pageWidth - 2 * margin;

    const baseFontSize = settings.fontSize || 11;
    const headingSize = Math.round(baseFontSize * 1.3);
    const nameSize = Math.round(baseFontSize * 1.8);
    const lineHeight = baseFontSize * 1.4;

    const blueColor = rgb(37 / 255, 99 / 255, 235 / 255);
    const blackColor = rgb(0, 0, 0);

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const checkNewPage = (neededHeight: number): void => {
      if (y - neededHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    };

    const addText = (
      text: string,
      options: {
        fontSize?: number;
        bold?: boolean;
        color?: RGB;
        align?: 'left' | 'center';
        isSkills?: boolean;
      } = {}
    ): void => {
      let fontSize = options.fontSize || baseFontSize;
      const font = options.bold ? fontBold : fontRegular;
      const color = options.color || blackColor;
      const align = options.align || 'left';

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

    if (header.contact.email || header.contact.phone || header.contact.linkedin || header.contact.github) {
      const contactLine1 = [header.contact.email, header.contact.phone].filter(Boolean).join(' | ');
      const contactLine2 = [header.contact.linkedin, header.contact.github].filter(Boolean).join(' | ');
      if (contactLine1) addText(contactLine1, { align: 'center' });
      if (contactLine2) addText(contactLine2, { align: 'center' });
    }

    if (header.contact.location) {
      const locationParts = [header.contact.location, header.contact.workAuthorization].filter(Boolean);
      if (locationParts.length > 0) {
        addText(`Location: ${locationParts.join(' | ')}`, { align: 'center' });
      }
    }

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
          addText(`${BULLET} ${bullet}`);
        });

        if (exp.achievements?.length) {
          addSpace(5);
          addText('Key Achievements:', { bold: true });
          exp.achievements.forEach((achievement) => {
            addText(`${BULLET} ${achievement}`);
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

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

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
