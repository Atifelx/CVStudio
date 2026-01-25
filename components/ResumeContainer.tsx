'use client';

import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { useLayout } from '@/context/LayoutContext';

interface ResumeContainerProps {
  children: ReactNode;
  id?: string;
}

const MEASURE_DEBOUNCE_MS = 250;

/**
 * ResumeContainer - Wrapper component that applies layout CSS variables
 * and displays visual page break indicators
 * 
 * This component:
 * 1. Wraps the resume content
 * 2. Applies CSS variables for typography and spacing
 * 3. Measures content height for page calculation
 * 4. Shows visual page break lines for live preview
 * 
 * Measurement is debounced and MutationObserver (characterData) removed
 * to prevent feedback loops that hang the main thread.
 */
export default function ResumeContainer({ children, id = 'resume-content' }: ResumeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings, updatePageCount, pageInfo, showPageBreaks } = useLayout();
  const lastHeightRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureHeight = useCallback(() => {
    if (!containerRef.current) return;
    const height = containerRef.current.scrollHeight;
    if (height === lastHeightRef.current) return;
    lastHeightRef.current = height;
    updatePageCount(height);
  }, [updatePageCount]);

  useEffect(() => {
    const scheduleMeasure = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        measureHeight();
      }, MEASURE_DEBOUNCE_MS);
    };

    const timer = setTimeout(measureHeight, 120);
    window.addEventListener('resize', scheduleMeasure);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver.disconnect();
    };
  }, [measureHeight, settings]);

  return (
    <div className="relative">
      {/* Resume Content */}
      <div
        ref={containerRef}
        id={id}
        className="resume-container"
        style={{
          fontSize: 'var(--resume-font-size, 11px)',
          lineHeight: 'var(--resume-line-height, 1.2)',
        }}
      >
        {children}
      </div>

      {/* Page Break Indicators */}
      {showPageBreaks && pageInfo.pageBreakPositions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none no-print" style={{ zIndex: 10 }}>
          {pageInfo.pageBreakPositions.map((position, index) => (
            <div
              key={index}
              className="page-break-indicator"
              style={{ top: `${position}px` }}
            >
              <div className="page-break-line" />
              <div className="page-break-label">
                Page {index + 1} ends here — Page {index + 2} starts
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Number Labels (on the side) */}
      {showPageBreaks && (
        <div className="absolute left-0 top-0 w-8 h-full pointer-events-none no-print" style={{ marginLeft: '-40px' }}>
          {Array.from({ length: pageInfo.pageCount }, (_, i) => (
            <div
              key={i}
              className="page-number-label"
              style={{
                top: `${i * pageInfo.usableHeight + pageInfo.usableHeight / 2}px`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
