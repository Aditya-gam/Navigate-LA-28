import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './slices/rootReducer';
import type { RootState } from '@/types';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

export default store; 