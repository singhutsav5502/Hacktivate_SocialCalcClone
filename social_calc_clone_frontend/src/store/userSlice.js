import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userId: '',
    username: '',
    email: '',
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId
      state.username = action.payload.username;
      state.email = action.payload.email;
    },
    setUsername: (state, action) => {
      state.username = action.payload
    },
    setEmail: (state, action) => {
      state.email = action.payload
    },
    setUserId: (state, action) => {
      state.userId = action.payload
    },
    clearUser: (state) => {
      state.userId = '';
      state.username = '';
      state.email = '';
    },
  },
});

export const { setUser, clearUser, setUserId, setEmail, setUsername } = userSlice.actions;
export default userSlice.reducer;