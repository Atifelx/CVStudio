'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeSection from '@/components/ResumeSection';
import { InputField } from '@/components/EditSection';
import { EducationItem } from '@/types/resume';
import { usePageBreakPrevention } from '@/hooks/usePageBreakPrevention';

/**
 * Education section component
 * 
 * This section is OPTIONAL - users can delete/restore it
 */
export default function EducationSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { education, sectionVisibility } = resumeData;
  
  const [editData, setEditData] = useState<EducationItem[]>(education);
  const isEditing = editingSection === 'education';
  const isVisible = sectionVisibility?.education ?? true;

  const handleEdit = () => {
    setEditData([...education]);
    setEditingSection('education');
  };

  const handleSave = () => {
    setResumeData((prev) => ({
      ...prev,
      education: editData,
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData([...education]);
    setEditingSection(null);
  };

  const handleDeleteSection = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        education: false,
      },
    }));
    setEditingSection(null);
  };

  const handleRestore = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        education: true,
      },
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEditData((prev) =>
      prev.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'Degree Name',
      institution: 'Institution Name',
      location: 'Location',
    };
    setEditData((prev) => [...prev, newEdu]);
  };

  const removeEducation = (id: string) => {
    setEditData((prev) => prev.filter((edu) => edu.id !== id));
  };

  // If section is deleted, show a minimal "Add" button
  if (!isVisible) {
    return (
      <div className="px-8 py-2 no-print">
        <button
          onClick={handleRestore}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          <span className="text-xs font-medium">Add Education Section</span>
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          {/* Header with Delete button */}
          <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
            <h3 className="font-semibold text-blue-800">Edit: Education</h3>
            <button
              onClick={handleDeleteSection}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete Section
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 bg-white">
            <div className="space-y-4">
              {editData.map((edu, index) => (
                <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Education {index + 1}
                    </span>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Remove this education entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <InputField
                        label="Degree"
                        value={edu.degree}
                        onChange={(value) => updateEducation(edu.id, 'degree', value)}
                        placeholder="e.g., B.S. Computer Science"
                      />
                    </div>
                    <InputField
                      label="Institution"
                      value={edu.institution}
                      onChange={(value) => updateEducation(edu.id, 'institution', value)}
                      placeholder="University Name"
                    />
                    <InputField
                      label="Location"
                      value={edu.location}
                      onChange={(value) => updateEducation(edu.id, 'location', value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Education Entry
              </button>
            </div>
            
            {/* Save/Cancel buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection 
        title="EDUCATION" 
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        {education.map((edu, index) => (
          <EducationEntry
            key={edu.id}
            edu={edu}
            index={index}
            isLast={index === education.length - 1}
          />
        ))}
      </ResumeSection>
    </div>
  );
}

/**
 * Individual education entry: single line, no bold for institution (saves space).
 */
function EducationEntry({ 
  edu, 
  index, 
  isLast 
}: { 
  edu: EducationItem; 
  index: number; 
  isLast: boolean;
}) {
  const { ref, style: breakStyle } = usePageBreakPrevention<HTMLDivElement>(true);
  const baseStyle = { marginBottom: !isLast ? 'var(--resume-paragraph-gap)' : 0 };
  const parts = [edu.degree, edu.institution, edu.location].filter(Boolean).join(' | ');

  return (
    <div 
      ref={ref}
      className="education-entry"
      style={{ ...baseStyle, ...breakStyle, fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)' }}
    >
      <p className="text-gray-800" style={{ margin: 0, fontWeight: 400 }}>
        {parts}
      </p>
    </div>
  );
}
