'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { TextAreaField } from '@/components/EditSection';

/**
 * Forward Deployed Expertise section component
 * 
 * This section is OPTIONAL - users can delete/restore it
 * Useful for targeting different roles where this section may not be needed
 */
export default function ExpertiseSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { forwardDeployedExpertise, sectionVisibility } = resumeData;
  
  const [editData, setEditData] = useState(forwardDeployedExpertise);
  const isEditing = editingSection === 'expertise';
  const isVisible = sectionVisibility?.expertise ?? true;

  const handleEdit = () => {
    setEditData(forwardDeployedExpertise);
    setEditingSection('expertise');
  };

  const handleSave = () => {
    setResumeData((prev) => ({
      ...prev,
      forwardDeployedExpertise: editData,
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData(forwardDeployedExpertise);
    setEditingSection(null);
  };

  const handleDelete = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        expertise: false,
      },
    }));
    setEditingSection(null);
  };

  const handleRestore = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        expertise: true,
      },
    }));
  };

  // If section is deleted, show a minimal "Add" button
  if (!isVisible) {
    return (
      <div className="px-8 pb-4 no-print">
        <button
          onClick={handleRestore}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Forward Deployed Expertise Section</span>
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="px-8 pb-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          {/* Header with Delete button */}
          <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
            <h3 className="font-semibold text-blue-800">Edit: Forward Deployed Engineering Expertise</h3>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete Section
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 bg-white">
            <TextAreaField
              label="Expertise Statement"
              value={editData}
              onChange={setEditData}
              rows={8}
              placeholder="Write your expertise statement..."
            />
            
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
    <div className="px-8 pb-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection 
        title="FORWARD DEPLOYED ENGINEERING EXPERTISE" 
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        <p className="text-gray-700" style={{ 
          fontSize: 'var(--resume-font-size)',
          lineHeight: 'var(--resume-line-height)',
          marginBottom: 0
        }}>
          {forwardDeployedExpertise}
        </p>
      </ResumeSection>
    </div>
  );
}
