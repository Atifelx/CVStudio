'use client';

import React, { useState } from 'react';
import { Mail, Phone, Linkedin, Github } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { InputField } from '@/components/EditSection';
import { HeaderData } from '@/types/resume';

/**
 * Header section component with proportional text scaling
 * Text size scales proportionally with header padding for visual balance
 */
export default function HeaderSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { settings } = useLayout();
  const { header } = resumeData;
  
  const [editData, setEditData] = useState<HeaderData>(header);
  const isEditing = editingSection === 'header';

  const handleEdit = () => {
    setEditData(header);
    setEditingSection('header');
  };

  const handleSave = () => {
    setResumeData((prev) => ({
      ...prev,
      header: editData,
    }));
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditData(header);
    setEditingSection(null);
  };

  const updateContact = (field: keyof HeaderData['contact'], value: string) => {
    setEditData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  // Get spacing values
  const vs = settings.verticalSpacing;
  const headerPadding = vs.headerPadding;
  
  // Calculate proportional scale factor based on header padding
  // Base padding is 24px, scale text proportionally
  // Range: headerPadding 8-40px → scale 0.7-1.3
  const scaleFactor = 0.7 + ((headerPadding - 8) / (40 - 8)) * 0.6;
  
  // Calculate proportional text sizes
  // Convert points to pixels: 1pt = 1.333px (matches MS Word)
  const baseFontSizePx = Math.round(settings.fontSize * 1.333);
  const nameSize = Math.round(baseFontSizePx * 2.5 * scaleFactor);
  const titleSize = Math.round(baseFontSizePx * 1.3 * scaleFactor);
  const contactSize = Math.round(baseFontSizePx * scaleFactor);
  const iconSize = Math.round(14 * scaleFactor);
  
  // Calculate proportional gaps
  const itemGap = Math.round(vs.bulletGap * scaleFactor);
  const sectionGap = Math.round(itemGap * 2);

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6">
        <EditSection onSave={handleSave} onCancel={handleCancel} title="Header">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Full Name"
                value={editData.name}
                onChange={(value) => setEditData((prev) => ({ ...prev, name: value }))}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Professional Title"
                value={editData.title}
                onChange={(value) => setEditData((prev) => ({ ...prev, title: value }))}
              />
            </div>
            <InputField label="Email" value={editData.contact.email} onChange={(value) => updateContact('email', value)} type="email" />
            <InputField label="Phone" value={editData.contact.phone} onChange={(value) => updateContact('phone', value)} type="tel" />
            <InputField label="LinkedIn" value={editData.contact.linkedin} onChange={(value) => updateContact('linkedin', value)} />
            <InputField label="GitHub" value={editData.contact.github} onChange={(value) => updateContact('github', value)} />
            <InputField label="Location" value={editData.contact.location} onChange={(value) => updateContact('location', value)} />
            <InputField label="Work Authorization" value={editData.contact.workAuthorization} onChange={(value) => updateContact('workAuthorization', value)} />
            <InputField label="Relocation" value={editData.contact.relocation} onChange={(value) => updateContact('relocation', value)} />
            <InputField label="Travel" value={editData.contact.travel} onChange={(value) => updateContact('travel', value)} />
          </div>
        </EditSection>
      </div>
    );
  }

  return (
    <ResumeSection onEdit={handleEdit} showEditButton={true}>
      <div 
        className="bg-gradient-to-r from-blue-900 to-blue-700 text-white transition-all duration-150"
        style={{ 
          padding: `${headerPadding}px ${Math.round(24 * scaleFactor + 8)}px`,
        }}
      >
        {/* Name - scales proportionally */}
        <h1 
          className="font-bold transition-all duration-150"
          style={{ 
            fontSize: `${nameSize}px`,
            marginBottom: `${Math.max(2, itemGap)}px`,
            lineHeight: 1.1
          }}
        >
          {header.name}
        </h1>
        
        {/* Title - scales proportionally */}
        <h2 
          className="transition-all duration-150"
          style={{ 
            fontSize: `${titleSize}px`,
            marginBottom: `${Math.max(4, sectionGap)}px`,
            lineHeight: settings.lineHeight
          }}
        >
          {header.title}
        </h2>

        {/* Contact Grid - scales proportionally */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 transition-all duration-150"
          style={{ 
            gap: `${Math.max(2, itemGap)}px`,
            fontSize: `${contactSize}px`,
            lineHeight: settings.lineHeight
          }}
        >
          <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
            <Mail size={iconSize} />
            <span>{header.contact.email}</span>
          </div>
          <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
            <Phone size={iconSize} />
            <span>{header.contact.phone}</span>
          </div>
          <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
            <Linkedin size={iconSize} />
            <span>{header.contact.linkedin}</span>
          </div>
          <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
            <Github size={iconSize} />
            <span>{header.contact.github}</span>
          </div>
        </div>

        {/* Location & Authorization - scales proportionally */}
        <div 
          className="border-t border-blue-500 transition-all duration-150"
          style={{ 
            marginTop: `${Math.max(4, sectionGap)}px`,
            paddingTop: `${Math.max(4, sectionGap)}px`,
            fontSize: `${contactSize}px`,
            lineHeight: settings.lineHeight
          }}
        >
          <p style={{ marginBottom: `${Math.max(2, itemGap)}px` }}>
            <strong>Location:</strong> {header.contact.location} |{' '}
            <strong>Work Authorization:</strong> {header.contact.workAuthorization}
          </p>
          <p>
            <strong>Relocation:</strong> {header.contact.relocation} |{' '}
            <strong>Travel:</strong> {header.contact.travel}
          </p>
        </div>
      </div>
    </ResumeSection>
  );
}
