'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLayout } from '@/context/LayoutContext';

const CHECK_INTERVAL_MS = 1200;
const THROTTLE_MS = 400;

/**
 * Hook to prevent page breaks from splitting resume sections
 *
 * Monitors element position vs page breaks and adds marginTop when a section
 * would be split. Throttled and interval relaxed to avoid feedback loops
 * that hang the main thread.
 */
export function usePageBreakPrevention<T extends HTMLElement = HTMLDivElement>(
  enabled: boolean = true
) {
  const elementRef = useRef<T>(null);
  const { pageInfo } = useLayout();
  const [adjustment, setAdjustment] = useState<number>(0);
  const lastAdjustmentRef = useRef<number>(0);
  const lastCheckRef = useRef<number>(0);

  const checkAndAdjust = useCallback(() => {
    const now = Date.now();
    if (now - lastCheckRef.current < THROTTLE_MS) return;
    lastCheckRef.current = now;

    if (!enabled || !elementRef.current || pageInfo.pageBreakPositions.length === 0) {
      if (lastAdjustmentRef.current !== 0) {
        lastAdjustmentRef.current = 0;
        setAdjustment(0);
      }
      return;
    }

    const element = elementRef.current;
    const container = element.closest('#resume-content') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const containerScrollTop = container.scrollTop || 0;
    const elementTop = elementRect.top - containerRect.top + containerScrollTop;
    const elementHeight = elementRect.height;
    const elementBottom = elementTop + elementHeight;

    let next = 0;
    for (const breakPosition of pageInfo.pageBreakPositions) {
      if (elementTop < breakPosition && elementBottom > breakPosition) {
        next = breakPosition - elementTop + 5;
        break;
      }
      const distanceToBreak = breakPosition - elementTop;
      if (distanceToBreak > 0 && distanceToBreak < elementHeight && elementHeight > 30) {
        next = distanceToBreak + 5;
        break;
      }
    }

    if (next !== lastAdjustmentRef.current) {
      lastAdjustmentRef.current = next;
      setAdjustment(next);
    }
  }, [enabled, pageInfo.pageBreakPositions, pageInfo.usableHeight]);

  useEffect(() => {
    if (!enabled) {
      setAdjustment(0);
      lastAdjustmentRef.current = 0;
      return;
    }
    if (!elementRef.current || pageInfo.pageBreakPositions.length === 0) {
      setAdjustment(0);
      lastAdjustmentRef.current = 0;
      return;
    }

    const element = elementRef.current;
    const container = element.closest('#resume-content') as HTMLElement;
    if (!container) return;

    const timer = setTimeout(checkAndAdjust, 200);
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkAndAdjust, 100);
    });
    resizeObserver.observe(element);
    resizeObserver.observe(container);
    const checkInterval = setInterval(checkAndAdjust, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(checkInterval);
      resizeObserver.disconnect();
    };
  }, [enabled, pageInfo.pageBreakPositions, pageInfo.usableHeight, checkAndAdjust]);

  return {
    ref: elementRef,
    style: adjustment > 0 ? { marginTop: `${adjustment}px` } : {},
  };
}
