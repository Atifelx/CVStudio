'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeSection from '@/components/ResumeSection';
import { InputField, TextAreaField } from '@/components/EditSection';
import { GeneralSectionItem } from '@/types/resume';

/**
 * General Sections – optional custom blocks with Title + Summary.
 * Replaces "Forward Deployed Expertise"; any user can add generic details.
 */
export default function ExpertiseSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { generalSections, sectionVisibility } = resumeData;

  const [editData, setEditData] = useState<GeneralSectionItem[]>(generalSections);
  const isEditing = editingSection === 'expertise';
  const isVisible = sectionVisibility?.expertise ?? true;

  const handleEdit = () => {
    setEditData(generalSections.length ? [...generalSections] : []);
    setEditingSection('expertise');
  };

  const handleSave = () => {
    const valid = editData.filter((s) => s.title.trim() || s.summary.trim());
    setResumeData((prev) => ({
      ...prev,
      generalSections: valid.map((s) => ({
        ...s,
        title: s.title.trim(),
        summary: s.summary.trim(),
      })),
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData(generalSections.length ? [...generalSections] : []);
    setEditingSection(null);
  };

  const handleDelete = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: { ...prev.sectionVisibility, expertise: false },
      generalSections: [],
    }));
    setEditingSection(null);
  };

  const handleRestore = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: { ...prev.sectionVisibility, expertise: true },
    }));
    setEditData([{ id: `gen-${Date.now()}`, title: '', summary: '' }]);
    setEditingSection('expertise');
  };

  const addSection = () => {
    setEditData((prev) => [
      ...prev,
      { id: `gen-${Date.now()}`, title: '', summary: '' },
    ]);
  };

  const removeSection = (id: string) => {
    setEditData((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, field: 'title' | 'summary', value: string) => {
    setEditData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  if (!isVisible) {
    return (
      <div className="px-8 pb-4 no-print">
        <button
          onClick={handleRestore}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add General Section</span>
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="px-8 pb-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
            <h3 className="font-semibold text-blue-800">Edit: General Sections</h3>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete Section
            </button>
          </div>
          <div className="p-4 bg-white space-y-4">
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add General Section
            </button>
            {editData.map((s, idx) => (
              <div key={s.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-500">Section {idx + 1}</span>
                  <button
                    onClick={() => removeSection(s.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Remove this section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <InputField
                    label="Title"
                    value={s.title}
                    onChange={(v) => updateSection(s.id, 'title', v)}
                    placeholder="e.g., Certifications, Projects, Publications"
                  />
                  <TextAreaField
                    label="Summary"
                    value={s.summary}
                    onChange={(v) => updateSection(s.id, 'summary', v)}
                    rows={4}
                    placeholder="Add details..."
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
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

  if (!generalSections.length || generalSections.every((s) => !s.title.trim() && !s.summary.trim())) {
    return null;
  }

  return (
    <div className="px-8 pb-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection title="GENERAL SECTIONS" onEdit={handleEdit} isEditing={isEditing}>
        {generalSections
          .filter((s) => s.title.trim() || s.summary.trim())
          .map((s) => (
            <div
              key={s.id}
              className="general-section-entry"
              style={{
                marginBottom: 'var(--resume-paragraph-gap)',
                fontSize: 'var(--resume-font-size)',
                lineHeight: 'var(--resume-line-height)',
              }}
            >
              {s.title && (
                <h4
                  className="font-bold text-gray-800"
                  style={{
                    fontSize: 'calc(var(--resume-font-size) * 1.1)',
                    marginBottom: 'var(--resume-bullet-gap)',
                  }}
                >
                  {s.title}
                </h4>
              )}
              {s.summary && (
                <p className="text-gray-700" style={{ marginBottom: 0 }}>{s.summary}</p>
              )}
            </div>
          ))}
      </ResumeSection>
    </div>
  );
}
