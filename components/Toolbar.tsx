'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  Loader2,
  Type,
  Layout,
  RotateCcw,
  Minimize2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Target,
  ArrowUpDown,
  User,
  Sparkles,
  Trash2,
  Palette,
  BookOpen,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import { exportToDocx } from '@/utils/exportDocx';
import { exportToPdf, printToPdf } from '@/utils/exportPdf';
import { exportToPdfAts } from '@/utils/exportPdfAts';
import SampleResumeDialog from '@/components/SampleResumeDialog';
import {
  LINE_HEIGHT_OPTIONS,
  FONT_OPTIONS,
  TEMPLATE_OPTIONS,
  COLOR_THEMES,
  SpacingPreset,
  PageSize,
  MarginPreset,
  ContentWidth,
  LineHeight,
  FontFamily,
  TemplateType,
  ColorTheme,
  PrintOrientation,
} from '@/types/layout';

/**
 * Enhanced Toolbar with Auto-Balance button and Template Selector
 */
export default function Toolbar() {
  const { resumeData, resetResume } = useResume();
  const {
    settings,
    setFontSize,
    setLineHeight,
    setFontFamily,
    setSpacing,
    setPageSize,
    setMargin,
    setContentWidth,
    setVerticalSpacing,
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
    showPageBreaks,
    setShowPageBreaks,
  } = useLayout();

  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPdfAts, setIsExportingPdfAts] = useState(false);
  const [showMoreControls, setShowMoreControls] = useState(false);
  const [showSampleResume, setShowSampleResume] = useState(false);

  const baseName = resumeData.header.name.replace(/\s+/g, '_') || 'Resume';

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportToPdf('resume-content', `${baseName}_Resume.pdf`, settings);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportToDocx(resumeData, settings);
    } catch (error) {
      console.error('DOCX export error:', error);
      alert('Failed to export DOCX.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdfAts = async () => {
    setIsExportingPdfAts(true);
    try {
      await exportToPdfAts(resumeData, `${baseName}_Resume_ATS.pdf`, settings);
    } catch (error) {
      console.error('ATS PDF export error:', error);
      alert('Failed to export ATS PDF.');
    } finally {
      setIsExportingPdfAts(false);
    }
  };

  const getPageStatus = () => {
    if (pageInfo.pageCount <= 2) return 'ok';
    if (pageInfo.pageCount === 3) return 'warning';
    return 'danger';
  };

  const vs = settings.verticalSpacing;

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm no-print">
      {/* Main Row */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <span className="text-lg font-bold text-gray-800">CV Studio</span>
          </div>

          {/* Template Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Palette size={14} className="text-gray-500 ml-1" />
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  settings.template === t.value
                    ? t.value === 'modern'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={t.description}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Color Theme Selector (only for modern template) */}
          {settings.template === 'modern' && (
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-500 mr-1">Color:</span>
              {COLOR_THEMES.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setColorTheme(color.value)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    settings.colorTheme === color.value
                      ? 'border-white ring-2 ring-offset-1 ring-gray-400 scale-110'
                      : 'border-gray-300 hover:scale-110 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.primary }}
                  title={color.label}
                />
              ))}
            </div>
          )}

          {/* Sample Resume Button */}
          <button
            onClick={() => setShowSampleResume(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
            title="View sample resume with best practices"
          >
            <BookOpen size={14} />
            Sample
          </button>

          {/* Page Count */}
          <div className={`page-indicator ${getPageStatus()}`}>
            {getPageStatus() === 'ok' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span className="font-bold">{pageInfo.pageCount}</span>
            <span className="text-xs">{pageInfo.pageCount === 1 ? 'page' : 'pages'}</span>
          </div>

          {/* Fit Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <span className="text-xs text-gray-500 px-1"><Target size={12} className="inline" /></span>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => autoFitToPages(p as 1 | 2 | 3)}
                className={`fit-button ${settings.targetPages === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* AUTO-BALANCE BUTTON - NEW */}
          <button
            onClick={applyBalancedPreset}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-xs font-semibold shadow-sm"
            title="Auto-balance all text sizes and spacing to standard CV format"
          >
            <Sparkles size={14} />
            Auto-Balance
          </button>

          {/* Presets */}
          <div className="flex gap-1">
            <button onClick={resetToDefaults} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Reset to defaults">
              <RotateCcw size={12} className="inline mr-1" />Reset
            </button>
            <button onClick={applyCompactPreset} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Compact layout">
              <Minimize2 size={12} className="inline mr-1" />Compact
            </button>
            <button onClick={applyUltraCompactPreset} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded" title="Ultra compact for 1 page">
              Ultra
            </button>
          </div>

          {/* Page Breaks */}
          <button
            onClick={() => setShowPageBreaks(!showPageBreaks)}
            className={`px-2 py-1 text-xs rounded ${showPageBreaks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {showPageBreaks ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
            Breaks
          </button>

          {/* Print settings (affects browser Print → PDF) */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.printCompact !== false}
                onChange={(e) => setPrintCompact(e.target.checked)}
                className="rounded border-gray-300"
              />
              Compact print (1–3 pages)
            </label>
          </div>

          {/* Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={printToPdf}
              title="Best quality · Browser print, then Save as PDF · Sharp vector text"
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium border border-indigo-700"
            >
              <FileDown size={14} />
              Print PDF
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="High-quality PDF (no dialog) · Sharp, print-ready"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-xs font-medium"
            >
              {isExportingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              PDF
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              title="ATS-friendly · Native text · Use for job applications"
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 text-xs font-medium"
            >
              {isExportingDocx ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              DOCX <span className="opacity-80 text-[10px]">ATS</span>
            </button>
            <button
              onClick={handleExportPdfAts}
              disabled={isExportingPdfAts}
              title="Text-based PDF · ATS parses correctly · Good for applications"
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-400 text-xs font-medium"
            >
              {isExportingPdfAts ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              PDF <span className="opacity-80 text-[10px]">ATS</span>
            </button>
            <button
              onClick={() => window.confirm('Clear all resume data? This cannot be undone.') && resetResume()}
              title="Clear stored resume data (persisted in browser). Refresh keeps data until cleared."
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-red-100 hover:text-red-700 text-xs font-medium border border-gray-300"
            >
              <Trash2 size={14} />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* SPACING CONTROLS */}
      <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpDown size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">Vertical Spacing Controls</span>
            <span className="text-xs text-gray-400 ml-2">— Drag sliders to adjust, or click "Auto-Balance" for standard formatting</span>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {/* Header Size */}
            <div className="bg-white rounded-lg p-2 border-2 border-purple-300 shadow-sm">
              <label className="text-xs font-bold text-purple-700 block mb-1 flex items-center gap-1">
                <User size={10} /> Header: {vs.headerPadding}px
              </label>
              <input
                type="range"
                min="8"
                max="40"
                step="2"
                value={vs.headerPadding}
                onChange={(e) => setVerticalSpacing({ headerPadding: Number(e.target.value) })}
                className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Section Gap */}
            <div className="bg-white rounded-lg p-2 border-2 border-blue-300 shadow-sm">
              <label className="text-xs font-bold text-blue-700 block mb-1">
                Sections: {vs.sectionGap}px
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={vs.sectionGap}
                onChange={(e) => setVerticalSpacing({ sectionGap: Number(e.target.value) })}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Experience Gap */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Jobs: {vs.experienceGap}px
              </label>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={vs.experienceGap}
                onChange={(e) => setVerticalSpacing({ experienceGap: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Paragraph Gap */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Paragraphs: {vs.paragraphGap}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={vs.paragraphGap}
                onChange={(e) => setVerticalSpacing({ paragraphGap: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Bullet Gap */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Bullets: {vs.bulletGap}px
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={vs.bulletGap}
                onChange={(e) => setVerticalSpacing({ bulletGap: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Header Gap */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Titles: {vs.headerGap}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={vs.headerGap}
                onChange={(e) => setVerticalSpacing({ headerGap: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* More Controls */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => setShowMoreControls(!showMoreControls)}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            {showMoreControls ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showMoreControls ? 'Hide' : 'Show'} Typography & Page Settings
          </button>

          {showMoreControls && (
            <div className="pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Typography */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Type size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">Typography</span>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 block mb-1">
                    Font Family 
                    {FONT_OPTIONS.find(f => f.value === settings.fontFamily)?.recommended && (
                      <span className="ml-1 text-green-600 text-[10px]">★ Recommended</span>
                    )}
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                    style={{ fontFamily: settings.fontFamily }}
                  >
                    <optgroup label="★ Recommended by Recruiters">
                      {FONT_OPTIONS.filter(f => f.recommended).map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label} - {font.description}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Classic Fonts">
                      {FONT_OPTIONS.filter(f => !f.recommended && ['Times New Roman', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Book Antiqua', 'Palatino'].includes(f.value)).map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label} - {font.description}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Modern Web Fonts">
                      {FONT_OPTIONS.filter(f => !f.recommended && ['Lato', 'Open Sans', 'Roboto', 'Source Sans Pro', 'Montserrat', 'Raleway'].includes(f.value)).map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label} - {font.description}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Size: {settings.fontSize}pt</label>
                    <input
                      type="range" min="8" max="14" step="0.5"
                      value={settings.fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Line Height</label>
                    <select
                      value={settings.lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value) as LineHeight)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      {LINE_HEIGHT_OPTIONS.map((lh) => <option key={lh} value={lh}>{lh}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Spacing</label>
                    <select
                      value={settings.spacing}
                      onChange={(e) => setSpacing(e.target.value as SpacingPreset)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Relaxed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Page Layout */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Layout size={14} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">Page Layout</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Page Size</label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => setPageSize(e.target.value as PageSize)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Margins {(settings.spacing === 'compact' || settings.fontSize <= 10 || vs.sectionGap <= 10) && 
                        <span className="text-green-600 text-[10px]">(auto-narrow)</span>}
                    </label>
                    <select
                      value={settings.margin}
                      onChange={(e) => setMargin(e.target.value as MarginPreset)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="narrow">Narrow (max space)</option>
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Width</label>
                    <select
                      value={settings.contentWidth}
                      onChange={(e) => setContentWidth(Number(e.target.value) as ContentWidth)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value={100}>100%</option>
                      <option value={95}>95%</option>
                      <option value={90}>90%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample Resume Dialog */}
      <SampleResumeDialog 
        isOpen={showSampleResume} 
        onClose={() => setShowSampleResume(false)} 
      />
    </div>
  );
}
