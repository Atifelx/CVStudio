'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  LayoutSettings,
  DEFAULT_LAYOUT_SETTINGS,
  COMPACT_LAYOUT_SETTINGS,
  ULTRA_COMPACT_SETTINGS,
  BALANCED_LAYOUT_SETTINGS,
  PageSize,
  MarginPreset,
  SpacingPreset,
  LineHeight,
  ContentWidth,
  TargetPages,
  VerticalSpacing,
  FontFamily,
  TemplateType,
  ColorTheme,
  PrintOrientation,
  COLOR_THEMES,
  PAGE_DIMENSIONS,
  MARGIN_VALUES,
} from '@/types/layout';

export interface PageInfo {
  pageCount: number;
  isOverLimit: boolean;
  contentHeight: number;
  pageHeight: number;
  usableHeight: number;
  pageBreakPositions: number[];
}

interface LayoutContextType {
  settings: LayoutSettings;
  
  // Setters
  setFontSize: (size: number) => void;
  setLineHeight: (height: LineHeight) => void;
  setFontFamily: (font: FontFamily) => void;
  setSpacing: (spacing: SpacingPreset) => void;
  setPageSize: (size: PageSize) => void;
  setMargin: (margin: MarginPreset) => void;
  setContentWidth: (width: ContentWidth) => void;
  setVerticalSpacing: (spacing: Partial<VerticalSpacing>) => void;
  setTargetPages: (pages: TargetPages) => void;
  setTemplate: (template: TemplateType) => void;
  setColorTheme: (color: ColorTheme) => void;
  setPrintCompact: (v: boolean) => void;
  setPrintOrientation: (v: PrintOrientation) => void;
  
  // Presets
  resetToDefaults: () => void;
  applyCompactPreset: () => void;
  applyUltraCompactPreset: () => void;
  applyBalancedPreset: () => void;  // NEW: Auto-balance button
  autoFitToPages: (targetPages: 1 | 2 | 3) => void;
  
  // Page info
  pageInfo: PageInfo;
  updatePageCount: (contentHeight: number) => void;
  
  // Preview
  showPageBreaks: boolean;
  setShowPageBreaks: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageCount: 1,
    isOverLimit: false,
    contentHeight: 0,
    pageHeight: 297,
    usableHeight: 247,
    pageBreakPositions: [],
  });
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const autoFitInProgress = useRef(false);

  const getUsableHeightPx = useCallback((s: LayoutSettings) => {
    const pageDim = PAGE_DIMENSIONS[s.pageSize];
    const marginMm = MARGIN_VALUES[s.margin].value;
    const usableHeightMm = pageDim.height - (marginMm * 2);
    return usableHeightMm * 3.78;
  }, []);

  // Individual setters
  const setFontSize = useCallback((fontSize: number) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  }, []);

  const setLineHeight = useCallback((lineHeight: LineHeight) => {
    setSettings((prev) => ({ ...prev, lineHeight }));
  }, []);

  const setFontFamily = useCallback((fontFamily: FontFamily) => {
    setSettings((prev) => ({ ...prev, fontFamily }));
  }, []);

  const setSpacing = useCallback((spacing: SpacingPreset) => {
    setSettings((prev) => ({ ...prev, spacing }));
  }, []);

  const setPageSize = useCallback((pageSize: PageSize) => {
    setSettings((prev) => ({ ...prev, pageSize }));
  }, []);

  const setMargin = useCallback((margin: MarginPreset) => {
    setSettings((prev) => ({ ...prev, margin }));
  }, []);

  const setContentWidth = useCallback((contentWidth: ContentWidth) => {
    setSettings((prev) => ({ ...prev, contentWidth }));
  }, []);

  const setVerticalSpacing = useCallback((spacing: Partial<VerticalSpacing>) => {
    setSettings((prev) => ({
      ...prev,
      verticalSpacing: { ...prev.verticalSpacing, ...spacing },
    }));
  }, []);

  const setTargetPages = useCallback((targetPages: TargetPages) => {
    setSettings((prev) => ({ ...prev, targetPages }));
  }, []);

  const setTemplate = useCallback((template: TemplateType) => {
    setSettings((prev) => ({ ...prev, template }));
  }, []);

  const setColorTheme = useCallback((colorTheme: ColorTheme) => {
    setSettings((prev) => ({ ...prev, colorTheme }));
  }, []);

  const setPrintCompact = useCallback((printCompact: boolean) => {
    setSettings((prev) => ({ ...prev, printCompact }));
  }, []);

  const setPrintOrientation = useCallback((printOrientation: PrintOrientation) => {
    setSettings((prev) => ({ ...prev, printOrientation }));
  }, []);

  // Presets - preserve current template, colorTheme, and print options when applying presets
  const resetToDefaults = useCallback(() => {
    setSettings((prev) => ({
      ...DEFAULT_LAYOUT_SETTINGS,
      template: prev.template,
      colorTheme: prev.colorTheme,
      printCompact: prev.printCompact,
      printOrientation: prev.printOrientation,
    }));
  }, []);

  const applyCompactPreset = useCallback(() => {
    setSettings((prev) => ({
      ...COMPACT_LAYOUT_SETTINGS,
      template: prev.template,
      colorTheme: prev.colorTheme,
      printCompact: prev.printCompact,
      printOrientation: prev.printOrientation,
    }));
  }, []);

  const applyUltraCompactPreset = useCallback(() => {
    setSettings((prev) => ({
      ...ULTRA_COMPACT_SETTINGS,
      template: prev.template,
      colorTheme: prev.colorTheme,
      printCompact: prev.printCompact,
      printOrientation: prev.printOrientation,
    }));
  }, []);

  /**
   * AUTO-BALANCE PRESET
   * Applies professionally proportioned settings that create a clean, 
   * uniform appearance based on industry-standard resume formatting.
   * 
   * This is useful when a user has manually adjusted settings and 
   * wants to return to a balanced, professional look.
   */
  const applyBalancedPreset = useCallback(() => {
    setSettings((prev) => ({
      ...BALANCED_LAYOUT_SETTINGS,
      template: prev.template,
      colorTheme: prev.colorTheme,
      printCompact: prev.printCompact,
      printOrientation: prev.printOrientation,
    }));
  }, []);

  // Auto-fit algorithm
  const autoFitToPages = useCallback((targetPages: 1 | 2 | 3) => {
    if (autoFitInProgress.current) return;
    autoFitInProgress.current = true;

    const currentPageCount = pageInfo.pageCount;
    
    if (currentPageCount <= targetPages) {
      autoFitInProgress.current = false;
      return;
    }

    const reductionNeeded = currentPageCount / targetPages;
    let newSettings: LayoutSettings = { ...settings };

    if (targetPages === 1) {
      newSettings = { ...ULTRA_COMPACT_SETTINGS, targetPages: 1, template: settings.template, colorTheme: settings.colorTheme, printCompact: settings.printCompact, printOrientation: settings.printOrientation };
    } else if (targetPages === 2) {
      if (reductionNeeded > 1.5) {
        newSettings = {
          ...COMPACT_LAYOUT_SETTINGS,
          fontSize: 10,
          lineHeight: 1.1,
          margin: 'narrow',
          verticalSpacing: {
            sectionGap: 8,
            paragraphGap: 3,
            bulletGap: 1,
            headerGap: 4,
            experienceGap: 6,
            headerPadding: 14,
          },
          targetPages: 2,
          template: settings.template,
          colorTheme: settings.colorTheme,
          printCompact: settings.printCompact,
          printOrientation: settings.printOrientation,
        };
      } else {
        newSettings = {
          ...settings,
          fontSize: Math.max(10, settings.fontSize - 1),
          lineHeight: Math.max(1.1, settings.lineHeight - 0.1) as LineHeight,
          spacing: 'compact',
          margin: 'narrow',
          verticalSpacing: {
            sectionGap: 12,
            paragraphGap: 4,
            bulletGap: 2,
            headerGap: 6,
            experienceGap: 10,
            headerPadding: 16,
          },
          targetPages: 2,
        };
      }
    } else {
      newSettings = {
        ...settings,
        fontSize: Math.max(10, settings.fontSize - 1),
        lineHeight: Math.max(1.2, settings.lineHeight - 0.1) as LineHeight,
        spacing: settings.spacing === 'relaxed' ? 'normal' : settings.spacing,
        verticalSpacing: {
          sectionGap: 14,
          paragraphGap: 5,
          bulletGap: 2,
          headerGap: 6,
          experienceGap: 12,
          headerPadding: 18,
        },
        targetPages: 3,
        template: settings.template,
        colorTheme: settings.colorTheme,
        printCompact: settings.printCompact,
        printOrientation: settings.printOrientation,
      };
    }

    setSettings(newSettings);
    
    setTimeout(() => {
      autoFitInProgress.current = false;
    }, 500);
  }, [pageInfo.pageCount, settings]);

  // Page count update – only setState when values actually change to avoid feedback loops
  const prevPageInfoRef = useRef<{ pageCount: number; contentHeight: number; usableHeight: number } | null>(null);
  const updatePageCount = useCallback((contentHeight: number) => {
    const usableHeight = getUsableHeightPx(settings);
    const pageCount = Math.max(1, Math.ceil(contentHeight / usableHeight));
    const prev = prevPageInfoRef.current;
    if (prev && prev.pageCount === pageCount && prev.contentHeight === contentHeight && prev.usableHeight === usableHeight) {
      return;
    }
    prevPageInfoRef.current = { pageCount, contentHeight, usableHeight };

    const pageBreakPositions: number[] = [];
    for (let i = 1; i < pageCount; i++) {
      pageBreakPositions.push(i * usableHeight);
    }

    setPageInfo({
      pageCount,
      isOverLimit: pageCount > 3,
      contentHeight,
      pageHeight: PAGE_DIMENSIONS[settings.pageSize].height,
      usableHeight,
      pageBreakPositions,
    });
  }, [settings, getUsableHeightPx]);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const vs = settings.verticalSpacing;
    
    // Convert points to pixels: 1pt = 1.333px (96dpi / 72dpi)
    // This makes font sizes match MS Word exactly
    const fontSizeInPixels = Math.round(settings.fontSize * 1.333);
    root.style.setProperty('--resume-font-size', `${fontSizeInPixels}px`);
    root.style.setProperty('--resume-line-height', String(settings.lineHeight));
    root.style.setProperty('--resume-font-family', `"${settings.fontFamily}", ${settings.fontFamily.includes(' ') ? settings.fontFamily.split(' ')[0] : settings.fontFamily}, sans-serif`);
    
    root.style.setProperty('--resume-section-gap', `${vs.sectionGap}px`);
    root.style.setProperty('--resume-paragraph-gap', `${vs.paragraphGap}px`);
    root.style.setProperty('--resume-bullet-gap', `${vs.bulletGap}px`);
    root.style.setProperty('--resume-header-gap', `${vs.headerGap}px`);
    root.style.setProperty('--resume-experience-gap', `${vs.experienceGap}px`);
    root.style.setProperty('--resume-header-padding', `${vs.headerPadding}px`);
    
    root.style.setProperty('--resume-section-spacing', `${vs.sectionGap}px`);
    root.style.setProperty('--resume-item-spacing', `${vs.paragraphGap}px`);
    root.style.setProperty('--resume-header-spacing', `${vs.headerGap}px`);
    
    // OPTIMIZED MARGINS: More horizontal space to reduce text wrapping
    // Reduces page length by fitting more text per line
    const isCompact = settings.spacing === 'compact' || 
                      settings.fontSize <= 10 || 
                      vs.sectionGap <= 10;
    
    // Reduced margins for more horizontal content space
    const marginConfig = {
      narrow: '20px',   // Tight margins - max horizontal space
      normal: '32px',   // Reduced normal
      wide: '48px',     // Moderate spacing
    };
    
    // Auto-use narrow margins when in compact mode
    const effectiveMargin = isCompact ? 'narrow' : settings.margin;
    root.style.setProperty('--resume-page-margin', marginConfig[effectiveMargin]);
    root.style.setProperty('--resume-content-width', `${settings.contentWidth}%`);
    
    const usableHeight = getUsableHeightPx(settings);
    root.style.setProperty('--resume-page-height', `${usableHeight}px`);
    
  }, [settings, getUsableHeightPx]);

  // Apply print options to document for browser print dialog
  useEffect(() => {
    const body = document.body;
    if (settings.printCompact) {
      body.classList.add('print-compact');
    } else {
      body.classList.remove('print-compact');
    }
  }, [settings.printCompact]);

  useEffect(() => {
    let el = document.getElementById('cv-studio-print-page-style') as HTMLStyleElement | null;
    if (settings.printOrientation === 'landscape') {
      if (!el) {
        el = document.createElement('style');
        el.id = 'cv-studio-print-page-style';
        document.head.appendChild(el);
      }
      el.textContent = '@media print { @page { size: A4 landscape; margin: 0.4in; } }';
    } else {
      if (el) el.remove();
    }
    return () => {
      const e = document.getElementById('cv-studio-print-page-style');
      if (e) e.remove();
    };
  }, [settings.printOrientation]);

  return (
      <LayoutContext.Provider
      value={{
        settings,
        setFontSize,
        setLineHeight,
        setFontFamily,
        setSpacing,
        setPageSize,
        setMargin,
        setContentWidth,
        setVerticalSpacing,
        setTargetPages,
        setTemplate,
        setColorTheme,
        setPrintCompact,
        setPrintOrientation,
        resetToDefaults,
        applyCompactPreset,
        applyUltraCompactPreset,
        applyBalancedPreset,
        autoFitToPages,
        pageInfo,
        updatePageCount,
        showPageBreaks,
        setShowPageBreaks,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
