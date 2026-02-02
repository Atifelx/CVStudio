import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, type PersistConfig } from 'redux-persist';
import resumeReducer from './resumeSlice';
import layoutReducer from './layoutSlice';
import { initialResumeState } from './initialResumeState';
import { DEFAULT_LAYOUT_SETTINGS } from '@/types/layout';
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

export type RootPersistedState = {
  resume: ResumeState;
  layout: import('@/types/layout').LayoutSettings;
};

const persistConfig: PersistConfig<RootPersistedState> = {
  key: 'cv-studio-resume',
  storage: persistStorage,
  whitelist: ['resume', 'layout'],
  version: 2,
  migrate: (state: import('redux-persist/es/types').PersistedState, version: number) => {
    type PersistedState = import('redux-persist/es/types').PersistedState;
    const migrateSync = (): PersistedState => {
      if (state == null || typeof state !== 'object') return state;
      const s = state as Record<string, unknown>;
      const persistMeta = '_persist' in s ? (s._persist as { version: number; rehydrated: boolean }) : { version: 2, rehydrated: false };
      if (s.resume != null && s.layout != null) return state as PersistedState;
      if ('resumeData' in s && s.resume == null) {
        return { resume: s as unknown as ResumeState, layout: DEFAULT_LAYOUT_SETTINGS, _persist: persistMeta } as PersistedState;
      }
      return state as PersistedState;
    };
    return Promise.resolve(migrateSync());
  },
  debug: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
};

const rootReducer = combineReducers({
  resume: resumeReducer,
  layout: layoutReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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
  if (typeof window !== 'undefined') {
    const state = store.getState();
    console.log('✅ Redux Persist - Rehydration complete:', {
      hasResumeData: !!state.resume?.resumeData,
      hasName: !!state.resume?.resumeData?.header?.name,
      layoutTemplate: state.layout?.template,
      layoutColorTheme: state.layout?.colorTheme,
    });
  }
});

// Debug: Log when persistence happens
if (typeof window !== 'undefined') {
  persistor.subscribe(() => {
    const state = store.getState();
    console.log('💾 Redux Persist - State saved:', {
      hasResumeData: !!state.resume?.resumeData,
      template: state.layout?.template,
      colorTheme: state.layout?.colorTheme,
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
