import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UsersType } from '../types/type';
import api from '../../api/api';

interface UserState {
  users: UsersType[];
  currentUser: UsersType | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// Регистрация
export const registerUser = createAsyncThunk(
  'users/register',
  async (userData: Omit<UsersType, 'id'>, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/register', userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

// Логин
export const loginUser = createAsyncThunk(
  'users/login',
  async (credentials: { name: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/login', credentials);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

// Текущий пользователь
export const getCurrentUser = createAsyncThunk(
  'users/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/me');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Auth error');
    }
  }
);

// Все пользователи
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/all');
      return data as UsersType[];
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Ошибка получения');
    }
  }
);

// Обновление текущего пользователя
export const updateCurrentUser = createAsyncThunk(
  'users/updateCurrentUser',
  async (updateData: Partial<Omit<UsersType, 'id'>>, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/me', updateData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления профиля');
    }
  }
);

// Обновление любого пользователя
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({userId, updateData}: {userId: number, updateData: Partial<UsersType>}, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${userId}`, updateData);
      return {userId, data};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления пользователя');
    }
  }
);

// Удаление текущего пользователя
export const deleteCurrentUser = createAsyncThunk(
  'users/deleteCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/users/me');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления');
    }
  }
);

// Удаление любого пользователя
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logoutUser(state) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.currentUser = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const { userId, data } = action.payload;
        state.users = state.users.map(user => 
          user.id === userId ? {...user, ...data} : user
        );
        if (state.currentUser?.id === userId) {
          state.currentUser = data;
        }
      })
      .addCase(deleteCurrentUser.fulfilled, (state) => {
        state.currentUser = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
      });
  },
});

export const { logoutUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;