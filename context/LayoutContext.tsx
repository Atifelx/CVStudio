'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { setLayoutSettings as dispatchLayoutSettings } from '@/store/layoutSlice';
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
  getPageDimensions,
  MARGIN_VALUES,
} from '@/types/layout';

export interface PageInfo {
  pageCount: number;
  isOverLimit: boolean;
  contentHeight: number;
  pageHeight: number;
  /** Full usable height per page (px). */
  usableHeight: number;
  /** Usable height minus buffer (used for break positions so content doesn't get cut). */
  effectiveUsableHeight: number;
  /** Buffer in px (lines × lineHeight) left before each page break. */
  pageBreakBufferPx: number;
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
  setCustomPageDimensions: (widthMm: number, heightMm: number) => void;
  setMargin: (margin: MarginPreset) => void;
  setContentWidth: (width: ContentWidth) => void;
  setVerticalSpacing: (spacing: Partial<VerticalSpacing>) => void;
  setTargetPages: (pages: TargetPages) => void;
  setTemplate: (template: TemplateType) => void;
  setColorTheme: (color: ColorTheme) => void;
  setPrintCompact: (v: boolean) => void;
  setPrintOrientation: (v: PrintOrientation) => void;
  setPageBreakBufferLines: (lines: number) => void;
  setSectionStartNewPage: (v: boolean) => void;

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
  const dispatch = useDispatch();
  const persistedSettings = useSelector((state: RootState) => state.layout);
  const settings: LayoutSettings = persistedSettings ?? DEFAULT_LAYOUT_SETTINGS;

  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageCount: 1,
    isOverLimit: false,
    contentHeight: 0,
    pageHeight: 297,
    usableHeight: 247,
    effectiveUsableHeight: 247,
    pageBreakBufferPx: 0,
    pageBreakPositions: [],
  });
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const autoFitInProgress = useRef(false);

  const getUsableHeightPx = useCallback((s: LayoutSettings) => {
    const pageDim = getPageDimensions(s);
    const marginMm = MARGIN_VALUES[s.margin].value;
    const usableHeightMm = pageDim.height - (marginMm * 2);
    return usableHeightMm * 3.78;
  }, []);

  const setFontSize = useCallback((fontSize: number) => dispatch(dispatchLayoutSettings({ fontSize })), [dispatch]);
  const setLineHeight = useCallback((lineHeight: LineHeight) => dispatch(dispatchLayoutSettings({ lineHeight })), [dispatch]);
  const setFontFamily = useCallback((fontFamily: FontFamily) => dispatch(dispatchLayoutSettings({ fontFamily })), [dispatch]);
  const setSpacing = useCallback((spacing: SpacingPreset) => dispatch(dispatchLayoutSettings({ spacing })), [dispatch]);

  const setPageSize = useCallback(
    (pageSize: PageSize) =>
      dispatch(
        dispatchLayoutSettings({
          pageSize,
          ...(pageSize !== 'custom' ? { customPageWidthMm: undefined, customPageHeightMm: undefined } : {}),
        })
      ),
    [dispatch]
  );

  const setCustomPageDimensions = useCallback(
    (widthMm: number, heightMm: number) =>
      dispatch(dispatchLayoutSettings({ pageSize: 'custom', customPageWidthMm: widthMm, customPageHeightMm: heightMm })),
    [dispatch]
  );

  const setMargin = useCallback((margin: MarginPreset) => dispatch(dispatchLayoutSettings({ margin })), [dispatch]);
  const setContentWidth = useCallback((contentWidth: ContentWidth) => dispatch(dispatchLayoutSettings({ contentWidth })), [dispatch]);

  const setVerticalSpacing = useCallback(
    (spacing: Partial<VerticalSpacing>) =>
      dispatch(dispatchLayoutSettings({ verticalSpacing: { ...settings.verticalSpacing, ...spacing } })),
    [dispatch, settings.verticalSpacing]
  );

  const setTargetPages = useCallback((targetPages: TargetPages) => dispatch(dispatchLayoutSettings({ targetPages })), [dispatch]);
  const setTemplate = useCallback((template: TemplateType) => dispatch(dispatchLayoutSettings({ template })), [dispatch]);
  const setColorTheme = useCallback((colorTheme: ColorTheme) => dispatch(dispatchLayoutSettings({ colorTheme })), [dispatch]);
  const setPrintCompact = useCallback((printCompact: boolean) => dispatch(dispatchLayoutSettings({ printCompact })), [dispatch]);
  const setPrintOrientation = useCallback((printOrientation: PrintOrientation) => dispatch(dispatchLayoutSettings({ printOrientation })), [dispatch]);
  const setPageBreakBufferLines = useCallback(
    (lines: number) => dispatch(dispatchLayoutSettings({ pageBreakBufferLines: Math.max(0, Math.min(5, lines)) })),
    [dispatch]
  );
  const setSectionStartNewPage = useCallback(
    (v: boolean) => dispatch(dispatchLayoutSettings({ sectionStartNewPage: v })),
    [dispatch]
  );

  const resetToDefaults = useCallback(() => {
    dispatch(
      dispatchLayoutSettings({
        ...DEFAULT_LAYOUT_SETTINGS,
        template: settings.template,
        colorTheme: settings.colorTheme,
        printCompact: settings.printCompact,
        printOrientation: settings.printOrientation,
      })
    );
  }, [dispatch, settings.template, settings.colorTheme, settings.printCompact, settings.printOrientation]);

  const applyCompactPreset = useCallback(() => {
    dispatch(
      dispatchLayoutSettings({
        ...COMPACT_LAYOUT_SETTINGS,
        template: settings.template,
        colorTheme: settings.colorTheme,
        printCompact: settings.printCompact,
        printOrientation: settings.printOrientation,
      })
    );
  }, [dispatch, settings.template, settings.colorTheme, settings.printCompact, settings.printOrientation]);

  const applyUltraCompactPreset = useCallback(() => {
    dispatch(
      dispatchLayoutSettings({
        ...ULTRA_COMPACT_SETTINGS,
        template: settings.template,
        colorTheme: settings.colorTheme,
        printCompact: settings.printCompact,
        printOrientation: settings.printOrientation,
      })
    );
  }, [dispatch, settings.template, settings.colorTheme, settings.printCompact, settings.printOrientation]);

  const applyBalancedPreset = useCallback(() => {
    dispatch(
      dispatchLayoutSettings({
        ...BALANCED_LAYOUT_SETTINGS,
        template: settings.template,
        colorTheme: settings.colorTheme,
        printCompact: settings.printCompact,
        printOrientation: settings.printOrientation,
      })
    );
  }, [dispatch, settings.template, settings.colorTheme, settings.printCompact, settings.printOrientation]);

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

    dispatch(dispatchLayoutSettings(newSettings));

    setTimeout(() => {
      autoFitInProgress.current = false;
    }, 500);
  }, [dispatch, pageInfo.pageCount, settings]);

  // Page count update – only setState when values actually change to avoid feedback loops
  const prevPageInfoRef = useRef<{ pageCount: number; contentHeight: number; effectiveUsableHeight: number } | null>(null);
  const updatePageCount = useCallback((contentHeight: number) => {
    const usableHeight = getUsableHeightPx(settings);
    const bufferLines = Math.max(0, Math.min(5, settings.pageBreakBufferLines ?? 2));
    const lineHeightPx = settings.fontSize * 1.333 * settings.lineHeight;
    const pageBreakBufferPx = bufferLines * lineHeightPx;
    const effectiveUsableHeight = Math.max(usableHeight * 0.5, usableHeight - pageBreakBufferPx);
    const pageCount = Math.max(1, Math.ceil(contentHeight / effectiveUsableHeight));
    const prev = prevPageInfoRef.current;
    if (prev && prev.pageCount === pageCount && prev.contentHeight === contentHeight && prev.effectiveUsableHeight === effectiveUsableHeight) {
      return;
    }
    prevPageInfoRef.current = { pageCount, contentHeight, effectiveUsableHeight };

    const pageBreakPositions: number[] = [];
    for (let i = 1; i < pageCount; i++) {
      pageBreakPositions.push(i * effectiveUsableHeight);
    }

    setPageInfo({
      pageCount,
      isOverLimit: pageCount > 3,
      contentHeight,
      pageHeight: getPageDimensions(settings).height,
      usableHeight,
      effectiveUsableHeight,
      pageBreakBufferPx,
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
        setCustomPageDimensions,
        setMargin,
        setContentWidth,
        setVerticalSpacing,
        setTargetPages,
        setTemplate,
        setColorTheme,
        setPrintCompact,
        setPrintOrientation,
        setPageBreakBufferLines,
        setSectionStartNewPage,
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
