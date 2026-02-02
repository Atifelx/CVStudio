'use client';

import React, { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';
import { COLOR_THEMES } from '@/types/layout';

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
 * Supports both modern (with color themes) and classic (B&W) templates
 */
export default function ResumeSection({
  title,
  children,
  onEdit,
  isEditing = false,
  showEditButton = true,
  className = '',
}: ResumeSectionProps) {
  const { settings } = useLayout();
  const isClassic = settings.template === 'classic';
  const colorTheme = COLOR_THEMES.find(c => c.value === settings.colorTheme) || COLOR_THEMES[0];

  return (
    <div className={`relative group ${className}`}>
      {/* Section Header with Edit Button */}
      {title && (
        <div 
          className={`flex items-center justify-between ${
            isClassic 
              ? 'border-b border-gray-400' 
              : `border-b-2`
          }`}
          style={{ 
            marginBottom: 'var(--resume-header-gap)', 
            paddingBottom: 'calc(var(--resume-header-gap) / 2)',
            borderColor: isClassic ? undefined : colorTheme.primary,
          }}
        >
          {/* Classic template: centered title with horizontal lines */}
          {isClassic ? (
            <div className="flex items-center w-full">
              <div className="flex-1 h-px bg-gray-400" />
              <h3 
                className="font-bold text-gray-800 px-4 text-center uppercase tracking-wide"
                style={{ fontSize: 'calc(var(--resume-font-size) * 1.2)' }}
              >
                {title}
              </h3>
              <div className="flex-1 h-px bg-gray-400" />
            </div>
          ) : (
            <h3 
              className="font-bold flex-1"
              style={{ 
                fontSize: 'calc(var(--resume-font-size) * 1.4)',
                color: colorTheme.primary,
              }}
            >
              {title}
            </h3>
          )}
          {showEditButton && onEdit && !isEditing && !isClassic && (
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

      {/* Classic template edit button for titled sections */}
      {title && isClassic && showEditButton && onEdit && !isEditing && (
        <button
          onClick={onEdit}
          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 no-print z-10"
          title={`Edit ${title}`}
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Edit button for sections without title (like header) */}
      {!title && showEditButton && onEdit && !isEditing && (
        <button
          onClick={onEdit}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 no-print z-10 ${
            isClassic 
              ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
              : 'text-white/70 hover:text-white hover:bg-white/20'
          }`}
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
