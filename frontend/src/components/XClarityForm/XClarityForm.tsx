import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfig, fetchXClarityAlerts } from '../../store/Slice/XClarity.slice';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { RootState, store } from '../../store/store';

interface XClarityConfigFormProps {
	onSuccess: () => void;
}

function XClarityConfigForm({ onSuccess }: XClarityConfigFormProps) {
	const { config, loading, error } = useSelector((state: RootState) => state.xclarity);
	const dispatch = useDispatch<typeof store.dispatch>();
	const [localConfig, setLocalConfig] = useState(config);

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
			await dispatch(updateConfig(localConfig));
			const resultAction = await dispatch(fetchXClarityAlerts({
				host: localConfig.host,
				username: localConfig.username,
				password: localConfig.password,
			}));
			const result = (resultAction as any).payload;

			if (result?.length > 0) {
				onSuccess();
			}
		} catch (err) {
			console.error('Error:', err);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{
			display: 'flex',
			flexDirection: 'column',
			gap: 2,
			p: 3,
			position: 'relative',
			top: '45%',
			left: '0%',
			transform: 'translate(0, -50%) !important',
		}}>
			<Typography variant="h4" sx={{ fontWeight: 400,mb:3 }}>Настройки XClarity</Typography>

			{error && <Alert severity="error">{error}</Alert>}

			<TextField
				label="Хост"
				name="host"
				value={localConfig.host}
				onChange={handleChange}
				fullWidth
				required
			/>
			<TextField
				label="Имя пользователя"
				name="username"
				value={localConfig.username}
				onChange={handleChange}
				fullWidth
				required
			/>
			<TextField
				label="Пароль"
				name="password"
				type="password"
				value={localConfig.password}
				onChange={handleChange}
				fullWidth
				required
			/>
			<Button
				type="submit"
				variant="contained"
				size="large"
				disabled={loading}
			>
				{loading ? <CircularProgress size={24} /> : 'Загрузить алерты'}
			</Button>
		</Box>
	);
}

export default XClarityConfigForm;