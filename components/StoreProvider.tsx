'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider. Persist runs in background; children render immediately
 * so the app stays responsive. Rehydration updates state when ready.
 */
export default function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
