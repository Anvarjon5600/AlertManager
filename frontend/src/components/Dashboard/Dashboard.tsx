import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Clock from '../../components/Clock/Clock';
import { getCurrentUser } from '../../store/Slice/Users.slice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';


const HomePage: React.FC = () => {

	const dispatch = useDispatch<AppDispatch>();
	const { users } = useSelector((state: RootState) => state.user);
	React.useEffect(() => {
		if (users.length === 0) {
			dispatch(getCurrentUser());
		}
	}, [dispatch, users.length]);

	// Получаем userId из localStorage
	const userId = localStorage.getItem("userId");
	const parsedUserId = userId ? Number(userId) : null;

	// Определяем текущего пользователя
	const currentUser = users.find((user) => user.id === parsedUserId) || null;


	return (
		<Box sx={{
			p: 3,
			maxWidth: "100%",
			minHeight: "100%",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 2,
		}}>
			{/* Приветствие */}
			<Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: "light" }}>
				Welcome, {currentUser ? currentUser.name : "Guest"}!
			</Typography >
			<Clock />
		</Box >
	);
}

export default HomePage;
