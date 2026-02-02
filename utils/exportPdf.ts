import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import { LayoutSettings, PAGE_DIMENSIONS } from '@/types/layout';

export interface ExportPdfOptions {
  /** Apply compact layout so content fits in at most this many pages (1, 2, or 3). Portrait only. */
  maxPages?: number;
  /** 'standard' = best quality (larger file); 'small' = smaller file (≤2MB). */
  quality?: 'standard' | 'small';
}

/** Collect Y positions (canvas pixels) where we can safely split pages (bottom of sections/entries). */
function getSafeBreakPoints(element: HTMLElement, scale: number): number[] {
  const containerTop = element.getBoundingClientRect().top;
  const selector = '.experience-entry, .education-entry, .skill-category';
  const entries = element.querySelectorAll(selector);
  const set = new Set<number>();
  entries.forEach((el) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    const bottomFromTop = r.bottom - containerTop;
    if (bottomFromTop > 0) set.add(Math.round(bottomFromTop * scale));
  });
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * High-quality PDF Export (no print dialog). Target file size ≤2MB.
 */
export async function exportToPdf(
  elementId: string,
  filename: string,
  layoutSettings?: LayoutSettings,
  options?: ExportPdfOptions
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    alert('Could not find resume content to export');
    return;
  }

  const settings: LayoutSettings = layoutSettings || {
    fontSize: 11,
    lineHeight: 1.2,
    fontFamily: 'Calibri',
    spacing: 'normal',
    pageSize: 'a4',
    margin: 'narrow',
    contentWidth: 100,
    verticalSpacing: {
      sectionGap: 20,
      paragraphGap: 8,
      bulletGap: 4,
      headerGap: 8,
      experienceGap: 16,
      headerPadding: 24,
    },
    targetPages: null,
    template: 'modern',
    colorTheme: 'blue',
    printCompact: true,
    printOrientation: 'portrait',
  };

  try {
    // Always portrait (never landscape): A4 = 210mm × 297mm (width × height)
    const pageDim = PAGE_DIMENSIONS[settings.pageSize];
    const portraitWidth = Math.min(pageDim.width, pageDim.height);
    const portraitHeight = Math.max(pageDim.width, pageDim.height);
    const pageDimPortrait = { width: portraitWidth, height: portraitHeight, name: pageDim.name };
    const marginMm = 5;

    let container: Element | null = element.closest('.resume-container') || element;
    const maxPages = options?.maxPages;
    if (maxPages && container instanceof HTMLElement) {
      if (maxPages === 1) {
        container.classList.add('pdf-export-compact-1page');
      } else if (maxPages === 2 || maxPages === 3) {
        container.classList.add('pdf-export-compact-2pages');
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const quality = options?.quality ?? 'small';
    const jpegQuality = quality === 'standard' ? 0.88 : 0.72;
    const maxSizeBytes = quality === 'standard' ? 4 * 1024 * 1024 : 2 * 1024 * 1024;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                  background: rgba(0,0,0,0.5); display: flex; align-items: center; 
                  justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 24px 48px; border-radius: 12px; text-align: center;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Generating high-quality PDF...</div>
          <div style="font-size: 14px; color: #666;">Sharp text · print-ready</div>
        </div>
      </div>
    `;
    document.body.appendChild(loadingDiv);

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 200));

    element.scrollIntoView({ block: 'start', behavior: 'instant' });
    await new Promise(resolve => setTimeout(resolve, 150));

    // Scale: slightly higher for standard quality
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const scale = quality === 'standard'
      ? Math.min(5, Math.max(4, Math.round(dpr * 2)))
      : Math.min(4, Math.max(3, Math.round(dpr * 1.5)));

    element.classList.add('pdf-export-active');
    container = element.closest('.resume-container') || element;
    const originalOverflow = container instanceof HTMLElement ? container.style.overflow : '';
    if (container instanceof HTMLElement) container.style.overflow = 'visible';
    
    // Ensure full height is captured - scroll to top first
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 100));

    const noPrintElements = element.querySelectorAll('.no-print');
    const originalDisplays: (string | null)[] = [];
    noPrintElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalDisplays.push(htmlEl.style.display);
      htmlEl.style.display = 'none';
    });

    // Capture full element height - ensure we get all content
    const fullHeight = Math.max(
      element.scrollHeight,
      element.offsetHeight,
      element.clientHeight
    );
    
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      width: element.scrollWidth,
      height: fullHeight, // Use full height to capture all pages
      windowWidth: element.scrollWidth,
      windowHeight: fullHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      // Ensure colors are captured correctly
      onclone: (clonedDoc) => {
        // Force render colors by ensuring styles are applied
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Ensure all computed styles are preserved
          const style = clonedDoc.createElement('style');
          style.textContent = `
            .text-blue-600 { color: rgb(37, 99, 235) !important; }
            .border-blue-600 { border-color: rgb(37, 99, 235) !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
    });
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Element dimensions:', element.scrollWidth, 'x', fullHeight);

    // Safe break points (bottom of experience/education/skill blocks) so we don't split mid-section
    const safeBreakPoints = getSafeBreakPoints(element as HTMLElement, scale);

    // Restore original display styles
    noPrintElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplays[index] || '';
    });
    
    // Restore container overflow
    if (container instanceof HTMLElement) {
      container.style.overflow = originalOverflow;
    }
    
    // Remove export class and compact class (if applied)
    element.classList.remove('pdf-export-active');
    if (maxPages && container instanceof HTMLElement) {
      container.classList.remove('pdf-export-compact-1page', 'pdf-export-compact-2pages');
    }

    // Create PDF using pdf-lib (portrait: width < height)
    const pdfDoc = await PDFDocument.create();
    
    const mmToPoints = 2.83465;
    const pdfWidth = pageDimPortrait.width * mmToPoints;
    const pdfHeight = pageDimPortrait.height * mmToPoints;
    const marginPoints = marginMm * mmToPoints;
    const imgWidth = pdfWidth - (marginPoints * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageContentHeight = pdfHeight - (marginPoints * 2);

    const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
    const jpegImage = await pdfDoc.embedJpg(imgBytes);

    if (imgHeight <= pageContentHeight) {
      // Single page
      const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
      page.drawImage(jpegImage, {
        x: marginPoints,
        y: pdfHeight - marginPoints - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });
    } else {
      // Multi-page: split at section boundaries to avoid cutting through experience/education blocks
      let sourceY = 0;
      const pixelsPerPoint = canvas.width / imgWidth;
      const pageContentHeightPx = pageContentHeight * pixelsPerPoint;

      while (sourceY < canvas.height) {
        const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
        const idealEndY = Math.min(sourceY + pageContentHeightPx, canvas.height);

        // Prefer ending at a safe break (bottom of an experience/education/skill block)
        let endY = idealEndY;
        const nextSafeAfter = safeBreakPoints.find((p) => p > sourceY && p <= idealEndY);
        if (nextSafeAfter != null) {
          endY = nextSafeAfter;
        } else {
          const firstSafeAfter = safeBreakPoints.find((p) => p >= idealEndY);
          if (firstSafeAfter != null && firstSafeAfter - idealEndY < pageContentHeightPx * 0.25) {
            endY = firstSafeAfter;
          }
        }

        const sourceHeight = Math.min(endY - sourceY, canvas.height - sourceY);
        const drawHeight = sourceHeight / pixelsPerPoint;

        // Create page canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(sourceHeight);

        const ctx = pageCanvas.getContext('2d', { alpha: false });
        
        if (ctx) {
          // Fill white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', jpegQuality);
        const pageImgBytes = await fetch(pageImgData).then(res => res.arrayBuffer());
        const pageJpegImage = await pdfDoc.embedJpg(pageImgBytes);
        
        page.drawImage(pageJpegImage, {
          x: marginPoints,
          y: pdfHeight - marginPoints - drawHeight,
          width: imgWidth,
          height: drawHeight,
        });

        sourceY += sourceHeight;
      }
    }

    // Remove loading indicator
    document.body.removeChild(loadingDiv);

    let pdfBytes = await pdfDoc.save();

    // Reduce quality if over target size
    if (pdfBytes.length > maxSizeBytes) {
      const qualities = quality === 'standard' ? [0.75, 0.65, 0.55] : [0.62, 0.52];
      for (const q of qualities) {
        const pdfDoc2 = await PDFDocument.create();
        const jpegImage2 = await pdfDoc2.embedJpg(await fetch(canvas.toDataURL('image/jpeg', q)).then(r => r.arrayBuffer()));
      
      if (imgHeight <= pageContentHeight) {
        const page = pdfDoc2.addPage([pdfWidth, pdfHeight]);
        page.drawImage(jpegImage2, {
          x: marginPoints,
          y: pdfHeight - marginPoints - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        // Recreate multi-page with lower quality (same section-aware breaks)
        let sourceY2 = 0;
        const pixelsPerPoint2 = canvas.width / imgWidth;
        const pageContentHeightPx2 = pageContentHeight * pixelsPerPoint2;

        while (sourceY2 < canvas.height) {
          const page = pdfDoc2.addPage([pdfWidth, pdfHeight]);
          const idealEndY2 = Math.min(sourceY2 + pageContentHeightPx2, canvas.height);
          let endY2 = idealEndY2;
          const nextSafe2 = safeBreakPoints.find((p) => p > sourceY2 && p <= idealEndY2);
          if (nextSafe2 != null) endY2 = nextSafe2;
          else {
            const firstSafe2 = safeBreakPoints.find((p) => p >= idealEndY2);
            if (firstSafe2 != null && firstSafe2 - idealEndY2 < pageContentHeightPx2 * 0.25) endY2 = firstSafe2;
          }
          const sourceHeight2 = Math.min(endY2 - sourceY2, canvas.height - sourceY2);
          const drawHeight2 = sourceHeight2 / pixelsPerPoint2;

          const pageCanvas2 = document.createElement('canvas');
          pageCanvas2.width = canvas.width;
          pageCanvas2.height = Math.ceil(sourceHeight2);
          const ctx2 = pageCanvas2.getContext('2d', { alpha: false });
          if (ctx2) {
            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(0, 0, pageCanvas2.width, pageCanvas2.height);
            ctx2.imageSmoothingEnabled = true;
            ctx2.imageSmoothingQuality = 'high';
            ctx2.drawImage(canvas, 0, sourceY2, canvas.width, sourceHeight2, 0, 0, canvas.width, sourceHeight2);
            const pageImgData2 = pageCanvas2.toDataURL('image/jpeg', q);
            const pageJpegImage2 = await pdfDoc2.embedJpg(await fetch(pageImgData2).then(r => r.arrayBuffer()));
            page.drawImage(pageJpegImage2, {
              x: marginPoints,
              y: pdfHeight - marginPoints - drawHeight2,
              width: imgWidth,
              height: drawHeight2,
            });
          }
          sourceY2 += sourceHeight2;
        }
      }
      
        pdfBytes = await pdfDoc2.save();
        if (pdfBytes.length <= maxSizeBytes) break;
      }
      console.log(`PDF size after reduction: ${(pdfBytes.length / 1024 / 1024).toFixed(2)}MB`);
    }
    
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
    console.log(`PDF exported successfully: ${fileSizeMB}MB, ${Math.ceil(imgHeight / pageContentHeight)} pages`);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('PDF export error:', error);
    
    element.closest('.resume-container')?.classList.remove('pdf-export-compact-1page', 'pdf-export-compact-2pages');
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
      document.body.removeChild(loadingDiv);
    }
    
    const usePrint = confirm(
      'PDF export encountered an issue.\n\n' +
      'Would you like to use the browser print dialog instead?\n' +
      '(Select "Save as PDF" in the print destination)'
    );
    
    if (usePrint) {
      printToPdf();
    }
  }
}

/**
 * Browser print dialog - produces smallest file size
 */
export function printToPdf(): void {
  setTimeout(() => {
    window.print();
  }, 100);
}
