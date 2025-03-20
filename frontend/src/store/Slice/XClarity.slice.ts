import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
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
      const response = await axios.post('http://192.168.40.42:5000/api/xclarity/alerts', config);
      const alerts: XClarityAlert[] = response.data;
      
      console.log("😊response",response)
      // Форматирование даты для каждого алерта
      const formattedAlerts = alerts.map((alert) => {
        const date = new Date(alert.eventDate);
        const formattedDate = date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        // Замена разделителя на точку
        const finalFormattedDate = formattedDate.replace(/\//g, '.').replace(', ', ', ');

        return {
          ...alert,
          eventDate: finalFormattedDate, // Замена оригинальной даты на отформатированную
        };
      });

      return formattedAlerts;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchGeminiRecommendations = createAsyncThunk(
  'xclarity/fetchGemini',
  async (alert: XClarityAlert, { getState, rejectWithValue }) => {
    const state: any = getState();
    const config = state.xclarity.config;
    try {
      const response = await axios.post('http://192168.40.42:5000/api/xclarity/gemini', {
        data: { ...config, alert }, // Отправляем данные в правильном формате
      });
      return response.data.recommendation;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchGeminiRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeminiRecommendations.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchGeminiRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateConfig } = xclaritySlice.actions;

export default xclaritySlice.reducer;
