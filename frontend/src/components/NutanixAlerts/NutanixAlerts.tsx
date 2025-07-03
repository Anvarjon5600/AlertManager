import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGeminiRecommendation, createExcelReport } from '../../store/Slice/Nutanix.slice';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	CircularProgress,
	Typography,
	Box,
	Modal,
	Alert as MuiAlert,
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import { Alert } from '../../store/types/type';
import { useNavigate } from 'react-router-dom';

function NutanixAlerts() {
	const { alerts, loading, error } = useSelector((state: RootState) => state.nutanix);
	const dispatch: AppDispatch = useDispatch();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [geminiRecommendation, setGeminiRecommendation] = useState('');
	const [currentAlertId, setCurrentAlertId] = useState('');

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleGeminiClick = async (alert: Alert) => {
		setCurrentAlertId(alert.id);
		try {
			const result = await dispatch(fetchGeminiRecommendation(alert)).unwrap();
			setGeminiRecommendation(result);
			handleOpen();
		} catch (error: any) {
			if (error?.includes('Unauthorized')) {
				navigate('/login');
			} else {
				setGeminiRecommendation('Не удалось получить рекомендацию: ' + error);
				handleOpen();
			}
		}
	};

	const handleCreateExcel = async () => {
		try {
			await dispatch(createExcelReport()).unwrap();
		} catch (error) {
			console.error('Error creating Excel:', error);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return <MuiAlert severity="error" sx={{ mt: 2 }}>{error}</MuiAlert>;
	}

	return (
		<Box sx={{ p: 2, bgcolor: 'background.paper', minWidth: '100%' }}>
			{alerts.length > 0 ? (
				<Box sx={{ mb: 2 }}>
					<Box sx={{ mb: 2, mt: 2 }}>
						<Typography variant="h4">Список алертов Nutanix</Typography>
					</Box>
					<TableContainer component={Paper} sx={{ minWidth: '100%' }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell sx={{ textAlign: 'center' }}>№</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>Время</TableCell>
									<TableCell sx={{ width: '50%' }}>Сообщение</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>Категории</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>Серьёзность</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>Рекомендация</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{alerts.map((alert, index) => (
									<TableRow key={alert.id || index}>
										<TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>
											{new Date(alert.time / 1000).toLocaleString()}
										</TableCell>
										<TableCell>{alert.message}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>{alert.categories}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>{alert.severity}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>
											<Button
												variant="contained"
												onClick={() => handleGeminiClick(alert)}
												disabled={loading}
											>
												{loading && currentAlertId === alert.id ? (
													<CircularProgress size={24} />
												) : (
													'Получить рекомендацию'
												)}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					<Box sx={{ mb: 2, mt: 2 }}>
						<Button
							variant="contained"
							onClick={handleCreateExcel}
							disabled={loading}
						>
							Создать Excel отчёт
						</Button>
					</Box>
				</Box>
			) : (
				<Typography variant="body1" sx={{ mt: 2 }}>
					Нет данных об алертах
				</Typography>
			)}

			<Modal open={open} onClose={handleClose}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '90%',
						maxWidth: 800,
						maxHeight: '80vh',
						overflow: 'auto',
						bgcolor: 'background.paper',
						border: '2px solid #000',
						boxShadow: 24,
						p: 4,
					}}
				>
					<Typography variant="h6" component="h2" gutterBottom>
						Рекомендация Gemini для алерта {currentAlertId}
					</Typography>
					<Typography sx={{ mt: 2, whiteSpace: 'pre-line' }}>
						{geminiRecommendation}
					</Typography>
					<Button
						variant="contained"
						onClick={handleClose}
						sx={{ mt: 2 }}
					>
						Закрыть
					</Button>
				</Box>
			</Modal>
		</Box>
	);
}

export default NutanixAlerts;