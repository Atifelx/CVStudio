'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { InputField, TextAreaField } from '@/components/EditSection';
import { SkillCategory } from '@/types/resume';

/**
 * Technical Skills section component
 * Supports both modern (blue) and classic (B&W) templates
 */
export default function SkillsSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { settings } = useLayout();
  const { skills, sectionVisibility } = resumeData;
  const isClassic = settings.template === 'classic';
  
  const [editData, setEditData] = useState<SkillCategory[]>(skills);
  const isEditing = editingSection === 'skills';
  const isVisible = sectionVisibility?.skills ?? true;

  const handleEdit = () => {
    // If no skills, start with one empty category
    if (skills.length === 0) {
      setEditData([{
        id: `skill-${Date.now()}`,
        category: '',
        skills: '',
      }]);
    } else {
      setEditData([...skills]);
    }
    setEditingSection('skills');
  };

  const handleSave = () => {
    // Filter out empty categories
    const validSkills = editData.filter(s => s.category.trim() || s.skills.trim());
    setResumeData((prev) => ({
      ...prev,
      skills: validSkills,
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData([...skills]);
    setEditingSection(null);
  };

  const handleDeleteSection = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        skills: false,
      },
    }));
    setEditingSection(null);
  };

  const handleRestore = () => {
    setResumeData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        skills: true,
      },
    }));
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
      category: '',
      skills: '',
    };
    setEditData((prev) => [...prev, newSkill]);
  };

  const removeSkillCategory = (id: string) => {
    setEditData((prev) => prev.filter((skill) => skill.id !== id));
  };

  // Hidden state
  if (!isVisible) {
    return (
      <div className="px-8 py-2 no-print">
        <button
          onClick={handleRestore}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          <span className="text-xs font-medium">Add Skills Section</span>
        </button>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
            <h3 className="font-semibold text-blue-800">Edit: Technical Skills</h3>
            <button
              onClick={handleDeleteSection}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
          
          <div className="p-4 bg-white">
            <div className="space-y-4">
              {editData.map((skill, index) => (
                <div key={skill.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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

  // Empty state
  if (skills.length === 0) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div 
          onClick={handleEdit}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <Plus size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 font-medium">Add Technical Skills</p>
          <p className="text-sm text-gray-400">Click to add your skills</p>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection 
        title={isClassic ? "Skills" : "TECHNICAL SKILLS"} 
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        <div>
          {skills.map((skill, index) => (
            <SkillCategoryEntry
              key={skill.id}
              skill={skill}
              index={index}
              isLast={index === skills.length - 1}
              isClassic={isClassic}
            />
          ))}
        </div>
      </ResumeSection>
    </div>
  );
}

/**
 * Individual skill category component with page break prevention
 * Supports both modern and classic templates
 */
function SkillCategoryEntry({ 
  skill, 
  index, 
  isLast,
  isClassic 
}: { 
  skill: SkillCategory; 
  index: number; 
  isLast: boolean;
  isClassic: boolean;
}) {
  const baseStyle = { 
    marginBottom: !isLast ? 'var(--resume-bullet-gap)' : 0,
    fontSize: 'var(--resume-font-size)',
    lineHeight: 'var(--resume-line-height)'
  };
  
  // Classic template: horizontal layout with dashes between skills
  if (isClassic) {
    const skillList = skill.skills.split('|').map(s => s.trim()).filter(Boolean);
    return (
      <div 
        className="skill-category"
        style={baseStyle}
      >
        <span className="font-semibold text-gray-900">{skill.category}</span>
        <span className="text-gray-500 mx-2">—</span>
        <span className="text-gray-700">{skillList.join(' — ')}</span>
      </div>
    );
  }
  
  return (
    <div 
      className="skill-category"
      style={baseStyle}
    >
      <strong className="text-gray-800">{skill.category}:</strong>
      <span className="text-gray-700"> {skill.skills}</span>
    </div>
  );
}
