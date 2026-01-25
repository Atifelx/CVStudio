import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, type PersistConfig } from 'redux-persist';
import resumeReducer from './resumeSlice';
import { initialResumeState } from './initialResumeState';
import type { ResumeState } from './initialResumeState';

/** Noop storage for SSR (Next.js) when window is undefined */
function createNoopStorage() {
  return {
    getItem: () => Promise.resolve(null),
    setItem: (_k: string, _v: unknown) => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
}

/** LocalStorage implementation for redux-persist */
function createLocalStorage() {
  return {
    getItem: (key: string): Promise<string | null> => {
      try {
        if (typeof window === 'undefined') return Promise.resolve(null);
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
      } catch (error) {
        console.error('localStorage.getItem error:', error);
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string): Promise<void> => {
      try {
        if (typeof window === 'undefined') return Promise.resolve();
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (error) {
        console.error('localStorage.setItem error:', error);
        return Promise.resolve();
      }
    },
    removeItem: (key: string): Promise<void> => {
      try {
        if (typeof window === 'undefined') return Promise.resolve();
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (error) {
        console.error('localStorage.removeItem error:', error);
        return Promise.resolve();
      }
    },
  };
}

const persistStorage = typeof window !== 'undefined'
  ? createLocalStorage()
  : createNoopStorage();

const persistConfig: PersistConfig<ResumeState> = {
  key: 'cv-studio-resume',
  storage: persistStorage,
  whitelist: ['resumeData', 'editingSection', 'editingItemId'], // Persist all resume state
  version: 1,
  debug: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
};

const persistedReducer = persistReducer(persistConfig, resumeReducer);

const rootReducer = combineReducers({
  resume: persistedReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
        ignoredPaths: ['_persist'],
      },
    }),
});

export const persistor = persistStore(store, null, () => {
  // Callback when rehydration completes
  if (typeof window !== 'undefined') {
    const state = store.getState();
    console.log('✅ Redux Persist - Rehydration complete:', {
      hasResumeData: !!state.resume?.resumeData,
      hasName: !!state.resume?.resumeData?.header?.name,
      experienceCount: state.resume?.resumeData?.experience?.length || 0,
      skillsCount: state.resume?.resumeData?.skills?.length || 0,
    });
  }
});

// Debug: Log when persistence happens
if (typeof window !== 'undefined') {
  persistor.subscribe(() => {
    const state = store.getState();
    console.log('💾 Redux Persist - State saved:', {
      hasResumeData: !!state.resume?.resumeData,
      hasName: !!state.resume?.resumeData?.header?.name,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Log initial localStorage state
  try {
    const persistedState = localStorage.getItem('persist:cv-studio-resume');
    console.log('📦 Initial localStorage check:', {
      hasData: !!persistedState,
      size: persistedState ? persistedState.length : 0,
    });
  } catch (e) {
    console.error('❌ localStorage access error:', e);
  }
}
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
