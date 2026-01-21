'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { parseResumeText, parseDocxFile, parsePdfFile } from '@/utils/resumeParser';
import { ResumeData } from '@/types/resume';

interface UploadResumeProps {
  onParsed: (data: Partial<ResumeData>) => void;
}

type ParseStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error';

export default function UploadResume({ onParsed }: UploadResumeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<Partial<ResumeData> | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX file');
      setStatus('error');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setError('');

    try {
      setStatus('parsing');
      
      let text = '';
      
      if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
        text = await parseDocxFile(file);
      } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        text = await parsePdfFile(file);
      } else {
        throw new Error('Unsupported file format');
      }

      if (!text || text.trim().length < 50) {
        throw new Error('Could not extract text from the file. Please try a different file.');
      }

      const parsed = parseResumeText(text);
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
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload a PDF or DOCX file and we'll automatically parse it into an editable format
        </p>
      </div>

      {/* Upload Area */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className={`
            w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <Upload size={36} className={isDragging ? 'text-blue-600' : 'text-gray-400'} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
          </h3>
          <p className="text-gray-500 mb-4">or click to browse</p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <FileText size={16} /> PDF
            </span>
            <span className="flex items-center gap-1">
              <FileText size={16} /> DOCX
            </span>
          </div>
        </div>
      )}

      {/* Processing State */}
      {(status === 'uploading' || status === 'parsing') && (
        <div className="border-2 border-blue-200 rounded-xl p-12 text-center bg-blue-50">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 size={36} className="text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            {status === 'uploading' ? 'Uploading...' : 'Parsing your resume...'}
          </h3>
          <p className="text-blue-600">{fileName}</p>
          <p className="text-sm text-blue-500 mt-2">
            Extracting text and mapping to resume structure
          </p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="border-2 border-red-200 rounded-xl p-8 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700 mb-1">
                Failed to parse resume
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State with Preview */}
      {status === 'success' && parsedPreview && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-700">
                  Resume parsed successfully!
                </h3>
                <p className="text-green-600">{fileName}</p>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Parsed Content Preview</h3>
              <p className="text-sm text-gray-500">Review the extracted information before editing</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Header Info */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-700 mb-2">Header</h4>
                <p className="text-lg font-bold text-gray-800">
                  {parsedPreview.header?.name || <span className="text-gray-400 italic">Name not found</span>}
                </p>
                <p className="text-gray-600">
                  {parsedPreview.header?.title || <span className="text-gray-400 italic">Title not found</span>}
                </p>
                <div className="text-sm text-gray-500 mt-1">
                  {parsedPreview.header?.contact?.email && <span className="mr-3">📧 {parsedPreview.header.contact.email}</span>}
                  {parsedPreview.header?.contact?.phone && <span className="mr-3">📱 {parsedPreview.header.contact.phone}</span>}
                </div>
              </div>

              {/* Summary */}
              {parsedPreview.summary && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Professional Summary</h4>
                  <p className="text-gray-600 text-sm line-clamp-3">{parsedPreview.summary}</p>
                </div>
              )}

              {/* Experience */}
              {parsedPreview.experience && parsedPreview.experience.length > 0 && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Experience ({parsedPreview.experience.length} positions found)
                  </h4>
                  {parsedPreview.experience.slice(0, 2).map((exp, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-medium text-gray-700">{exp.role}</p>
                      <p className="text-sm text-gray-500">{exp.company} {exp.period && `• ${exp.period}`}</p>
                    </div>
                  ))}
                  {parsedPreview.experience.length > 2 && (
                    <p className="text-sm text-gray-400">+{parsedPreview.experience.length - 2} more...</p>
                  )}
                </div>
              )}

              {/* Skills */}
              {parsedPreview.skills && parsedPreview.skills.length > 0 && (
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Skills ({parsedPreview.skills.length} categories found)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedPreview.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        {skill.category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedPreview.education && parsedPreview.education.length > 0 && (
                <div className="border-l-4 border-teal-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Education</h4>
                  {parsedPreview.education.map((edu, i) => (
                    <p key={i} className="text-sm text-gray-600">{edu.degree} - {edu.institution}</p>
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
                Upload Different File
              </button>
              <button
                onClick={handleUseResume}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Use This Resume →
              </button>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The parser may not capture everything perfectly. 
              You can edit and fill in any missing information in the Editor tab after importing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
