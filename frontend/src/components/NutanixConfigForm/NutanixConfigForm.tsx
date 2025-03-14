import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfig, fetchNutanixAlerts } from '../../store/Slice/Nutanix.slice';
import { TextField, Button, Box, Typography } from '@mui/material';
import { RootState, store } from '../../store/store';

function NutanixConfigForm() {
	const config = useSelector((state: RootState) => state.nutanix.config);
	const dispatch = useDispatch<typeof store.dispatch>();
	const [localConfig, setLocalConfig] = useState(config);

	useEffect(() => {
		setLocalConfig(config);
	}, [config]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setLocalConfig({ ...localConfig, [name]: value });
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		console.log('test', localConfig);
		dispatch(updateConfig(localConfig));
		dispatch(fetchNutanixAlerts({
			vip: localConfig.vip,
			username: localConfig.username,
			password: localConfig.password
		}));
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="h6">Настройки Nutanix</Typography>
			<TextField label="VIP" name="vip" value={localConfig.vip} onChange={handleChange} />
			<TextField label="Имя пользователя" name="username" value={localConfig.username} onChange={handleChange} />
			<TextField label="Пароль" name="password" type="password" value={localConfig.password} onChange={handleChange} />
			{/* <TextField label="Gemini API Key" name="geminiApiKey" value={localConfig.geminiApiKey} onChange={handleChange} /> */}
			<Button type="submit" variant="contained">Отправить</Button>
		</Box>
	);
}

export default NutanixConfigForm;