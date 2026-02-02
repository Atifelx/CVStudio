import {
  LayoutSettings,
  getPageDimensions,
  MARGIN_VALUES,
} from '@/types/layout';

export interface PageCountResult {
  pageCount: number;
  isOverLimit: boolean;
  contentHeight: number;
  pageHeight: number;
  usableHeight?: number;
}

/**
 * Calculates the estimated page count based on content height and layout settings
 * 
 * This function uses the actual measured content height and compares it to
 * the usable page height (page height minus top and bottom margins)
 * 
 * @param contentHeightPx - The measured height of the resume content in pixels
 * @param settings - Current layout settings
 * @returns PageCountResult with page count and metadata
 */
export function calculatePageCount(
  contentHeightPx: number,
  settings: LayoutSettings
): PageCountResult {
  // Get page dimensions in mm (A4, Letter, or custom)
  const pageDimensions = getPageDimensions(settings);
  const marginMm = MARGIN_VALUES[settings.margin].value;
  
  // Calculate usable height (page height minus top and bottom margins)
  const usableHeightMm = pageDimensions.height - (marginMm * 2);
  
  // Convert mm to px (1mm ≈ 3.78px at 96dpi)
  // However, for on-screen rendering we use a scale factor
  const mmToPx = 3.78;
  const usableHeightPx = usableHeightMm * mmToPx;
  
  // Calculate page count
  const pageCount = Math.ceil(contentHeightPx / usableHeightPx);
  
  return {
    pageCount: Math.max(1, pageCount),
    isOverLimit: pageCount > 3,
    contentHeight: contentHeightPx,
    pageHeight: pageDimensions.height,
    usableHeight: usableHeightPx,
  };
}

/**
 * Estimates content height based on text content and layout settings
 * This is a rough estimation for preview purposes
 * 
 * @param textContent - Plain text content of the resume
 * @param settings - Current layout settings
 * @returns Estimated height in pixels
 */
export function estimateContentHeight(
  textContent: string,
  settings: LayoutSettings
): number {
  // Rough estimation based on character count and layout settings
  const charCount = textContent.length;
  const avgCharsPerLine = 80; // Assuming standard line width
  const estimatedLines = charCount / avgCharsPerLine;
  
  // Line height in pixels
  const lineHeightPx = settings.fontSize * settings.lineHeight;
  
  // Add spacing for sections (rough estimate: 1 section per 500 chars)
  const sectionCount = Math.ceil(charCount / 500);
  const spacingConfig = {
    compact: 16,
    normal: 24,
    relaxed: 32,
  };
  const sectionSpacing = spacingConfig[settings.spacing] * sectionCount;
  
  return (estimatedLines * lineHeightPx) + sectionSpacing;
}

/**
 * Suggests optimal settings to fit content into target page count
 * 
 * @param currentPageCount - Current estimated page count
 * @param targetPageCount - Desired page count (1-3)
 * @param currentSettings - Current layout settings
 * @returns Suggested settings or null if impossible
 */
export function suggestOptimalSettings(
  currentPageCount: number,
  targetPageCount: number,
  currentSettings: LayoutSettings
): LayoutSettings | null {
  if (currentPageCount <= targetPageCount) {
    return currentSettings; // Already fits
  }

  // Calculate reduction ratio needed
  const reductionRatio = targetPageCount / currentPageCount;
  
  // Start with current settings and progressively tighten
  const suggested: LayoutSettings = { ...currentSettings };
  
  // Step 1: Reduce line height
  if (reductionRatio < 0.9 && suggested.lineHeight > 1.1) {
    suggested.lineHeight = 1.1;
  } else if (reductionRatio < 0.95 && suggested.lineHeight > 1.2) {
    suggested.lineHeight = 1.2;
  }
  
  // Step 2: Use compact spacing
  if (reductionRatio < 0.85) {
    suggested.spacing = 'compact';
  }
  
  // Step 3: Reduce font size
  if (reductionRatio < 0.75) {
    suggested.fontSize = Math.max(10, currentSettings.fontSize - 2);
  } else if (reductionRatio < 0.85) {
    suggested.fontSize = Math.max(10, currentSettings.fontSize - 1);
  }
  
  // Step 4: Use narrow margins
  if (reductionRatio < 0.7) {
    suggested.margin = 'narrow';
  }
  
  return suggested;
}

/**
 * Formats page count for display
 * 
 * @param pageCount - Number of pages
 * @returns Formatted string (e.g., "2 pages", "1 page")
 */
export function formatPageCount(pageCount: number): string {
  return pageCount === 1 ? '1 page' : `${pageCount} pages`;
}
