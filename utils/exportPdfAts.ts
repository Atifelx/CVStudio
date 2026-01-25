import jsPDF from 'jspdf';
import { ResumeData } from '@/types/resume';
import { LayoutSettings, PAGE_DIMENSIONS, MARGIN_VALUES } from '@/types/layout';

/**
 * ATS-Friendly PDF Export
 *
 * Produces a **text-based PDF** (native text, no images). ATS systems can parse
 * and extract keywords from this format. Use this for job applications.
 *
 * Contrast: exportToPdf() creates image-based PDFs (high-quality for viewing/
 * print) but many ATS cannot parse those.
 */

const DEFAULT_MARGIN_MM = 12;
const FONT = 'helvetica';

export async function exportToPdfAts(
  resumeData: ResumeData,
  filename: string,
  layoutSettings?: LayoutSettings
): Promise<void> {
  const { header, summary, skills, experience, education, generalSections, sectionVisibility } = resumeData;
  const settings = layoutSettings || ({} as LayoutSettings);
  const pageSize = settings.pageSize === 'letter' ? 'letter' : 'a4';
  const pageDim = PAGE_DIMENSIONS[pageSize];
  const marginMm = settings.margin ? MARGIN_VALUES[settings.margin].value : DEFAULT_MARGIN_MM;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize,
    compress: true,
  });

  const pageW = pageDim.width;
  const pageH = pageDim.height;
  const contentW = pageW - 2 * marginMm;
  const contentLeft = marginMm;
  const centerX = pageW / 2;
  let y = marginMm;
  const fontSize = settings.fontSize || 11;
  const lineHeightMm = fontSize * 0.45;
  const headingSize = Math.round(fontSize * 1.3);
  const nameSize = Math.round(fontSize * 2);

  function checkNewPage(neededMm: number): void {
    if (y + neededMm > pageH - marginMm) {
      pdf.addPage();
      y = marginMm;
    }
  }

  function addText(
    text: string,
    opts: { size?: number; bold?: boolean; align?: 'left' | 'center' } = {}
  ): void {
    const size = opts.size ?? fontSize;
    pdf.setFont(FONT, opts.bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, contentW);
    const h = lines.length * lineHeightMm * (size / fontSize);
    checkNewPage(h);
    const x = opts.align === 'center' ? centerX : contentLeft;
    pdf.text(lines, x, y, { align: opts.align || 'left' });
    y += h;
  }

  function addSpace(mm: number): void {
    y += mm;
  }

  // --- Header ---
  if (header.name) {
    pdf.setFont(FONT, 'bold');
    pdf.setFontSize(nameSize);
    pdf.setTextColor(30, 58, 138);
    const nameLines = pdf.splitTextToSize(header.name, contentW);
    const nameH = nameLines.length * lineHeightMm * (nameSize / fontSize);
    checkNewPage(nameH);
    pdf.text(nameLines, centerX, y, { align: 'center' });
    y += nameH;
    pdf.setTextColor(0, 0, 0);
  }
  if (header.title) {
    addText(header.title, { size: Math.round(fontSize * 1.1), align: 'center' });
  }
  const contactParts = [header.contact.email, header.contact.phone, header.contact.linkedin, header.contact.github]
    .filter(Boolean)
    .join(' | ');
  if (contactParts) addText(contactParts, { align: 'center' });
  const locParts = [header.contact.location, header.contact.workAuthorization].filter(Boolean);
  if (locParts.length) addText(`Location: ${locParts.join(' | ')}`, { align: 'center' });
  const relParts = [header.contact.relocation, header.contact.travel].filter(Boolean);
  if (relParts.length) addText(`Relocation: ${relParts.join(' | ')}`, { align: 'center' });
  addSpace(6);

  // --- Professional Summary ---
  if (sectionVisibility?.summary !== false && summary) {
    pdf.setTextColor(37, 99, 235);
    addText('PROFESSIONAL SUMMARY', { size: headingSize, bold: true });
    pdf.setTextColor(0, 0, 0);
    addText(summary);
    addSpace(5);
  }

  // --- Technical Skills ---
  if (sectionVisibility?.skills !== false && skills.length > 0) {
    pdf.setTextColor(37, 99, 235);
    addText('TECHNICAL SKILLS', { size: headingSize, bold: true });
    pdf.setTextColor(0, 0, 0);
    skills.forEach((s) => addText(`${s.category}: ${s.skills}`));
    addSpace(5);
  }

  // --- Professional Experience ---
  pdf.setTextColor(37, 99, 235);
  addText('PROFESSIONAL EXPERIENCE', { size: headingSize, bold: true });
  pdf.setTextColor(0, 0, 0);

  experience.forEach((exp, idx) => {
    if (idx > 0) addSpace(4);
    addText(exp.role, { bold: true, size: Math.round(fontSize * 1.1) });
    addText(`${exp.company} | ${exp.period}`);
    if (exp.clientNote) addText(exp.clientNote);
    if (exp.description) addText(exp.description);
    exp.bullets.forEach((b) => addText(`• ${b}`));
    if (exp.achievements?.length) {
      addText('Key Achievements:', { bold: true });
      exp.achievements.forEach((a) => addText(`• ${a}`));
    }
  });
  addSpace(5);

  // --- Education ---
  if (sectionVisibility?.education !== false && education.length > 0) {
    pdf.setTextColor(37, 99, 235);
    addText('EDUCATION', { size: headingSize, bold: true });
    pdf.setTextColor(0, 0, 0);
    education.forEach((edu) => {
      addText(edu.degree, { bold: true });
      addText(`${edu.institution} | ${edu.location}`);
    });
    addSpace(5);
  }

  // --- General Sections ---
  if (sectionVisibility?.expertise && generalSections.length > 0) {
    pdf.setTextColor(37, 99, 235);
    addText('GENERAL SECTIONS', { size: headingSize, bold: true });
    pdf.setTextColor(0, 0, 0);
    generalSections.forEach((s) => {
      if (s.title.trim()) addText(s.title, { bold: true, size: Math.round(fontSize * 1.1) });
      if (s.summary.trim()) addText(s.summary);
      addSpace(3);
    });
  }

  pdf.save(filename);
}
