'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, FileDown, ZoomIn, ZoomOut } from 'lucide-react';

export interface ExportPdfWizardOptions {
  /** All pages = no compact; 1|2|3 = fit to that many pages */
  pageRange: 'all' | 1 | 2 | 3;
  /** Standard = best quality (larger file); small = ≤2MB */
  quality: 'standard' | 'small';
}

interface ExportPdfDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportPdfWizardOptions) => Promise<void>;
  title?: string;
}

export default function ExportPdfDialog({
  isOpen,
  onClose,
  onExport,
  title = 'Export as PDF',
}: ExportPdfDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pageRange, setPageRange] = useState<ExportPdfWizardOptions['pageRange']>(2);
  const [quality, setQuality] = useState<ExportPdfWizardOptions['quality']>('standard');
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen || !previewRef.current) return;
    const source = document.getElementById('resume-content');
    if (!source) return;
    const clone = source.cloneNode(true) as HTMLElement;
    clone.setAttribute('id', 'resume-content-preview-clone');
    clone.querySelectorAll('.no-print').forEach((el) => (el as HTMLElement).style.setProperty('display', 'none'));
    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(clone);
    return () => {
      if (previewRef.current && clone.parentNode === previewRef.current) {
        previewRef.current.removeChild(clone);
      }
    };
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport({ pageRange, quality });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header – like Word "Export as PDF" */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard options – Word-style sections */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
          {/* Page range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Page range</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 'all'}
                  onChange={() => setPageRange('all')}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">All pages</span>
                <span className="text-xs text-gray-500">(current layout)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 1}
                  onChange={() => setPageRange(1)}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Fit to 1 page</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 2}
                  onChange={() => setPageRange(2)}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Fit to 2 pages</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 3}
                  onChange={() => setPageRange(3)}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Fit to 3 pages</span>
              </label>
            </div>
          </div>

          {/* Optimize for – Word-style "Standard / Minimum size" */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Optimize for</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  checked={quality === 'standard'}
                  onChange={() => setQuality('standard')}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Standard</span>
                <span className="text-xs text-gray-500">(best quality, larger file)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  checked={quality === 'small'}
                  onChange={() => setQuality('small')}
                  className="text-indigo-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Smaller file</span>
                <span className="text-xs text-gray-500">(≤2 MB, good for email)</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview</h3>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 25))}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded border border-gray-300"
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-gray-600 w-10">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 25))}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded border border-gray-300"
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-auto max-h-48 flex justify-center p-2">
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                <div ref={previewRef} style={{ boxShadow: 'none', margin: 0 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer – Export / Cancel like Word */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors"
          >
            {isExporting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <FileDown size={18} />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
