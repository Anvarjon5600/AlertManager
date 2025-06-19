import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfig, fetchXClarityAlerts } from '../../store/Slice/XClarity.slice';
import { TextField, Button, Box, Typography } from '@mui/material';
import { RootState, store } from '../../store/store';

function XClarityConfigForm() {
	const config = useSelector((state: RootState) => state.xclarity.config);
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
		dispatch(updateConfig(localConfig));
		dispatch(fetchXClarityAlerts({
			host: localConfig.host,
			username: localConfig.username,
			password: localConfig.password,
		}));
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="h6">Настройки Vmware</Typography>
			<TextField label="Хост" name="host" value={localConfig.host} onChange={handleChange} />
			<TextField label="Имя пользователя" name="username" value={localConfig.username} onChange={handleChange} />
			<TextField label="Пароль" name="password" type="password" value={localConfig.password} onChange={handleChange} />
			<Button type="submit" variant="contained">Отправить</Button>
		</Box>
	);
}

export default XClarityConfigForm;