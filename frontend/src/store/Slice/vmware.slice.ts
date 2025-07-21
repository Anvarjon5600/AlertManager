import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import { VmwareAlert, VmwareConfig, VmwareState } from '../types/type.ts';

const initialState: VmwareState = {
  alerts: [],
  config: { host: '', user: '', password: '' },
  loading: false,
  error: null,
};

export const fetchVmwareAlerts = createAsyncThunk(
  'vmware/fetchAlerts',
  async (config: VmwareConfig, { rejectWithValue }) => {
    try {
      const res = await api.post('/vmware/events', config);
      if (!Array.isArray(res.data)) throw new Error('Invalid format');
      return res.data as VmwareAlert[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchVmwareGemini = createAsyncThunk(
  'vmware/fetchGemini',
  async (alert: VmwareAlert, { rejectWithValue }) => {
    try {
      const res = await api.post('/vmware/gemini', { alert });
      if (!res.data.recommendation) throw new Error('No recommendation');
      return { alertTime: alert.time, recommendation: res.data.recommendation };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const vmwareSlice = createSlice({
  name: 'vmware',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<VmwareConfig>) => {
      state.config = action.payload;
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVmwareAlerts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchVmwareAlerts.fulfilled, (state, { payload }) => {
        state.loading = false; state.alerts = payload;
      })
      .addCase(fetchVmwareAlerts.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload as string;
      })

      .addCase(fetchVmwareGemini.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVmwareGemini.fulfilled, (state, { payload }) => {
        state.loading = false;
        const alert = state.alerts.find(a => a.time === payload.alertTime);
        if (alert) alert.recommendation = payload.recommendation;
      })
      .addCase(fetchVmwareGemini.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload as string;
      });
  },
});

export const { updateConfig, clearAlerts, setLoading } = vmwareSlice.actions;
export default vmwareSlice.reducer;
