'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider + redux-persist PersistGate.
 * Resume data is persisted to localStorage; survives browser refresh.
 */
export default function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
