'use client';

import React, { useEffect, useState } from 'react';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client before accessing localStorage
    setIsClient(true);
    
    // Debug: Check if persistence is working
    if (typeof window !== 'undefined') {
      try {
        const persistKey = 'persist:cv-studio-resume';
        const existingData = localStorage.getItem(persistKey);
        console.log('🔍 StoreProvider mounted - localStorage check:', {
          keyExists: !!existingData,
          dataLength: existingData?.length || 0,
        });
      } catch (error) {
        console.error('❌ localStorage access error in StoreProvider:', error);
      }
    }
  }, []);

  // During SSR, return a minimal provider without PersistGate
  if (!isClient) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

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
            color: '#666',
            background: '#f9fafb'
          }}>
            <div style={{
              background: 'white',
              padding: '24px 32px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                Loading CV Studio...
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Restoring your resume data
              </div>
            </div>
          </div>
        } 
        persistor={persistor}
        onBeforeLift={() => {
          console.log('🚀 PersistGate - About to lift (rehydration complete)');
        }}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
