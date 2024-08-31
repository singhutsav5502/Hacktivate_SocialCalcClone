import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { computeDelta } from '../utils/deltaCalculator';

// Async thunk to send updates to the server
export const updateSessionData = createAsyncThunk(
  'cells/updateSessionData',
  async ({ sessionId, cellId, newValue, oldValue }, { rejectWithValue }) => {
    try {
      const patch = computeDelta(oldValue, newValue); // Compute delta

      // Send delta update to server
      const response = await fetch(`http://localhost:5000/api/session/update/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellId, patch }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session data');
      }

      return { cellId, newValue }; // Return the updated data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cell slice to handle spreadsheet data
const cellSlice = createSlice({
  name: 'cells',
  initialState: {
    cells: {}, // Store cell values
    computedValues: {}, // Store computed values
    loading: false,
    error: null,
  },
  reducers: {
    setCellValue: (state, action) => {
      const { cellId, value, computedValue } = action.payload;
      state.cells[cellId] = value;
      state.computedValues[cellId] = computedValue;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSessionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSessionData.fulfilled, (state, action) => {
        const { cellId, newValue } = action.payload;
        state.cells[cellId] = newValue; // Update cell value
        state.loading = false;
      })
      .addCase(updateSessionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCellValue } = cellSlice.actions;
export default cellSlice.reducer;
