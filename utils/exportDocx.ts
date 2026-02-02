import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '@/types/resume';
import {
  LayoutSettings,
  getPageDimensions,
  MARGIN_VALUES,
  DEFAULT_LAYOUT_SETTINGS,
} from '@/types/layout';

/**
 * Generates and downloads a DOCX file from resume data
 * 
 * Layout settings are applied:
 * - Font size is converted from px to half-points
 * - Vertical spacing is applied based on settings
 * - Page size and margins are respected
 */
export async function exportToDocx(
  resumeData: ResumeData,
  layoutSettings?: LayoutSettings
): Promise<void> {
  const { header, summary, skills, experience, education, generalSections } = resumeData;

  const settings: LayoutSettings = layoutSettings || DEFAULT_LAYOUT_SETTINGS;
  const vs = settings.verticalSpacing;

  // Convert font size from px to half-points (1px ≈ 0.75pt, 1pt = 2 half-points)
  const fontSizeHalfPoints = Math.round(settings.fontSize * 0.75 * 2);
  const headingFontSize = Math.round(fontSizeHalfPoints * 1.4);
  const nameFontSize = Math.round(fontSizeHalfPoints * 2.2);

  // Convert px spacing to twips (1px ≈ 15 twips)
  const sectionSpacingTwips = vs.sectionGap * 15;
  const paragraphSpacingTwips = vs.paragraphGap * 15;
  const bulletSpacingTwips = vs.bulletGap * 15;
  const headerSpacingTwips = vs.headerGap * 15;
  const experienceSpacingTwips = vs.experienceGap * 15;

  // Page setup
  const marginMm = MARGIN_VALUES[settings.margin].value;
  const marginTwips = convertMillimetersToTwip(marginMm);
  const pageDim = getPageDimensions(settings);
  const pageWidthTwips = convertMillimetersToTwip(pageDim.width);
  const pageHeightTwips = convertMillimetersToTwip(pageDim.height);

  // Line spacing (240 twips = single line)
  const lineSpacingTwips = Math.round(240 * settings.lineHeight);

  // Helper: Section heading
  const createSectionHeading = (text: string): Paragraph => {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: headingFontSize,
        }),
      ],
      spacing: { before: sectionSpacingTwips, after: headerSpacingTwips },
      border: {
        bottom: {
          color: '2563EB',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    });
  };

  // Helper: Bullet point
  const createBullet = (text: string): Paragraph => {
    return new Paragraph({
      children: [new TextRun({ text, size: fontSizeHalfPoints })],
      bullet: { level: 0 },
      spacing: { after: bulletSpacingTwips, line: lineSpacingTwips },
    });
  };

  // Helper: Normal paragraph
  const createParagraph = (text: string, options?: { bold?: boolean; italic?: boolean; color?: string }): Paragraph => {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: fontSizeHalfPoints,
          bold: options?.bold,
          italics: options?.italic,
          color: options?.color,
        }),
      ],
      spacing: { after: paragraphSpacingTwips, line: lineSpacingTwips },
    });
  };

  const children: Paragraph[] = [];

  // === HEADER ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: header.name,
          bold: true,
          size: nameFontSize,
          color: '1E3A8A',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: paragraphSpacingTwips },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: header.title,
          size: Math.round(fontSizeHalfPoints * 1.15),
          color: '4B5563',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: paragraphSpacingTwips },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${header.contact.email} | ${header.contact.phone} | ${header.contact.linkedin} | ${header.contact.github}`,
          size: fontSizeHalfPoints,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: Math.round(bulletSpacingTwips) },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Location: ${header.contact.location} | Work Authorization: ${header.contact.workAuthorization}`,
          size: fontSizeHalfPoints,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: Math.round(bulletSpacingTwips) },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Relocation: ${header.contact.relocation} | Travel: ${header.contact.travel}`,
          size: fontSizeHalfPoints,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: sectionSpacingTwips },
    })
  );

  // === PROFESSIONAL SUMMARY ===
  children.push(
    createSectionHeading('PROFESSIONAL SUMMARY'),
    createParagraph(summary)
  );

  // === TECHNICAL SKILLS ===
  children.push(createSectionHeading('TECHNICAL SKILLS'));
  skills.forEach((skill) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${skill.category}: `, bold: true, size: fontSizeHalfPoints }),
          new TextRun({ text: skill.skills, size: fontSizeHalfPoints }),
        ],
        spacing: { after: bulletSpacingTwips, line: lineSpacingTwips },
      })
    );
  });

  // === PROFESSIONAL EXPERIENCE ===
  children.push(createSectionHeading('PROFESSIONAL EXPERIENCE'));
  experience.forEach((exp, index) => {
    // Job header
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.role, bold: true, size: Math.round(fontSizeHalfPoints * 1.1) }),
        ],
        spacing: { before: index > 0 ? experienceSpacingTwips : 0, after: bulletSpacingTwips },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: exp.company, italics: true, size: fontSizeHalfPoints }),
          new TextRun({ text: ` | ${exp.period}`, size: fontSizeHalfPoints }),
        ],
        spacing: { after: bulletSpacingTwips },
      })
    );

    // Client note
    if (exp.clientNote) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.clientNote, italics: true, size: fontSizeHalfPoints, color: '6B7280' }),
          ],
          spacing: { after: bulletSpacingTwips },
        })
      );
    }

    // Description
    if (exp.description) {
      children.push(createParagraph(exp.description));
    }

    // Bullets
    exp.bullets.forEach((bullet) => {
      children.push(createBullet(bullet));
    });

    // Achievements
    if (exp.achievements && exp.achievements.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Key Achievements:', bold: true, size: fontSizeHalfPoints }),
          ],
          spacing: { before: bulletSpacingTwips, after: bulletSpacingTwips },
        })
      );
      exp.achievements.forEach((achievement) => {
        children.push(createBullet(achievement));
      });
    }
  });

  // === EDUCATION ===
  children.push(createSectionHeading('EDUCATION'));
  education.forEach((edu) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: edu.degree, bold: true, size: Math.round(fontSizeHalfPoints * 1.05) }),
        ],
        spacing: { after: bulletSpacingTwips },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${edu.institution} | ${edu.location}`, size: fontSizeHalfPoints }),
        ],
        spacing: { after: paragraphSpacingTwips },
      })
    );
  });

  // === GENERAL SECTIONS === (Optional)
  if (resumeData.sectionVisibility?.expertise !== false && generalSections.length > 0) {
    children.push(createSectionHeading('GENERAL SECTIONS'));
    generalSections.forEach((s) => {
      if (!s.title?.trim() && !s.summary?.trim()) return;
      if (s.title?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: s.title, bold: true, size: Math.round(fontSizeHalfPoints * 1.1) })],
            spacing: { after: bulletSpacingTwips },
          })
        );
      }
      if (s.summary?.trim()) children.push(createParagraph(s.summary));
    });
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidthTwips,
              height: pageHeightTwips,
            },
            margin: {
              top: marginTwips,
              right: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
            },
          },
        },
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${header.name.replace(/\s+/g, '_')}_Resume.docx`);
}
