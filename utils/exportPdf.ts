import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
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

    // Calculate scale - reduce for smaller file size (target < 3MB)
    // Lower scale = smaller file size but still good quality
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    // Use scale 4-5 instead of 8-10 to reduce file size while maintaining quality
    const scale = Math.min(5, Math.max(4, Math.round(dpr * 2)));

    element.classList.add('pdf-export-active');
    const container = element.closest('.resume-container') || element;
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

    // Convert canvas to JPEG image data (smaller file size than PNG)
    // Use JPEG quality 0.85 for good quality but smaller size
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
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

        // Embed page image with compression (JPEG for smaller size)
        // Use JPEG with quality 0.85 to reduce file size while maintaining quality
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
        const pageImgBytes = await fetch(pageImgData).then(res => res.arrayBuffer());
        const pageJpegImage = await pdfDoc.embedJpg(pageImgBytes);
        
        page.drawImage(pageJpegImage, {
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
    let pdfBytes = await pdfDoc.save();
    const maxSizeBytes = 3 * 1024 * 1024; // 3MB
    
    // Check file size and reduce quality if needed
    if (pdfBytes.length > maxSizeBytes) {
      console.log(`PDF size ${(pdfBytes.length / 1024 / 1024).toFixed(2)}MB exceeds 3MB, reducing quality...`);
      
      // Recreate with lower quality JPEG (0.75 instead of 0.85)
      const pdfDoc2 = await PDFDocument.create();
      const jpegImage2 = await pdfDoc2.embedJpg(await fetch(canvas.toDataURL('image/jpeg', 0.75)).then(r => r.arrayBuffer()));
      
      if (imgHeight <= pageContentHeight) {
        const page = pdfDoc2.addPage([pdfWidth, pdfHeight]);
        page.drawImage(jpegImage2, {
          x: marginPoints,
          y: pdfHeight - marginPoints - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        // Recreate multi-page with lower quality
        let remainingHeight2 = imgHeight;
        let sourceY2 = 0;
        const pixelsPerPoint2 = canvas.width / imgWidth;
        
        while (remainingHeight2 > 0) {
          const page = pdfDoc2.addPage([pdfWidth, pdfHeight]);
          const drawHeight2 = Math.min(pageContentHeight, remainingHeight2);
          const sourceHeight2 = drawHeight2 * pixelsPerPoint2;
          
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
            
            const pageImgData2 = pageCanvas2.toDataURL('image/jpeg', 0.75);
            const pageJpegImage2 = await pdfDoc2.embedJpg(await fetch(pageImgData2).then(r => r.arrayBuffer()));
            page.drawImage(pageJpegImage2, {
              x: marginPoints,
              y: pdfHeight - marginPoints - drawHeight2,
              width: imgWidth,
              height: drawHeight2,
            });
          }
          
          sourceY2 += sourceHeight2;
          remainingHeight2 -= drawHeight2;
        }
      }
      
      pdfBytes = await pdfDoc2.save();
      console.log(`Reduced PDF size to ${(pdfBytes.length / 1024 / 1024).toFixed(2)}MB`);
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
