// TypeScript types for layout and typography settings

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

export const LINE_HEIGHT_OPTIONS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5] as const;
export type LineHeight = typeof LINE_HEIGHT_OPTIONS[number];

export type ContentWidth = 100 | 95 | 90 | 85 | 80;

export type TargetPages = 1 | 2 | 3 | null;

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
  spacing: SpacingPreset;
  pageSize: PageSize;
  margin: MarginPreset;
  contentWidth: ContentWidth;
  verticalSpacing: VerticalSpacing;
  targetPages: TargetPages;
}

// DEFAULT: Standard resume formatting (11pt like MS Word)
// Font sizes are in POINTS (pt), converted to pixels internally (1pt = 1.333px)
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 11,          // 11pt = ~15px (standard resume body text)
  lineHeight: 1.2,
  spacing: 'normal',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: DEFAULT_VERTICAL_SPACING,
  targetPages: null,
};

// COMPACT: Smaller text for fitting more content
export const COMPACT_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 10,          // 10pt = ~13px
  lineHeight: 1.15,
  spacing: 'compact',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: COMPACT_VERTICAL_SPACING,
  targetPages: null,
};

// ULTRA COMPACT: Maximum density (9pt minimum readable)
export const ULTRA_COMPACT_SETTINGS: LayoutSettings = {
  fontSize: 9,           // 9pt = ~12px (minimum readable)
  lineHeight: 1.1,
  spacing: 'compact',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: ULTRA_COMPACT_SPACING,
  targetPages: 1,
};

// BALANCED: Professional look (11pt standard)
export const BALANCED_LAYOUT_SETTINGS: LayoutSettings = {
  fontSize: 11,          // 11pt = ~15px (professional standard)
  lineHeight: 1.2,
  spacing: 'normal',
  pageSize: 'a4',
  margin: 'narrow',
  contentWidth: 100,
  verticalSpacing: BALANCED_VERTICAL_SPACING,
  targetPages: null,
};
