import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: '',
    email: '',
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    clearUser: (state) => {
      state.username = '';
      state.email = '';
    },
  },
});

export const { setUsername, setEmail, clearUser } = userSlice.actions;
export default userSlice.reducer;