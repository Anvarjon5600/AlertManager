import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import { VmwareAlert, VmwareConfig, VmwareState } from '../types/type.ts';
import XLSX from 'xlsx-js-style';

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


export function exportAlerts(alerts: any[], fileName: string) {
  const wb = XLSX.utils.book_new();
  const headers = ['Time','Message','Platform','Categories','Severity','Recommendation'];
  const data = alerts.map(a => [
    new Date(a.time).toLocaleString(),
    a.msg,
    a.platform || a.systemTypeText || 'N/A',
    (a.categories || []).join(', '),
    a.type || a.severity,
    a.recommendation || ''
  ]);
  
  const ws_data = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  headers.forEach((_, i) => {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
    cell.s = {
      font: { bold: true, color: { rgb: 'FFFFFFFF' } },
      fill: { fgColor: { rgb: 'FF4e73df' } },
      alignment: { horizontal: 'center' }
    };
  });

  ws['!cols'] = ws_data[0].map((_, i) => {
    const max = ws_data.map(r => (r[i] || '').toString().length)
      .reduce((a, b) => Math.max(a, b), 10);
    return { wch: max + 2 };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Alerts');
  XLSX.writeFile(wb, fileName, { compression: true });
}

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
