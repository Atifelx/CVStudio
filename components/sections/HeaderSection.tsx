'use client';

import React, { useState } from 'react';
import { Mail, Phone, Linkedin, Github, Plus, User, MapPin } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useLayout } from '@/context/LayoutContext';
import ResumeSection from '@/components/ResumeSection';
import EditSection, { InputField } from '@/components/EditSection';
import { HeaderData } from '@/types/resume';

/**
 * Header section component with proportional text scaling
 * Supports both modern (blue gradient) and classic (B&W centered) templates
 */
export default function HeaderSection() {
  const { resumeData, setResumeData, editingSection, setEditingSection } = useResume();
  const { settings } = useLayout();
  const { header } = resumeData;
  const isClassic = settings.template === 'classic';
  
  const [editData, setEditData] = useState<HeaderData>(header);
  const isEditing = editingSection === 'header';
  const isEmpty = !header.name && !header.title;

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
  const scaleFactor = 0.7 + ((headerPadding - 8) / (40 - 8)) * 0.6;
  
  // Calculate proportional text sizes (using points converted to pixels)
  const baseFontSizePx = Math.round(settings.fontSize * 1.333);
  const nameSize = Math.round(baseFontSizePx * 2.5 * scaleFactor);
  const titleSize = Math.round(baseFontSizePx * 1.3 * scaleFactor);
  const contactSize = Math.round(baseFontSizePx * scaleFactor);
  const iconSize = Math.round(14 * scaleFactor);
  
  // Calculate proportional gaps
  const itemGap = Math.round(vs.bulletGap * scaleFactor);
  const sectionGap = Math.round(itemGap * 2);

  // Edit mode (same for both templates)
  if (isEditing) {
    return (
      <div className={isClassic ? "bg-gray-100 p-6 border-b border-gray-300" : "bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6"}>
        <EditSection onSave={handleSave} onCancel={handleCancel} title="Header">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Full Name"
                value={editData.name}
                onChange={(value) => setEditData((prev) => ({ ...prev, name: value }))}
                placeholder="Your Full Name"
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Professional Title"
                value={editData.title}
                onChange={(value) => setEditData((prev) => ({ ...prev, title: value }))}
                placeholder="e.g., Software Engineer | Full Stack Developer"
              />
            </div>
            <InputField label="Email" value={editData.contact.email} onChange={(value) => updateContact('email', value)} type="email" placeholder="email@example.com" />
            <InputField label="Phone" value={editData.contact.phone} onChange={(value) => updateContact('phone', value)} type="tel" placeholder="+1-234-567-8900" />
            <InputField label="LinkedIn" value={editData.contact.linkedin} onChange={(value) => updateContact('linkedin', value)} placeholder="linkedin.com/in/yourname" />
            <InputField label="GitHub" value={editData.contact.github} onChange={(value) => updateContact('github', value)} placeholder="github.com/yourname" />
            <InputField label="Location" value={editData.contact.location} onChange={(value) => updateContact('location', value)} placeholder="City, Country" />
            <InputField label="Work Authorization" value={editData.contact.workAuthorization} onChange={(value) => updateContact('workAuthorization', value)} placeholder="e.g., US Citizen, H1B, etc." />
            <InputField label="Relocation" value={editData.contact.relocation} onChange={(value) => updateContact('relocation', value)} placeholder="Open to relocate to..." />
            <InputField label="Travel" value={editData.contact.travel} onChange={(value) => updateContact('travel', value)} placeholder="e.g., Up to 50% travel" />
          </div>
        </EditSection>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div 
        onClick={handleEdit}
        className={isClassic 
          ? "bg-gray-50 p-8 cursor-pointer hover:bg-gray-100 transition-all border-b border-gray-200"
          : "bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 cursor-pointer hover:from-blue-800 hover:to-blue-600 transition-all"
        }
      >
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isClassic ? 'bg-gray-200' : 'bg-white/20'
          }`}>
            <User size={32} className={isClassic ? 'text-gray-500' : 'text-white/80'} />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${isClassic ? 'text-gray-800' : ''}`}>Add Your Information</h2>
          <p className={`text-sm ${isClassic ? 'text-gray-500' : 'text-blue-200'}`}>Click to add your name, title, and contact details</p>
        </div>
      </div>
    );
  }

  // Classic template view
  if (isClassic) {
    // Build contact line with diamond separators
    const contactParts = [
      header.contact.email,
      header.contact.phone,
      header.contact.location,
    ].filter(Boolean);

    const linkParts = [
      header.contact.linkedin,
      header.contact.github,
    ].filter(Boolean);

    return (
      <ResumeSection onEdit={handleEdit} showEditButton={true}>
        <div 
          className="text-center border-b-2 border-gray-800 transition-all duration-150"
          style={{ 
            padding: `${headerPadding}px ${Math.round(24 * scaleFactor + 8)}px`,
            paddingBottom: `${Math.max(8, headerPadding / 2)}px`,
          }}
        >
          {/* Name - bold, large, centered */}
          <h1 
            className="font-bold text-gray-900 transition-all duration-150"
            style={{ 
              fontSize: `${nameSize}px`,
              marginBottom: `${Math.max(2, itemGap / 2)}px`,
              lineHeight: 1.1
            }}
          >
            {header.name}
          </h1>
          
          {/* Title - centered below name */}
          {header.title && (
            <h2 
              className="text-gray-700 transition-all duration-150"
              style={{ 
                fontSize: `${titleSize}px`,
                marginBottom: `${Math.max(6, sectionGap / 2)}px`,
                lineHeight: settings.lineHeight
              }}
            >
              {header.title}
            </h2>
          )}

          {/* Contact line with diamond separators */}
          {contactParts.length > 0 && (
            <div 
              className="text-gray-600 transition-all duration-150"
              style={{ 
                fontSize: `${contactSize}px`,
                marginBottom: linkParts.length > 0 ? `${Math.max(2, itemGap)}px` : 0,
              }}
            >
              {contactParts.map((part, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="mx-2 text-gray-400">◆</span>}
                  {part}
                </span>
              ))}
            </div>
          )}

          {/* Links line */}
          {linkParts.length > 0 && (
            <div 
              className="text-gray-600 transition-all duration-150"
              style={{ fontSize: `${contactSize}px` }}
            >
              {linkParts.map((part, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="mx-2 text-gray-400">◆</span>}
                  {part}
                </span>
              ))}
            </div>
          )}
        </div>
      </ResumeSection>
    );
  }

  // Modern (blue) template view
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
        {header.title && (
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
        )}

        {/* Contact Grid - scales proportionally */}
        {(header.contact.email || header.contact.phone || header.contact.linkedin || header.contact.github) && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 transition-all duration-150"
            style={{ 
              gap: `${Math.max(2, itemGap)}px`,
              fontSize: `${contactSize}px`,
              lineHeight: settings.lineHeight
            }}
          >
            {header.contact.email && (
              <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
                <Mail size={iconSize} />
                <span>{header.contact.email}</span>
              </div>
            )}
            {header.contact.phone && (
              <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
                <Phone size={iconSize} />
                <span>{header.contact.phone}</span>
              </div>
            )}
            {header.contact.linkedin && (
              <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
                <Linkedin size={iconSize} />
                <span>{header.contact.linkedin}</span>
              </div>
            )}
            {header.contact.github && (
              <div className="flex items-center" style={{ gap: `${Math.max(4, itemGap)}px` }}>
                <Github size={iconSize} />
                <span>{header.contact.github}</span>
              </div>
            )}
          </div>
        )}

        {/* Location & Authorization - scales proportionally */}
        {(header.contact.location || header.contact.workAuthorization || header.contact.relocation || header.contact.travel) && (
          <div 
            className="border-t border-blue-500 transition-all duration-150"
            style={{ 
              marginTop: `${Math.max(4, sectionGap)}px`,
              paddingTop: `${Math.max(4, sectionGap)}px`,
              fontSize: `${contactSize}px`,
              lineHeight: settings.lineHeight
            }}
          >
            {(header.contact.location || header.contact.workAuthorization) && (
              <p style={{ marginBottom: `${Math.max(2, itemGap)}px` }}>
                {header.contact.location && <><strong>Location:</strong> {header.contact.location}</>}
                {header.contact.location && header.contact.workAuthorization && ' | '}
                {header.contact.workAuthorization && <><strong>Work Authorization:</strong> {header.contact.workAuthorization}</>}
              </p>
            )}
            {(header.contact.relocation || header.contact.travel) && (
              <p>
                {header.contact.relocation && <><strong>Relocation:</strong> {header.contact.relocation}</>}
                {header.contact.relocation && header.contact.travel && ' | '}
                {header.contact.travel && <><strong>Travel:</strong> {header.contact.travel}</>}
              </p>
            )}
          </div>
        )}
      </div>
    </ResumeSection>
  );
}
