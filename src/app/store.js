import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import monthReducer from './monthSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    month: monthReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
