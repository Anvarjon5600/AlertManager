import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Modal,
  Box,
  Typography,
} from "@mui/material";
import { fetchUsers, addUser, editUser, deleteUser } from "../../store/Slice/Users.slice";
import { RootState, AppDispatch } from "../../store/store";
import { UsersType } from "../../store/types/type";

const UsersContent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.user);

  // Состояния формы
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UsersType | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  // Запрос пользователей только если они еще не загружены
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Открытие модального окна
  const handleOpen = useCallback((user?: UsersType) => {
    setCurrentUser(user || null);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: user?.password || "",
    });
    setOpen(true);
  }, []);

  // Закрытие модального окна
  const handleClose = useCallback(() => {
    setOpen(false);
    setCurrentUser(null);
    setFormData({ name: "", email: "", password: "" });
  }, []);

  // Изменение данных формы
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  // Сохранение пользователя
  const handleSave = useCallback(() => {
    if (!formData.name || !formData.email || !formData.password) return;

    const user: UsersType = {
      id: currentUser?.id || Date.now(),
      ...formData,
      image: "",
    };

    currentUser ? dispatch(editUser(user)) : dispatch(addUser(user));
    handleClose();
  }, [dispatch, currentUser, formData, handleClose]);

  // Удаление пользователя
  const handleDelete = useCallback(
    (id: number) => {
      dispatch(deleteUser(id));
    },
    [dispatch]
  );

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", minWidth: "100%" }}>
      <Button variant="contained" onClick={() => handleOpen()}>
        Добавить пользователя
      </Button>

      {loading && <Typography>Загрузка...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Пароль</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.password}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleOpen(user)}>
                    Редактировать
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">
            {currentUser ? "Редактировать пользователя" : "Добавить пользователя"}
          </Typography>
          <TextField
            label="Имя"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
            {currentUser ? "Сохранить" : "Добавить"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default UsersContent;
