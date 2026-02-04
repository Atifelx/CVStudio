'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Award, Globe, Heart, Users, Trophy, Book, Folder, Briefcase, GripVertical } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import ResumeSection from '@/components/ResumeSection';
import { InputField, TextAreaField } from '@/components/EditSection';
import { CustomSection, CustomSectionType, CUSTOM_SECTION_PRESETS } from '@/types/resume';

const ICONS: Record<string, React.ReactNode> = {
  award: <Award size={16} />,
  globe: <Globe size={16} />,
  heart: <Heart size={16} />,
  users: <Users size={16} />,
  trophy: <Trophy size={16} />,
  book: <Book size={16} />,
  folder: <Folder size={16} />,
  briefcase: <Briefcase size={16} />,
  plus: <Plus size={16} />,
};

/**
 * Custom Sections component - allows users to add fully customizable sections
 * like Certifications, Languages, Hobbies, Awards, etc.
 */
export default function CustomSectionsSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection, editingItemId, setEditingItemId } = useResume();
  const { settings } = useLayout();
  const customSections = resumeData.customSections || [];
  const isClassic = settings.template === 'classic';
  
  const [editData, setEditData] = useState<CustomSection[]>(customSections);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const isEditing = editingSection === 'custom';

  const handleEdit = (sectionId?: string) => {
    setEditData([...(customSections || [])]);
    setEditingSection('custom');
    if (sectionId) setEditingItemId(sectionId);
  };

  const handleSave = () => {
    // Filter out empty sections
    const validSections = editData.filter(s => s.title.trim());
    setResumeData((prev) => ({
      ...prev,
      customSections: validSections,
    }));
    setEditingSection(null);
    setEditingItemId(null);
  };

  const handleCancel = () => {
    setEditData([...(customSections || [])]);
    setEditingSection(null);
    setEditingItemId(null);
  };

  const addSection = (preset: typeof CUSTOM_SECTION_PRESETS[0]) => {
    const newSection: CustomSection = {
      id: `custom-${Date.now()}`,
      title: preset.title === 'Custom Section' ? '' : preset.title,
      contentType: preset.contentType,
      content: '',
      bullets: [''],
      items: [{ label: '', value: '' }],
      order: editData.length,
    };
    setEditData((prev) => [...prev, newSection]);
    setShowAddMenu(false);
    setEditingItemId(newSection.id);
  };

  const removeSection = (id: string) => {
    setEditData((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setEditData((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newData = [...prev];
      [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
      return newData.map((s, i) => ({ ...s, order: i }));
    });
  };

  const updateSection = (id: string, field: keyof CustomSection, value: unknown) => {
    setEditData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addBullet = (sectionId: string) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, bullets: [...s.bullets, ''] } : s
      )
    );
  };

  const updateBullet = (sectionId: string, index: number, value: string) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.map((b, i) => (i === index ? value : b)) }
          : s
      )
    );
  };

  const removeBullet = (sectionId: string, index: number) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  const addItem = (sectionId: string) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, { label: '', value: '' }] }
          : s
      )
    );
  };

  const updateItem = (sectionId: string, index: number, field: 'label' | 'value', value: string) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
              ),
            }
          : s
      )
    );
  };

  const removeItem = (sectionId: string, index: number) => {
    setEditData((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  // Edit mode
  if (isEditing) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
            <h3 className="font-semibold text-blue-800">Edit: Custom Sections</h3>
          </div>
          
          <div className="p-4 bg-white">
            {/* Add Section Menu */}
            <div className="mb-4 relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <Plus size={18} />
                Add Custom Section
              </button>
              
              {showAddMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-72">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Select a section type:</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {CUSTOM_SECTION_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => addSection(preset)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
                      >
                        <span className="text-gray-500">{ICONS[preset.icon]}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{preset.title}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            ({preset.contentType === 'paragraph' ? 'Text' : preset.contentType === 'bullets' ? 'Bullet list' : 'Label-value'})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section List */}
            <div className="space-y-4">
              {editData.map((section, sectionIndex) => (
                <div key={section.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Section {sectionIndex + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={sectionIndex === 0}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={sectionIndex === editData.length - 1}
                        className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Section Title"
                        value={section.title}
                        onChange={(value) => updateSection(section.id, 'title', value)}
                        placeholder="e.g., Certifications, Languages, Hobbies"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                        <select
                          value={section.contentType}
                          onChange={(e) => updateSection(section.id, 'contentType', e.target.value as CustomSectionType)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                        >
                          <option value="paragraph">Paragraph (free text)</option>
                          <option value="bullets">Bullet List</option>
                          <option value="items">Label-Value Pairs</option>
                        </select>
                      </div>
                    </div>

                    {/* Paragraph content */}
                    {section.contentType === 'paragraph' && (
                      <TextAreaField
                        label="Content"
                        value={section.content}
                        onChange={(value) => updateSection(section.id, 'content', value)}
                        rows={3}
                        placeholder="Enter your content here..."
                      />
                    )}

                    {/* Bullets content */}
                    {section.contentType === 'bullets' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bullet Points</label>
                        <div className="space-y-2">
                          {section.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(section.id, idx, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Enter bullet point..."
                              />
                              <button
                                onClick={() => removeBullet(section.id, idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addBullet(section.id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add bullet
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Items content (label-value pairs) */}
                    {section.contentType === 'items' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                        <div className="space-y-2">
                          {section.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateItem(section.id, idx, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Label (e.g., AWS Certified)"
                              />
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => updateItem(section.id, idx, 'value', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Value (e.g., 2024)"
                              />
                              <button
                                onClick={() => removeItem(section.id, idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addItem(section.id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add item
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

  // Empty state - show add button (hidden in PDF/print)
  if (!customSections || customSections.length === 0) {
    return (
      <div className="px-8 no-print" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div 
          onClick={() => handleEdit()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <Plus size={20} className="mx-auto mb-1 text-gray-400" />
          <p className="text-gray-500 font-medium text-sm">Add Custom Section</p>
          <p className="text-xs text-gray-400">Certifications, Languages, Hobbies, Awards...</p>
        </div>
      </div>
    );
  }

  // Normal view - render all custom sections
  return (
    <>
      {customSections.map((section) => (
        <div key={section.id} className="resume-section px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
          <ResumeSection 
            title={isClassic ? section.title : section.title.toUpperCase()} 
            onEdit={() => handleEdit(section.id)}
          >
            {/* Paragraph content */}
            {section.contentType === 'paragraph' && section.content && (
              <p 
                className="text-gray-700"
                style={{ 
                  fontSize: 'var(--resume-font-size)',
                  lineHeight: 'var(--resume-line-height)',
                }}
              >
                {section.content}
              </p>
            )}

            {/* Bullets content */}
            {section.contentType === 'bullets' && section.bullets.filter(b => b.trim()).length > 0 && (
              <ul 
                className="list-disc ml-5 text-gray-700"
                style={{ 
                  fontSize: 'var(--resume-font-size)',
                  lineHeight: 'var(--resume-line-height)',
                }}
              >
                {section.bullets.filter(b => b.trim()).map((bullet, idx) => (
                  <li key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {/* Items content (label-value) */}
            {section.contentType === 'items' && section.items.filter(i => i.label.trim()).length > 0 && (
              <div 
                className="text-gray-700"
                style={{ 
                  fontSize: 'var(--resume-font-size)',
                  lineHeight: 'var(--resume-line-height)',
                }}
              >
                {section.items.filter(i => i.label.trim()).map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }}>
                    <span className="font-semibold">{item.label}</span>
                    {item.value && <span className="text-gray-600"> — {item.value}</span>}
                  </div>
                ))}
              </div>
            )}
          </ResumeSection>
        </div>
      ))}
      
      {/* Add more sections button */}
      <div className="px-8 mt-2 no-print">
        <button
          onClick={() => handleEdit()}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Plus size={12} />
          Add another section
        </button>
      </div>
    </>
  );
}
