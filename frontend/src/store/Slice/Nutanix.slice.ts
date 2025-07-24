import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {Alert, NutanixConfig, NutanixState, FetchAlertsParams } from '../types/type';
import api from '../../api/api'; // Импортируем настроенный axios экземпляр
import XLSX from 'xlsx-js-style';

const initialState: NutanixState = {
  config: {
    vip: '',
    username: '',
    password: '',
    smtpServer: 'email.hyperthink.uz',
    smtpPort: 587,
    smtpSender: '',
    smtpPassword: '',
    smtpReceiver: 'igor.panteleev@hyperthink.uz',
    geminiApiKey: import.meta.env.REACT_APP_GEMINI_API_KEY || '',
  },
  alerts: [],
  loading: false,
  error: null,
};

export const fetchNutanixAlerts = createAsyncThunk(
  'nutanix/fetchAlerts',
  async (params: FetchAlertsParams, { rejectWithValue }) => {
    try {
      // Используем api вместо axios напрямую
      const response = await api.post('/nutanix/alerts', params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGeminiRecommendation = createAsyncThunk(
  'nutanix/fetchGemini',
  async (alert: Alert, { getState, rejectWithValue }) => {
    const state: any = getState();
    const config = state.nutanix.config;
    try {
      // Используем api вместо axios напрямую
      const response = await api.post('/nutanix/gemini', {
        ...config,
        alert: alert,
      });
      return response.data.recommendation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createExcelReport = createAsyncThunk(
  'nutanix/createExcelReport',
  async (_, { getState }) => {
    const { alerts } = (getState() as { nutanix: NutanixState }).nutanix;

    const wb = XLSX.utils.book_new();

    const headers = [
      'Time', 'Message', 'Solution', 'Categories', 'Severity', 'Gemini Recommendation'
    ];
    const data = alerts.map(a => [
      new Date(a.time / 1000).toLocaleString(),
      a.message,
      'Требуется анализ',
      Array.isArray(a.categories) ? a.categories.join(', ') : a.categories,
      a.severity,
      a.gemini_rec || '',
    ]);

    const ws_data = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Устанавливаем стили заголовков
    headers.forEach((h, i) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
        fill: { fgColor: { rgb: 'FF4e73df' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    });

    // Автоширина колонок
    const colWidths = ws_data[0].map((_, i) => {
      const max = ws_data
        .map(row => (row[i] || '').toString().length)
        .reduce((a, b) => Math.max(a, b), 10);
      return { wch: max + 2 };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Nutanix Alerts');
    XLSX.writeFile(wb, 'nutanix_alerts.xlsx', { bookType: 'xlsx', compression: true });
  }
);


export const nutanixSlice = createSlice({
  name: 'nutanix',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<NutanixConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNutanixAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNutanixAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchNutanixAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки алертов.';
      })
      .addCase(fetchGeminiRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeminiRecommendation.fulfilled, (state) => {
        state.loading = false;
        // Здесь можно обновить конкретный alert с рекомендацией
        // Например, если action.meta.arg содержит id алерта
      })
      .addCase(fetchGeminiRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка получения рекомендации.';
      });
  },
});

export const { updateConfig } = nutanixSlice.actions;
export default nutanixSlice.reducer;