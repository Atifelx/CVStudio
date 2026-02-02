import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LayoutSettings } from '@/types/layout';
import { DEFAULT_LAYOUT_SETTINGS } from '@/types/layout';

export type LayoutState = LayoutSettings;

const layoutSlice = createSlice({
  name: 'layout',
  initialState: DEFAULT_LAYOUT_SETTINGS as LayoutState,
  reducers: {
    setLayoutSettings(state, action: PayloadAction<Partial<LayoutSettings>>) {
      const payload = action.payload;
      const next = { ...state, ...payload };
      if (payload.verticalSpacing && state.verticalSpacing) {
        next.verticalSpacing = { ...state.verticalSpacing, ...payload.verticalSpacing };
      }
      return next;
    },
    resetLayoutToDefaults() {
      return { ...DEFAULT_LAYOUT_SETTINGS };
    },
  },
});

export const { setLayoutSettings, resetLayoutToDefaults } = layoutSlice.actions;
export default layoutSlice.reducer;
