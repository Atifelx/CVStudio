'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider with PersistGate to ensure rehydration completes
 * before rendering children. This ensures persisted data is loaded.
 */
export default function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            fontSize: '14px',
            color: '#666'
          }}>
            Loading resume data...
          </div>
        } 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
