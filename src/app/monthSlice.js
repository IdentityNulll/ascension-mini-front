import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

/** Globally selected month ("YYYY-MM") that drives every data view. */
const monthSlice = createSlice({
  name: 'month',
  initialState: { value: dayjs().format('YYYY-MM') },
  reducers: {
    setMonth: (state, action) => {
      state.value = action.payload;
    },
    shiftMonth: (state, action) => {
      state.value = dayjs(`${state.value}-01`).add(action.payload, 'month').format('YYYY-MM');
    },
  },
});

export const { setMonth, shiftMonth } = monthSlice.actions;
export const selectMonth = (s) => s.month.value;
export default monthSlice.reducer;
