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
  whitelist: ['resumeData'],
  version: 1,
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

export const persistor = persistStore(store);

// Debug: Log when persistence happens
if (typeof window !== 'undefined') {
  persistor.subscribe(() => {
    const state = store.getState();
    console.log('Redux Persist - State updated:', {
      hasResumeData: !!state.resume?.resumeData,
      resumeDataKeys: state.resume?.resumeData ? Object.keys(state.resume.resumeData) : [],
    });
  });
}
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
