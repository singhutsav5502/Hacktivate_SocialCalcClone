import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import cellReducer from './cellSlice';

const store = configureStore({
  reducer: {
    session: sessionReducer,
    cells: cellReducer,
  },
});

export default store;