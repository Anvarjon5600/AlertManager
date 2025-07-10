import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api'; // Используем наш axios instance
import { XClarityAlert, XClarityConfig, XClarityState } from '../types/type.ts';

const initialState: XClarityState = {
  alerts: [],
  config: {
    host: '',
    username: '',
    password: '',
  },
  loading: false,
  error: null,
};

export const fetchXClarityAlerts = createAsyncThunk(
  'xclarity/fetchAlerts',
  async (config: XClarityConfig, { rejectWithValue }) => {
    try {
      const response = await api.post('/xclarity/alerts', config);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).replace(/\//g, '.').replace(', ', ' ');
        } catch (e) {
          console.warn('Failed to parse date', dateString);
          return dateString;
        }
      };

      return response.data.map((alert: XClarityAlert) => ({
        ...alert,
        eventDate: formatDate(alert.eventDate),
      }));

    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const fetchGeminiRecommendations = createAsyncThunk(
  'xclarity/fetchGemini',
  async (alert: XClarityAlert, { getState, rejectWithValue }) => {
    try {
      const response = await api.post('/xclarity/gemini', {
        data: { alert } // Упрощенная структура запроса
      });

      if (!response.data.recommendation) {
        throw new Error('No recommendation in response');
      }

      // Возвращаем и alertID и рекомендацию для обновления состояния
      return {
        alertID: alert.alertID,
        recommendation: response.data.recommendation
      };

    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue(error.message || 'Failed to get recommendation');
    }
  }
);

export const updateAlertResolution = createAsyncThunk(
  'xclarity/updateResolution',
  async ({ alertID, resolution }: { alertID: string, resolution: string }, { rejectWithValue }) => {
    try {
      // В реальном приложении здесь был бы API вызов для сохранения
      return { alertID, resolution };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update resolution');
    }
  }
);

export const xclaritySlice = createSlice({
  name: 'xclarity',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<XClarityConfig>) => {
      state.config = action.payload;
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchXClarityAlerts
      .addCase(fetchXClarityAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchXClarityAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchXClarityAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchGeminiRecommendations
      .addCase(fetchGeminiRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeminiRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { updateConfig, clearAlerts, setLoading } = xclaritySlice.actions;

export default xclaritySlice.reducer;