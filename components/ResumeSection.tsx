'use client';

import React, { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

interface ResumeSectionProps {
  title?: string;
  children: ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  showEditButton?: boolean;
  className?: string;
}

/**
 * Reusable wrapper component for resume sections
 * Uses CSS variables for header gap spacing
 */
export default function ResumeSection({
  title,
  children,
  onEdit,
  isEditing = false,
  showEditButton = true,
  className = '',
}: ResumeSectionProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Section Header with Edit Button */}
      {title && (
        <div 
          className="flex items-center justify-between border-b-2 border-blue-600"
          style={{ marginBottom: 'var(--resume-header-gap)', paddingBottom: 'calc(var(--resume-header-gap) / 2)' }}
        >
          <h3 
            className="font-bold text-gray-800 flex-1"
            style={{ fontSize: 'calc(var(--resume-font-size) * 1.4)' }}
          >
            {title}
          </h3>
          {showEditButton && onEdit && !isEditing && (
            <button
              onClick={onEdit}
              className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 no-print"
              title={`Edit ${title}`}
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      )}

      {/* Edit button for sections without title (like header) */}
      {!title && showEditButton && onEdit && !isEditing && (
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 no-print z-10"
          title="Edit this section"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* Section Content */}
      {children}
    </div>
  );
}
