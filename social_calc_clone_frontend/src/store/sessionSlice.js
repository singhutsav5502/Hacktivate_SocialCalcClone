import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessionId: null,
    sessionData: {},
  },
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setSessionData: (state, action) => {
      state.sessionData = action.payload;
    },
  },
});

export const { setSessionId, setSessionData } = sessionSlice.actions;
export default sessionSlice.reducer;