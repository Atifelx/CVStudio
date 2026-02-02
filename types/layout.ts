// TypeScript types for layout and typography settings

// Resume template types
export type TemplateType = 'modern' | 'classic';

export const TEMPLATE_OPTIONS: Array<{ value: TemplateType; label: string; description: string }> = [
  { value: 'modern', label: 'Modern Blue', description: 'Blue header with gradient, modern styling' },
  { value: 'classic', label: 'Classic B&W', description: 'Traditional black & white, ATS-optimized' },
];

export type PageSize = 'a4' | 'letter';

export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number; name: string }> = {
  a4: { width: 210, height: 297, name: 'A4' },
  letter: { width: 215.9, height: 279.4, name: 'Letter' },
};

export type MarginPreset = 'narrow' | 'normal' | 'wide';

export const MARGIN_VALUES: Record<MarginPreset, { value: number; label: string }> = {
  narrow: { value: 8, label: 'Narrow (0.3")' },    // Tight - max content width
  normal: { value: 12, label: 'Normal (0.5")' },   // Balanced
  wide: { value: 18, label: 'Wide (0.7")' },       // More breathing room
};

export type SpacingPreset = 'compact' | 'normal' | 'relaxed';

export const SPACING_VALUES: Record<SpacingPreset, { section: number; item: number; label: string }> = {
  compact: { section: 12, item: 4, label: 'Compact' },
  normal: { section: 20, item: 8, label: 'Normal' },
  relaxed: { section: 28, item: 12, label: 'Relaxed' },
};

export const LINE_HEIGHT_OPTIONS = [1.0, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5] as const;
export type LineHeight = typeof LINE_HEIGHT_OPTIONS[number];

export type ContentWidth = 100 | 95 | 90 | 85 | 80;

export type TargetPages = 1 | 2 | 3 | null;

export type PrintOrientation = 'portrait' | 'landscape';

// Font families for resume - ATS-friendly and readable
export type FontFamily = 
  | 'Times New Roman'  // Classic, ATS-friendly
  | 'Arial'            // Clean, modern
  | 'Calibri'          // Modern, readable
  | 'Georgia'          // Professional serif
  | 'Garamond'         // Elegant serif
  | 'Helvetica'        // Clean sans-serif
  | 'Lato'             // Modern sans-serif
  | 'Open Sans'        // Readable sans-serif
  | 'Roboto'           // Google font, clean
  | 'Source Sans Pro'; // Professional sans-serif

export const FONT_OPTIONS: Array<{ value: FontFamily; label: string; category: 'serif' | 'sans-serif'; recommended?: boolean; description?: string }> = [
  // Top Recommended (ordered by recruiter preference)
  { value: 'Calibri', label: 'Calibri', category: 'sans-serif', recommended: true, description: 'Most popular - clean & modern' },
  { value: 'Arial', label: 'Arial', category: 'sans-serif', recommended: true, description: 'Universal - works everywhere' },
  { value: 'Helvetica', label: 'Helvetica', category: 'sans-serif', recommended: true, description: 'Premium - executive look' },
  { value: 'Georgia', label: 'Georgia', category: 'serif', recommended: true, description: 'Professional - screen optimized' },
  { value: 'Garamond', label: 'Garamond', category: 'serif', recommended: true, description: 'Elegant - classic executive' },
  // Classic Options
  { value: 'Times New Roman', label: 'Times New Roman', category: 'serif', description: 'Traditional - formal industries' },
  // Modern Web Fonts
  { value: 'Lato', label: 'Lato', category: 'sans-serif', description: 'Modern - warm professional' },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif', description: 'Neutral - highly readable' },
  { value: 'Roboto', label: 'Roboto', category: 'sans-serif', description: 'Google - clean modern' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'sans-serif', description: 'Adobe - professional' },
];

// Color themes for modern template - Rich, professional colors for high-quality resumes
export type ColorTheme = 
  | 'charcoal'   // Rich charcoal gray - most professional
  | 'black'      // Deep black - classic executive
  | 'slate'      // Slate gray - modern professional
  | 'navy'       // Deep navy - corporate
  | 'graphite'   // Graphite - subtle elegance
  | 'steel'      // Steel blue-gray - tech professional
  | 'midnight'   // Midnight blue - sophisticated
  | 'espresso'   // Deep brown - warm executive
  | 'lightgrey'  // Light grey - soft, readable
  | 'lightblue'  // Light blue - soft professional
  | 'silver';    // Silver - neutral light

export const COLOR_THEMES: Array<{ value: ColorTheme; label: string; primary: string; gradient: string; accent: string; light?: boolean; /** Dark color for section titles on white background when light theme */ titleColor?: string }> = [
  // Rich Professional (dark header, white text)
  { value: 'charcoal', label: 'Charcoal', primary: '#2d3748', gradient: 'from-gray-800 to-gray-700', accent: 'gray-700' },
  { value: 'black', label: 'Black', primary: '#1a1a1a', gradient: 'from-black to-gray-900', accent: 'gray-900' },
  { value: 'slate', label: 'Slate', primary: '#475569', gradient: 'from-slate-700 to-slate-600', accent: 'slate-600' },
  { value: 'navy', label: 'Navy', primary: '#1e3a5f', gradient: 'from-slate-900 to-slate-800', accent: 'slate-800' },
  { value: 'graphite', label: 'Graphite', primary: '#374151', gradient: 'from-gray-700 to-gray-600', accent: 'gray-600' },
  { value: 'steel', label: 'Steel', primary: '#334155', gradient: 'from-slate-800 to-slate-700', accent: 'slate-700' },
  { value: 'midnight', label: 'Midnight', primary: '#0f172a', gradient: 'from-slate-950 to-slate-900', accent: 'slate-900' },
  { value: 'espresso', label: 'Espresso', primary: '#292524', gradient: 'from-stone-800 to-stone-700', accent: 'stone-700' },
  // Light colors (light header, dark text) – titleColor = dark for section titles on white
  { value: 'lightgrey', label: 'Light Grey', primary: '#e5e7eb', gradient: 'from-gray-200 to-gray-100', accent: 'gray-500', light: true, titleColor: '#4b5563' },
  { value: 'lightblue', label: 'Light Blue', primary: '#dbeafe', gradient: 'from-blue-100 to-blue-50', accent: 'blue-600', light: true, titleColor: '#2563eb' },
  { value: 'silver', label: 'Silver', primary: '#f1f5f9', gradient: 'from-slate-200 to-slate-100', accent: 'slate-600', light: true, titleColor: '#475569' },
];

export interface VerticalSpacing {
  sectionGap: number;
  paragraphGap: number;
  bulletGap: number;
  headerGap: number;
  experienceGap: number;
  headerPadding: number;
}

export const DEFAULT_VERTICAL_SPACING: VerticalSpacing = {
  sectionGap: 16,
  paragraphGap: 6,
  bulletGap: 3,
  headerGap: 6,
  experienceGap: 12,
  headerPadding: 20,
};

export const COMPACT_VERTICAL_SPACING: VerticalSpacing = {
  sectionGap: 8,
  paragraphGap: 3,
  bulletGap: 1,
  headerGap: 3,
  experienceGap: 6,
  headerPadding: 14,
};

export const ULTRA_COMPACT_SPACING: VerticalSpacing = {
  sectionGap: 4,
  paragraphGap: 2,
  bulletGap: 0,
  headerGap: 2,
  experienceGap: 4,
  headerPadding: 10,
};

export const BALANCED_VERTICAL_SPACING: VerticalSpacing = {
  sectionGap: 14,
  paragraphGap: 5,
  bulletGap: 2,
  headerGap: 5,
  experienceGap: 10,
  headerPadding: 18,
};

export interface LayoutSettings {
  fontSize: number;
  lineHeight: LineHeight;
  fontFamily: FontFamily;
  spacing: SpacingPreset;
  pageSize: PageSize;
  margin: MarginPreset;
  contentWidth: ContentWidth;
  verticalSpacing: VerticalSpacing;
  targetPages: TargetPages;
  template: TemplateType;
  colorTheme: ColorTheme;
  /** Tighter spacing when printing to fit 1–3 pages */
  printCompact: boolean;
  /** Print orientation: portrait (default) or landscape (wide) */
  printOrientation: PrintOrientation;
}

// DEFAULT: Standard resume formatting (11pt like MS Word)
// Font sizes are in POINTS (pt), converted to pixels internally (1pt = 1.333px)
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 11,          // 11pt = ~15px (standard resume body text)
  lineHeight: 1.2,
  fontFamily: 'Calibri', // Modern, readable default
  spacing: 'normal',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: DEFAULT_VERTICAL_SPACING,
  targetPages: null,
  template: 'modern',
  colorTheme: 'charcoal',
  printCompact: true,
  printOrientation: 'portrait',
};

// COMPACT: Smaller text for fitting more content
export const COMPACT_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 10,          // 10pt = ~13px
  lineHeight: 1.15,
  fontFamily: 'Calibri',
  spacing: 'compact',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: COMPACT_VERTICAL_SPACING,
  targetPages: null,
  template: 'modern',
  colorTheme: 'charcoal',
  printCompact: true,
  printOrientation: 'portrait',
};

// ULTRA COMPACT: Maximum density (9pt minimum readable)
export const ULTRA_COMPACT_SETTINGS: LayoutSettings = {
  fontSize: 9,           // 9pt = ~12px (minimum readable)
  lineHeight: 1.1,
  fontFamily: 'Arial',
  spacing: 'compact',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: ULTRA_COMPACT_SPACING,
  targetPages: 1,
  template: 'modern',
  colorTheme: 'charcoal',
  printCompact: true,
  printOrientation: 'portrait',
};

// BALANCED: Professional look (11pt standard)
export const BALANCED_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 11,          // 11pt = ~15px (professional standard)
  lineHeight: 1.2,
  fontFamily: 'Calibri',
  spacing: 'normal',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: BALANCED_VERTICAL_SPACING,
  targetPages: null,
  template: 'modern',
  colorTheme: 'charcoal',
  printCompact: true,
  printOrientation: 'portrait',
};
