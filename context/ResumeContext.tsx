'use client';

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ResumeData, SectionType } from '@/types/resume';
import { setResumeData as setResumeDataAction, setEditingSection as setEditingSectionAction, setEditingItemId as setEditingItemIdAction, clearData } from '@/store/resumeSlice';
import { store, persistor } from '@/store';
import type { RootState } from '@/store';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  editingSection: SectionType | null;
  setEditingSection: React.Dispatch<React.SetStateAction<SectionType | null>>;
  editingItemId: string | null;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  hasData: boolean;
  resetResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const resumeData = useSelector((s: RootState) => s.resume.resumeData);
  const editingSection = useSelector((s: RootState) => s.resume.editingSection);
  const editingItemId = useSelector((s: RootState) => s.resume.editingItemId);

  const hasData = Boolean(
    resumeData.header.name ||
    resumeData.summary ||
    resumeData.skills.length > 0 ||
    resumeData.experience.length > 0 ||
    resumeData.education.length > 0 ||
    (resumeData.generalSections?.length ?? 0) > 0
  );

  const setResumeData = useCallback((action: React.SetStateAction<ResumeData>) => {
    const next = typeof action === 'function'
      ? action(store.getState().resume.resumeData)
      : action;
    dispatch(setResumeDataAction(next));
  }, [dispatch]);

  const setEditingSection = useCallback((action: React.SetStateAction<SectionType | null>) => {
    const next = typeof action === 'function'
      ? action(store.getState().resume.editingSection)
      : action;
    dispatch(setEditingSectionAction(next));
  }, [dispatch]);

  const setEditingItemId = useCallback((action: React.SetStateAction<string | null>) => {
    const next = typeof action === 'function'
      ? action(store.getState().resume.editingItemId)
      : action;
    dispatch(setEditingItemIdAction(next));
  }, [dispatch]);

  const resetResume = useCallback(() => {
    dispatch(clearData());
    void persistor.purge();
  }, [dispatch]);

  const value = useMemo(() => ({
    resumeData,
    setResumeData,
    editingSection,
    setEditingSection,
    editingItemId,
    setEditingItemId,
    hasData,
    resetResume,
  }), [resumeData, setResumeData, editingSection, setEditingSection, editingItemId, setEditingItemId, hasData, resetResume]);

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (ctx === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return ctx;
}
