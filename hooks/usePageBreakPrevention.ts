'use client';

import { useEffect, useRef, useState } from 'react';
import { useLayout } from '@/context/LayoutContext';

/**
 * Hook to prevent page breaks from splitting resume sections
 * 
 * This hook:
 * 1. Monitors the element's position relative to page breaks
 * 2. Detects when a section would be split across pages
 * 3. Dynamically adjusts spacing to move the section to the next page
 */
export function usePageBreakPrevention<T extends HTMLElement = HTMLDivElement>(
  enabled: boolean = true
) {
  const elementRef = useRef<T>(null);
  const { pageInfo } = useLayout();
  const [adjustment, setAdjustment] = useState<number>(0);

  useEffect(() => {
    if (!enabled || !elementRef.current || pageInfo.pageBreakPositions.length === 0) {
      setAdjustment(0);
      return;
    }

    const element = elementRef.current;
    const container = element.closest('#resume-content') as HTMLElement;
    if (!container) return;

    const checkAndAdjust = () => {
      // Get element position relative to container using getBoundingClientRect
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate positions relative to container top (accounting for scroll)
      const containerScrollTop = container.scrollTop || 0;
      const elementTop = elementRect.top - containerRect.top + containerScrollTop;
      const elementHeight = elementRect.height;
      const elementBottom = elementTop + elementHeight;

      // Check each page break position
      for (const breakPosition of pageInfo.pageBreakPositions) {
        // If element starts before break but ends after break, it's being split
        if (elementTop < breakPosition && elementBottom > breakPosition) {
          // Calculate how much space needed to push entire section to next page
          const spaceNeeded = breakPosition - elementTop;
          setAdjustment(spaceNeeded + 5); // Add 5px buffer
          return;
        }
        
        // Also check if element is very close to a break (would be split)
        // If element starts just before break and is tall enough to cross it
        const distanceToBreak = breakPosition - elementTop;
        if (distanceToBreak > 0 && distanceToBreak < elementHeight && elementHeight > 30) {
          // Element would be split, push to next page
          setAdjustment(distanceToBreak + 5);
          return;
        }
      }

      // No adjustment needed
      setAdjustment(0);
    };

    // Initial check after a delay to ensure layout is stable
    const timer = setTimeout(checkAndAdjust, 150);

    // Re-check on resize or content changes
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkAndAdjust, 50);
    });
    resizeObserver.observe(element);
    if (container) {
      resizeObserver.observe(container);
    }

    // Also check when page break positions change
    const checkInterval = setInterval(checkAndAdjust, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(checkInterval);
      resizeObserver.disconnect();
    };
  }, [enabled, pageInfo.pageBreakPositions, pageInfo.usableHeight]);

  return {
    ref: elementRef,
    style: adjustment > 0 ? { marginTop: `${adjustment}px` } : {},
  };
}
