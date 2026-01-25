import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LayoutSettings, PAGE_DIMENSIONS } from '@/types/layout';

/**
 * High-quality PDF Export
 * 
 * Targets ~300 DPI (print standard, MS Word–like sharpness):
 * - scale 4 × 96 DPI base ≈ 384 DPI equivalent
 * - PNG (lossless), no downstream compression
 * - Fonts loaded, letterRendering, antialiasing
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
    const marginMm = 8; // Tight margins

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
    const scale = Math.min(6, Math.max(5, Math.round(dpr * 2.5)));

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

    // Create PDF with COMPRESSION enabled
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: settings.pageSize === 'a4' ? 'a4' : 'letter',
      compress: true,  // Enable PDF compression
    });

    const pdfWidth = pageDim.width;
    const pdfHeight = pageDim.height;
    const imgWidth = pdfWidth - (marginMm * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageContentHeight = pdfHeight - (marginMm * 2);

    const imgData = canvas.toDataURL('image/png');

    if (imgHeight <= pageContentHeight) {
      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        marginMm,
        imgWidth,
        imgHeight,
        undefined,
        'NONE'
      );
    } else {
      // Multi-page
      let remainingHeight = imgHeight;
      let sourceY = 0;
      let pageNum = 0;
      
      const pixelsPerMm = canvas.width / imgWidth;
      
      while (remainingHeight > 0) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const drawHeight = Math.min(pageContentHeight, remainingHeight);
        const sourceHeight = drawHeight * pixelsPerMm;

        // Create page canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(sourceHeight);

        const ctx = pageCanvas.getContext('2d', { alpha: false });
        
        if (ctx) {
          // Fill white background (prevents transparency issues with JPEG)
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

        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(
          pageImgData,
          'PNG',
          marginMm,
          marginMm,
          imgWidth,
          drawHeight,
          undefined,
          'NONE'
        );

        sourceY += sourceHeight;
        remainingHeight -= drawHeight;
        pageNum++;
      }
    }

    // Remove loading indicator
    document.body.removeChild(loadingDiv);

    // Save the PDF
    pdf.save(filename);
    
    console.log('PDF exported successfully');
    
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
