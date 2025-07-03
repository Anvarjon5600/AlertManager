import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNutanixAlerts } from '../../store/Slice/Nutanix.slice';
import { TextField, Button, Box, Typography, Alert as MuiAlert } from '@mui/material';
import { RootState, store } from '../../store/store';
import { useNavigate } from 'react-router-dom';

function NutanixConfigForm() {
	const config = useSelector((state: RootState) => state.nutanix.config);
	const { error } = useSelector((state: RootState) => state.nutanix);
	const dispatch = useDispatch<typeof store.dispatch>();
	const [localConfig, setLocalConfig] = useState(config);
	const navigate = useNavigate();

	useEffect(() => {
		setLocalConfig(config);
	}, [config]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setLocalConfig({ ...localConfig, [name]: value });
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const result = await dispatch(fetchNutanixAlerts({
				vip: localConfig.vip,
				username: localConfig.username,
				password: localConfig.password
			})).unwrap();

			if (result.error && result.error.includes('Unauthorized')) {
				navigate('/login');
			}
		} catch (err) {
			console.error('Error:', err);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="h6">Настройки Nutanix</Typography>
			{error && <MuiAlert severity="error">{error}</MuiAlert>}
			<TextField
				label="VIP"
				name="vip"
				value={localConfig.vip}
				onChange={handleChange}
				required
			/>
			<TextField
				label="Имя пользователя"
				name="username"
				value={localConfig.username}
				onChange={handleChange}
				required
			/>
			<TextField
				label="Пароль"
				name="password"
				type="password"
				value={localConfig.password}
				onChange={handleChange}
				required
			/>
			<Button type="submit" variant="contained">Отправить</Button>
		</Box>
	);
}

export default NutanixConfigForm;