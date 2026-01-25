import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import { LayoutSettings, PAGE_DIMENSIONS } from '@/types/layout';

/**
 * High-quality PDF Export (no print dialog)
 *
 * Maximizes sharpness to approach Print → PDF quality:
 * - scale 8–10 × for ~768–960 DPI equivalent (then scaled down into PDF)
 * - PNG lossless, no compression in jsPDF
 * - Fonts loaded, export-friendly CSS, high imageSmoothingQuality
 */
export async function exportToPdf(
  elementId: string,
  filename: string,
  layoutSettings?: LayoutSettings
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
  };

  try {
    const pageDim = PAGE_DIMENSIONS[settings.pageSize];
    const marginMm = 5; // Minimal margins – use full page width (DOCX-like)

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

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const scale = Math.min(10, Math.max(8, Math.round(dpr * 3)));

    element.classList.add('pdf-export-active');
    const container = element.closest('.resume-container') || element;
    const originalOverflow = container instanceof HTMLElement ? container.style.overflow : '';
    if (container instanceof HTMLElement) container.style.overflow = 'visible';

    const noPrintElements = element.querySelectorAll('.no-print');
    const originalDisplays: (string | null)[] = [];
    noPrintElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalDisplays.push(htmlEl.style.display);
      htmlEl.style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
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

    // Restore original display styles
    noPrintElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplays[index] || '';
    });
    
    // Restore container overflow
    if (container instanceof HTMLElement) {
      container.style.overflow = originalOverflow;
    }
    
    // Remove export class
    element.classList.remove('pdf-export-active');

    // Create PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    
    // Convert mm to points (1 mm = 2.83465 points)
    const mmToPoints = 2.83465;
    const pdfWidth = pageDim.width * mmToPoints;
    const pdfHeight = pageDim.height * mmToPoints;
    const marginPoints = marginMm * mmToPoints;
    const imgWidth = pdfWidth - (marginPoints * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageContentHeight = pdfHeight - (marginPoints * 2);

    // Convert canvas to PNG image data
    const imgData = canvas.toDataURL('image/png');
    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(imgBytes);

    if (imgHeight <= pageContentHeight) {
      // Single page
      const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
      page.drawImage(pngImage, {
        x: marginPoints,
        y: pdfHeight - marginPoints - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });
    } else {
      // Multi-page
      let remainingHeight = imgHeight;
      let sourceY = 0;
      let pageNum = 0;
      
      const pixelsPerPoint = canvas.width / imgWidth;
      
      while (remainingHeight > 0) {
        const page = pdfDoc.addPage([pdfWidth, pdfHeight]);
        
        const drawHeight = Math.min(pageContentHeight, remainingHeight);
        const sourceHeight = drawHeight * pixelsPerPoint;

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

        // Embed page image
        const pageImgData = pageCanvas.toDataURL('image/png');
        const pageImgBytes = await fetch(pageImgData).then(res => res.arrayBuffer());
        const pagePngImage = await pdfDoc.embedPng(pageImgBytes);
        
        page.drawImage(pagePngImage, {
          x: marginPoints,
          y: pdfHeight - marginPoints - drawHeight,
          width: imgWidth,
          height: drawHeight,
        });

        sourceY += sourceHeight;
        remainingHeight -= drawHeight;
        pageNum++;
      }
    }

    // Remove loading indicator
    document.body.removeChild(loadingDiv);

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('PDF exported successfully with pdf-lib');
    
  } catch (error) {
    console.error('PDF export error:', error);
    
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
