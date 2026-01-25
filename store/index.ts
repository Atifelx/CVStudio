import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, type PersistConfig } from 'redux-persist';
import resumeReducer from './resumeSlice';
import { initialResumeState } from './initialResumeState';
import type { ResumeState } from './initialResumeState';

/** Noop storage for SSR (Next.js) when window is undefined */
function createNoopStorage() {
  return {
    getItem: () => Promise.resolve(null),
    setItem: (_k: string, v: unknown) => Promise.resolve(v),
    removeItem: () => Promise.resolve(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const persistStorage = typeof window !== 'undefined'
  ? require('redux-persist/lib/storage').default
  : createNoopStorage();

const persistConfig: PersistConfig<ResumeState> = {
  key: 'cv-studio-resume',
  storage: persistStorage,
  whitelist: ['resumeData'],
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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
