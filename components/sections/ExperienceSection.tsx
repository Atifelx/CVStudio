'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { InputField, TextAreaField } from '@/components/EditSection';
import { ExperienceItem } from '@/types/resume';

/**
 * Professional Experience section component
 * Supports both modern (blue) and classic (B&W) templates
 */
export default function ExperienceSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection, editingItemId, setEditingItemId } = useResume();
  const { settings } = useLayout();
  const { experience } = resumeData;
  const isClassic = settings.template === 'classic';
  
  const [editData, setEditData] = useState<ExperienceItem[]>(experience);
  const isEditing = editingSection === 'experience';

  const handleEdit = () => {
    // If no experience, start with one empty entry
    if (experience.length === 0) {
      setEditData([{
        id: `exp-${Date.now()}`,
        role: '',
        company: '',
        period: '',
        description: '',
        bullets: [''],
      }]);
    } else {
      setEditData(JSON.parse(JSON.stringify(experience)));
    }
    setEditingSection('experience');
  };

  const handleSave = () => {
    // Filter out empty experiences
    const validExperiences = editData.filter(exp => exp.role.trim() || exp.company.trim());
    // Also filter out empty bullets
    const cleanedExperiences = validExperiences.map(exp => ({
      ...exp,
      bullets: exp.bullets.filter(b => b.trim()),
      achievements: (exp.achievements || []).filter(a => a.trim()),
    }));
    
    setResumeData((prev) => ({
      ...prev,
      experience: cleanedExperiences,
    }));
    setEditingSection(null);
    setEditingItemId(null);
  };

  const handleCancel = () => {
    setEditData(JSON.parse(JSON.stringify(experience)));
    setEditingSection(null);
    setEditingItemId(null);
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string | string[]) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      period: '',
      description: '',
      bullets: [''],
    };
    // Add to bottom (end of array) instead of top
    setEditData((prev) => [...prev, newExp]);
    setEditingItemId(newExp.id);
  };

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    setEditData((prev) => {
      const index = prev.findIndex((exp) => exp.id === id);
      if (index === -1) return prev;
      
      if (direction === 'up' && index === 0) return prev; // Already at top
      if (direction === 'down' && index === prev.length - 1) return prev; // Already at bottom
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newData = [...prev];
      [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
      return newData;
    });
  };

  const removeExperience = (id: string) => {
    setEditData((prev) => prev.filter((exp) => exp.id !== id));
  };

  const addBullet = (expId: string) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      )
    );
  };

  const updateBullet = (expId: string, index: number, value: string) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.map((b, i) => (i === index ? value : b)) }
          : exp
      )
    );
  };

  const removeBullet = (expId: string, index: number) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== index) } : exp
      )
    );
  };

  const addAchievement = (expId: string) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId ? { ...exp, achievements: [...(exp.achievements || []), ''] } : exp
      )
    );
  };

  const updateAchievement = (expId: string, index: number, value: string) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? { ...exp, achievements: (exp.achievements || []).map((a, i) => (i === index ? value : a)) }
          : exp
      )
    );
  };

  const removeAchievement = (expId: string, index: number) => {
    setEditData((prev) =>
      prev.map((exp) =>
        exp.id === expId ? { ...exp, achievements: (exp.achievements || []).filter((_, i) => i !== index) } : exp
      )
    );
  };

  // Edit mode
  if (isEditing) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <EditSection onSave={handleSave} onCancel={handleCancel} title="Professional Experience">
          <div className="space-y-6">
            <button
              onClick={addExperience}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Experience
            </button>

            {editData.map((exp, expIndex) => (
              <div key={exp.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Position {expIndex + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveExperience(exp.id, 'up')}
                      disabled={expIndex === 0}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveExperience(exp.id, 'down')}
                      disabled={expIndex === editData.length - 1}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Job Title" 
                    value={exp.role} 
                    onChange={(value) => updateExperience(exp.id, 'role', value)} 
                    placeholder="e.g., Software Engineer"
                  />
                  <InputField 
                    label="Period" 
                    value={exp.period} 
                    onChange={(value) => updateExperience(exp.id, 'period', value)} 
                    placeholder="e.g., Jan 2022 – Present"
                  />
                  <div className="md:col-span-2">
                    <InputField 
                      label="Company" 
                      value={exp.company} 
                      onChange={(value) => updateExperience(exp.id, 'company', value)} 
                      placeholder="e.g., Google"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputField 
                      label="Client Note (optional)" 
                      value={exp.clientNote || ''} 
                      onChange={(value) => updateExperience(exp.id, 'clientNote', value)} 
                      placeholder="e.g., Client-facing role with Fortune 500 companies"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextAreaField 
                      label="Description" 
                      value={exp.description} 
                      onChange={(value) => updateExperience(exp.id, 'description', value)} 
                      rows={3} 
                      placeholder="Brief overview of your role and responsibilities..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities</label>
                  <div className="space-y-2">
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea
                          value={bullet}
                          onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Describe an achievement or responsibility..."
                        />
                        <button onClick={() => removeBullet(exp.id, idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(exp.id)} className="text-sm text-blue-600 hover:underline">+ Add bullet</button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements (optional)</label>
                  <div className="space-y-2">
                    {(exp.achievements || []).map((achievement, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => updateAchievement(exp.id, idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="e.g., Increased revenue by 25%"
                        />
                        <button onClick={() => removeAchievement(exp.id, idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addAchievement(exp.id)} className="text-sm text-blue-600 hover:underline">+ Add achievement</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EditSection>
      </div>
    );
  }

  // Empty state
  if (experience.length === 0) {
    return (
      <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
        <div 
          onClick={handleEdit}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <Plus size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 font-medium">Add Work Experience</p>
          <p className="text-sm text-gray-400">Click to add your professional experience</p>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="px-8" style={{ paddingTop: 'var(--resume-section-gap)' }}>
      <ResumeSection title={isClassic ? "Experience" : "PROFESSIONAL EXPERIENCE"} onEdit={handleEdit} isEditing={isEditing}>
        {experience.map((exp, index) => (
          <ExperienceEntry
            key={exp.id}
            exp={exp}
            index={index}
            isLast={index === experience.length - 1}
            isClassic={isClassic}
          />
        ))}
      </ResumeSection>
    </div>
  );
}

/**
 * Individual experience entry component with page break prevention
 * Supports both modern and classic templates
 */
function ExperienceEntry({ 
  exp, 
  index, 
  isLast,
  isClassic 
}: { 
  exp: ExperienceItem; 
  index: number; 
  isLast: boolean;
  isClassic: boolean;
}) {
  const baseStyle = { marginBottom: !isLast ? 'var(--resume-experience-gap)' : 0 };
  
  // Classic template layout: Role on first line, Company — Location — Date on second line
  if (isClassic) {
    return (
      <div className="experience-entry" style={baseStyle}>
        {/* Role - bold, first line */}
        <h4 className="font-bold text-gray-900" style={{ fontSize: 'calc(var(--resume-font-size) * 1.05)' }}>
          {exp.role}
        </h4>
        
        {/* Company — Date on second line */}
        <div 
          className="text-gray-700" 
          style={{ 
            fontSize: 'var(--resume-font-size)', 
            marginBottom: 'var(--resume-bullet-gap)' 
          }}
        >
          {exp.company}
          {exp.period && (
            <span className="text-gray-500"> — {exp.period}</span>
          )}
        </div>

        {exp.clientNote && (
          <p className="text-gray-600 italic" style={{ fontSize: 'calc(var(--resume-font-size) * 0.9)', marginBottom: 'var(--resume-bullet-gap)' }}>
            {exp.clientNote}
          </p>
        )}

        {exp.description && (
          <p className="text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)', marginBottom: 'var(--resume-paragraph-gap)' }}>
            {exp.description}
          </p>
        )}

        {exp.bullets.length > 0 && (
          <ul className="list-disc ml-5 text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)' }}>
            {exp.bullets.map((bullet, idx) => (
              <li key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }} dangerouslySetInnerHTML={{ __html: formatBullet(bullet) }} />
            ))}
          </ul>
        )}

        {exp.achievements && exp.achievements.length > 0 && (
          <div style={{ marginTop: 'var(--resume-paragraph-gap)' }}>
            <p className="font-semibold text-gray-800" style={{ fontSize: 'var(--resume-font-size)', marginBottom: 'var(--resume-bullet-gap)' }}>
              Key Achievements:
            </p>
            <ul className="list-disc ml-5 text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)' }}>
              {exp.achievements.map((achievement, idx) => (
                <li key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Modern (blue) template layout
  return (
    <div
      className="experience-entry"
      style={baseStyle}
    >
      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--resume-bullet-gap)' }}>
        <div>
          <h4 className="font-bold text-gray-800" style={{ fontSize: 'calc(var(--resume-font-size) * 1.1)' }}>
            {exp.role}
          </h4>
          <p className="text-gray-600 font-semibold" style={{ fontSize: 'var(--resume-font-size)' }}>
            {exp.company}
          </p>
        </div>
        <span className="text-gray-600" style={{ fontSize: 'calc(var(--resume-font-size) * 0.9)' }}>
          {exp.period}
        </span>
      </div>

      {exp.clientNote && (
        <p className="text-gray-600 italic" style={{ fontSize: 'calc(var(--resume-font-size) * 0.9)', marginBottom: 'var(--resume-bullet-gap)' }}>
          {exp.clientNote}
        </p>
      )}

      {exp.description && (
        <p className="text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)', marginBottom: 'var(--resume-paragraph-gap)' }}>
          {exp.description}
        </p>
      )}

      {exp.bullets.length > 0 && (
        <ul className="list-disc ml-5 text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)' }}>
          {exp.bullets.map((bullet, idx) => (
            <li key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }} dangerouslySetInnerHTML={{ __html: formatBullet(bullet) }} />
          ))}
        </ul>
      )}

      {exp.achievements && exp.achievements.length > 0 && (
        <div className="bg-blue-50 p-3 rounded" style={{ marginTop: 'var(--resume-paragraph-gap)' }}>
          <p className="font-semibold text-gray-800" style={{ fontSize: 'var(--resume-font-size)', marginBottom: 'var(--resume-bullet-gap)' }}>
            Key Achievements:
          </p>
          <ul className="list-disc ml-5 text-gray-700" style={{ fontSize: 'var(--resume-font-size)', lineHeight: 'var(--resume-line-height)' }}>
            {exp.achievements.map((achievement, idx) => (
              <li key={idx} style={{ marginBottom: 'var(--resume-bullet-gap)' }}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatBullet(text: string): string {
  const colonMatch = text.match(/^([^:]+):/);
  if (colonMatch) {
    const projectName = colonMatch[1];
    const rest = text.slice(colonMatch[0].length);
    return `<strong>${projectName}:</strong>${rest}`;
  }
  return text;
}
