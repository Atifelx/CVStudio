'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X, FileUp } from 'lucide-react';
import { parseResumeFile, parseResumeText } from '@/utils/resumeParser';
import { ResumeData } from '@/types/resume';

interface UploadResumeProps {
  onParsed: (data: Partial<ResumeData>) => void;
}

type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';

export default function UploadResume({ onParsed }: UploadResumeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<Partial<ResumeData> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate file type
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      setStatus('error');
      return;
    }

    setFileName(file.name);
    setStatus('parsing');
    setError('');
    setParsedPreview(null);

    try {
      const parsed = await parseResumeFile(file);
      
      // Validate that we got some useful data
      if (!parsed.header?.name && !parsed.summary && 
          (!parsed.experience || parsed.experience.length === 0) &&
          (!parsed.skills || parsed.skills.length === 0)) {
        throw new Error('Could not extract meaningful content from the file.');
      }
      
      setParsedPreview(parsed);
      setStatus('success');
      
    } catch (err) {
      console.error('Parse error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse the resume');
      setStatus('error');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleUseResume = () => {
    if (parsedPreview) {
      onParsed(parsedPreview);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setError('');
    setFileName('');
    setParsedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload a PDF or DOCX file and we'll automatically parse it into an editable format
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area - Only show when idle */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFilePicker}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 bg-white'
            }
          `}
        >
          <div className={`
            w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'}
          `}>
            <FileUp size={40} className={`transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop your resume here!' : 'Drag & drop your resume'}
          </h3>
          <p className="text-gray-500 mb-4">or click to browse files</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <FileText size={14} /> PDF
            </span>
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <FileText size={14} /> DOCX
            </span>
            <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <FileText size={14} /> TXT
            </span>
          </div>
        </div>
      )}

      {/* Processing State */}
      {status === 'parsing' && (
        <div className="border-2 border-blue-200 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Parsing your resume...
          </h3>
          <p className="text-blue-600">{fileName}</p>
          <p className="text-sm text-blue-500 mt-4">
            Extracting text and mapping to resume structure
          </p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="border-2 border-red-200 rounded-2xl p-8 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={28} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Failed to parse resume
              </h3>
              <p className="text-red-600 mb-4 whitespace-pre-line">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={openFilePicker}
                  className="px-5 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-red-200">
            <p className="text-sm font-medium text-red-800 mb-2">💡 Tips for better results:</p>
            <ul className="text-sm text-red-700 space-y-1 ml-4">
              <li>• DOCX files usually work better than PDFs</li>
              <li>• Make sure the PDF has selectable text (not scanned)</li>
              <li>• Try opening the PDF and copying text to verify</li>
            </ul>
          </div>
        </div>
      )}

      {/* Success State with Preview */}
      {status === 'success' && parsedPreview && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-700">
                  Resume parsed successfully!
                </h3>
                <p className="text-green-600">{fileName}</p>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">📋 Parsed Content Preview</h3>
              <p className="text-sm text-gray-500">Review the extracted information before editing</p>
            </div>
            
            <div className="p-6 space-y-5 max-h-[450px] overflow-y-auto">
              {/* Header Info */}
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r-lg">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Header</h4>
                <p className="text-xl font-bold text-gray-800">
                  {parsedPreview.header?.name || <span className="text-gray-400 italic font-normal">Name not found</span>}
                </p>
                <p className="text-gray-600 mt-1">
                  {parsedPreview.header?.title || <span className="text-gray-400 italic">Title not found</span>}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                  {parsedPreview.header?.contact?.email && (
                    <span className="flex items-center gap-1">📧 {parsedPreview.header.contact.email}</span>
                  )}
                  {parsedPreview.header?.contact?.phone && (
                    <span className="flex items-center gap-1">📱 {parsedPreview.header.contact.phone}</span>
                  )}
                  {parsedPreview.header?.contact?.location && (
                    <span className="flex items-center gap-1">📍 {parsedPreview.header.contact.location}</span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {parsedPreview.summary && (
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50 rounded-r-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Professional Summary</h4>
                  <p className="text-gray-600 text-sm line-clamp-3">{parsedPreview.summary}</p>
                </div>
              )}

              {/* Experience */}
              {parsedPreview.experience && parsedPreview.experience.length > 0 && (
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50/50 rounded-r-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                    Experience ({parsedPreview.experience.length} position{parsedPreview.experience.length > 1 ? 's' : ''} found)
                  </h4>
                  <div className="space-y-2">
                    {parsedPreview.experience.slice(0, 3).map((exp, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium text-gray-700">{exp.role || 'Role not found'}</p>
                        <p className="text-gray-500">{exp.company} {exp.period && `• ${exp.period}`}</p>
                      </div>
                    ))}
                  </div>
                  {parsedPreview.experience.length > 3 && (
                    <p className="text-xs text-gray-400 mt-2">+{parsedPreview.experience.length - 3} more...</p>
                  )}
                </div>
              )}

              {/* Skills */}
              {parsedPreview.skills && parsedPreview.skills.length > 0 && (
                <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50 rounded-r-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                    Skills ({parsedPreview.skills.length} categor{parsedPreview.skills.length > 1 ? 'ies' : 'y'} found)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedPreview.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        {skill.category}: {skill.skills.substring(0, 50)}{skill.skills.length > 50 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedPreview.education && parsedPreview.education.length > 0 && (
                <div className="border-l-4 border-teal-500 pl-4 py-2 bg-teal-50/50 rounded-r-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Education</h4>
                  {parsedPreview.education.map((edu, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {edu.degree}
                      {edu.institution && ` • ${edu.institution}`}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Upload Different File
              </button>
              <button
                onClick={handleUseResume}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Use This Resume →
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-amber-800 font-medium">Note</p>
              <p className="text-sm text-amber-700">
                The parser may not capture everything perfectly. You can edit and fill in 
                any missing information in the Editor tab after importing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
