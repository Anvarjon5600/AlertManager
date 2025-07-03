import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as XLSX from 'xlsx';
import {Alert, NutanixConfig, NutanixState, FetchAlertsParams } from '../types/type';
import api from '../../api/api'; // Импортируем настроенный axios экземпляр

const initialState: NutanixState = {
  config: {
    vip: '192.168.30.200',
    username: 'anvarjon',
    password: 'Anvarjon.2001',
    smtpServer: 'email.hyperthink.uz',
    smtpPort: 587,
    smtpSender: 'anvarjon.ganiyev@hyperthink.uz',
    smtpPassword: 'anvarjon2001',
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
    const state = getState() as { nutanix: NutanixState };
    const alerts = state.nutanix.alerts;

    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Time', 'Message', 'Solution', 'Categories', 'Severity', 'Gemini Recommendation'],
      ...alerts.map((alert) => [
        new Date(alert.time / 1000).toLocaleString(),
        alert.message,
        'Требуется анализ',
        alert.categories,
        alert.severity,
        alert.gemini_rec || '',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Alerts');
    XLSX.writeFile(wb, 'nutanix_alerts.xlsx');
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