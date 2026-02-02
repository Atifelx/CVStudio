'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, FileDown } from 'lucide-react';

interface ExportPdfDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => Promise<void>;
  title?: string;
}

export default function ExportPdfDialog({
  isOpen,
  onClose,
  onExport,
  title = 'Preview & Export PDF',
}: ExportPdfDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLElement | null>(null);
  const [pageWidth, setPageWidth] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  // Clone resume into preview when dialog opens; remove when closed
  useEffect(() => {
    if (!isOpen || !previewRef.current) return;
    const source = document.getElementById('resume-content');
    if (!source) return;
    const clone = source.cloneNode(true) as HTMLElement;
    clone.setAttribute('id', 'resume-content-preview-clone');
    clone.querySelectorAll('.no-print').forEach((el) => (el as HTMLElement).style.setProperty('display', 'none'));
    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(clone);
    cloneRef.current = clone;
    return () => {
      cloneRef.current = null;
      if (previewRef.current && clone.parentNode === previewRef.current) {
        previewRef.current.removeChild(clone);
      }
    };
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
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
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Page width:</span>
            <input
              type="range"
              min="70"
              max="100"
              value={pageWidth}
              onChange={(e) => setPageWidth(Number(e.target.value))}
              className="w-24 h-2 rounded-lg appearance-none bg-gray-200 accent-indigo-600"
            />
            <span className="text-xs text-gray-500 w-8">{pageWidth}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Zoom:</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-gray-700 w-12">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 25))}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-100 min-h-[320px] flex justify-center">
          <div
            className="bg-white shadow-lg rounded overflow-hidden"
            style={{
              maxWidth: `${pageWidth}%`,
              width: '100%',
            }}
          >
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <div
                ref={previewRef}
                style={{
                  boxShadow: 'none',
                  margin: 0,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
