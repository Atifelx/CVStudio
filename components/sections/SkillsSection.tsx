'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { InputField, TextAreaField } from '@/components/EditSection';
import { SkillCategory } from '@/types/resume';

/**
 * Technical Skills section component
 * Uses CSS variables for spacing that responds to toolbar controls
 */
export default function SkillsSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { skills } = resumeData;
  
  const [editData, setEditData] = useState<SkillCategory[]>(skills);
  const isEditing = editingSection === 'skills';

  const handleEdit = () => {
    setEditData([...skills]);
    setEditingSection('skills');
  };

  const handleSave = () => {
    setResumeData((prev) => ({
      ...prev,
      skills: editData,
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData([...skills]);
    setEditingSection(null);
  };

  const updateSkill = (id: string, field: keyof SkillCategory, value: string) => {
    setEditData((prev) =>
      prev.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const addSkillCategory = () => {
    const newSkill: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: 'New Category',
      skills: '',
    };
    setEditData((prev) => [...prev, newSkill]);
  };

  const removeSkillCategory = (id: string) => {
    setEditData((prev) => prev.filter((skill) => skill.id !== id));
  };

  if (isEditing) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <EditSection onSave={handleSave} onCancel={handleCancel} title="Technical Skills">
          <div className="space-y-4">
            {editData.map((skill, index) => (
              <div key={skill.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    Category {index + 1}
                  </span>
                  <button
                    onClick={() => removeSkillCategory(skill.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Remove category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <InputField
                    label="Category Name"
                    value={skill.category}
                    onChange={(value) => updateSkill(skill.id, 'category', value)}
                    placeholder="e.g., Programming Languages"
                  />
                  <TextAreaField
                    label="Skills (separate with | )"
                    value={skill.skills}
                    onChange={(value) => updateSkill(skill.id, 'skills', value)}
                    placeholder="Python | JavaScript | TypeScript | Go"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addSkillCategory}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Skill Category
            </button>
          </div>
        </EditSection>
      </div>
    );
  }

  return (
    <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection 
        title="TECHNICAL SKILLS" 
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        <div>
          {skills.map((skill, index) => (
            <div 
              key={skill.id} 
              className="skill-category"
              style={{ 
                marginBottom: index < skills.length - 1 ? 'var(--resume-bullet-gap)' : 0,
                fontSize: 'var(--resume-font-size)',
                lineHeight: 'var(--resume-line-height)'
              }}
            >
              <strong className="text-gray-800">{skill.category}:</strong>
              <span className="text-gray-700"> {skill.skills}</span>
            </div>
          ))}
        </div>
      </ResumeSection>
    </div>
  );
}
