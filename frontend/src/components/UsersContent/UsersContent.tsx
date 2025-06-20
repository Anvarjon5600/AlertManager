import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TableRow, Paper, Button,
  TextField, Modal, Box,
  Typography, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent
} from "@mui/material";
import {
  fetchUsers,
  updateCurrentUser,
  deleteCurrentUser,
  deleteUser,
  registerUser,
  updateUser,
} from "../../store/Slice/Users.slice";
import { RootState, AppDispatch } from "../../store/store";
import { UsersType } from "../../store/types/type";
import dayjs from "dayjs";

const UsersContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { users } = useSelector((state: RootState) => state.user);

  const [open, setOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState<Omit<UsersType, 'id'>>({
    name: "",
    email: "",
    password: "",
    role: "user",
    createdAt: undefined
  });
  const [editingUser, setEditingUser] = useState<UsersType | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openModal = useCallback((user?: UsersType) => {
    setIsNewUser(!user);
    setEditingUser(user || null); // Сохраняем редактируемого пользователя
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "user",
      createdAt: user?.createdAt
    });
    setOpen(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert("Name and email are required");
      return;
    }

    try {
      if (isNewUser) {
        await dispatch(registerUser(formData));
      } else {
        if (currentUser?.role === 'admin' && editingUser) {
          await dispatch(updateUser({
            userId: editingUser.id,
            updateData: formData
          }));
        } else {
          await dispatch(updateCurrentUser(formData));
        }
      }
      setOpen(false);
      dispatch(fetchUsers());
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      // Если удаляем текущего пользователя - используем deleteCurrentUser
      if (currentUser?.id === userId) {
        await dispatch(deleteCurrentUser());
        // Перенаправление на страницу входа после удаления
        window.location.href = '/login';
      } else {
        // Для других пользователей используем deleteUser
        await dispatch(deleteUser(userId));
      }
      dispatch(fetchUsers());
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="contained"
        onClick={() => openModal()}
        sx={{ mb: 3 }}
      >
        Add New User
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.createdAt ? dayjs(user.createdAt).format('DD.MM.YYYY HH:mm') : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => openModal(user)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" gutterBottom>
            {isNewUser ? 'Add New User' : 'Edit User'}
          </Typography>

          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleInputChange}
          />

          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleSelectChange}
              disabled={currentUser?.role !== 'admin'} // Только админ может выбирать роль
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleInputChange}
            helperText={isNewUser ? 'Required for new users' : 'Leave empty to keep current'}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
            fullWidth
          >
            {isNewUser ? 'Create User' : 'Save Changes'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default UsersContent;