import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UsersType } from '../types/type';

interface UserState {
  users: UsersType[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await fetch('http://localhost:5000/api/users');
  const data = await response.json();
  return data;
});

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData: Omit<UsersType, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Server error');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const editUser = createAsyncThunk('users/editUser', async (user: UsersType) => {
  const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  return await response.json();
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: number) => {
  await fetch(`http://localhost:5000/api/users/${id}`, {
    method: 'DELETE',
  });
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки пользователей.';
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
          state.users = state.users.filter((user) => user.id !== action.payload);
});
  },
});

export default usersSlice.reducer;
