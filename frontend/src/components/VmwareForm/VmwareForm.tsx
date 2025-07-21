// app/components/VmwareForm/VmwareForm.tsx
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateConfig, fetchVmwareAlerts } from '../../store/Slice/vmware.slice';
import { RootState, AppDispatch } from '../../store/store';
import { useEffect, useState } from 'react';

interface Props { onSuccess: () => void }

function VmwareForm({ onSuccess }: Props) {
	const { config, loading, error } = useSelector((s: RootState) => s.vmware);
	const dispatch = useDispatch<AppDispatch>();
	const [localConfig, setLocalConfig] = useState(config);

	useEffect(() => { setLocalConfig(config) }, [config]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalConfig({ ...localConfig, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await dispatch(updateConfig(localConfig));
		const res = await dispatch(fetchVmwareAlerts(localConfig));
		if ('payload' in res && Array.isArray(res.payload) && res.payload.length) {
			onSuccess();
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
			<Typography variant="h4" sx={{ fontWeight: 400, mb: 3 }}>Настройки VMware</Typography>
			{error && <Alert severity="error">{error}</Alert>}
			<TextField label="Host" name="host" value={localConfig.host} onChange={handleChange} required />
			<TextField label="User" name="user" value={localConfig.user} onChange={handleChange} required />
			<TextField label="Password" name="password" type="password" value={localConfig.password} onChange={handleChange} required />
			<Button type="submit" variant="contained" disabled={loading}>
				{loading ? <CircularProgress size={24} /> : 'Загрузить алерты'}
			</Button>
		</Box>
	);
}

export default VmwareForm;
