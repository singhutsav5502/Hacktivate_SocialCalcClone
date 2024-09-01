import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import userReducer from './userSlice'
const store = configureStore({
  reducer: {
    session: sessionReducer,
    user: userReducer,
  },
});

export default store;