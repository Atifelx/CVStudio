import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ResumeData, SectionType } from '@/types/resume';
import { initialResumeState, initialResumeData } from './initialResumeState';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: initialResumeState,
  reducers: {
    setResumeData(state, action: PayloadAction<ResumeData>) {
      state.resumeData = action.payload;
    },
    setEditingSection(state, action: PayloadAction<SectionType | null>) {
      state.editingSection = action.payload;
    },
    setEditingItemId(state, action: PayloadAction<string | null>) {
      state.editingItemId = action.payload;
    },
    clearData() {
      return {
        ...initialResumeState,
        resumeData: { ...initialResumeData },
      };
    },
  },
});

export const { setResumeData, setEditingSection, setEditingItemId, clearData } = resumeSlice.actions;
export default resumeSlice.reducer;
