import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import cellReducer from './cellSlice';
import userReducer from './userSlice'
const store = configureStore({
  reducer: {
    session: sessionReducer,
    cells: cellReducer,
    user: userReducer,
  },
});

export default store;