'use client';

import React, { ReactNode } from 'react';
import { Save, X } from 'lucide-react';

interface EditSectionProps {
  children: ReactNode;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
}

/**
 * Wrapper component for edit mode
 * Provides consistent Save/Cancel buttons and styling
 */
export default function EditSection({
  children,
  onSave,
  onCancel,
  title,
}: EditSectionProps) {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      {title && (
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          Editing: {title}
        </h4>
      )}
      
      {/* Edit Form Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-blue-200">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save size={18} />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          <X size={18} />
          Cancel
        </button>
      </div>
    </div>
  );
}

// Reusable form field components
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
      />
    </div>
  );
}
