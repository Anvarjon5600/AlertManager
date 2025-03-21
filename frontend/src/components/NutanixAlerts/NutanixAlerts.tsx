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
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import { Alert } from '../../store/types/type';

function NutanixAlerts() {
	const { alerts, loading, error } = useSelector((state: RootState) => state.nutanix);
	const dispatch: AppDispatch = useDispatch();
	const [open, setOpen] = useState(false);
	const [geminiRecommendation, setGeminiRecommendation] = useState('');
	const [currentAlertId, setCurrentAlertId] = useState('');

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const HandleClick = (alert: Alert) => {
		setCurrentAlertId(alert.id);
		dispatch(fetchGeminiRecommendation(alert))
			.then((response) => {
				setGeminiRecommendation(response.payload);
				handleOpen();
			})
			.catch((error) => {
				console.error('Error fetching Gemini recommendation:', error);
				setGeminiRecommendation('Не удалось получить рекомендацию.');
				handleOpen();
			});
	};

	const handleCreateExcel = () => {
		dispatch(createExcelReport());
	};

	if (loading) {
		return <CircularProgress sx={{ mt: 4 }} />;
	}

	if (error) {
		return <Typography color="error">{error}</Typography>;
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
									<TableCell sx={{ textAlign: 'center' }}>Рекомендация Gemini</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{alerts.map((alert, index) => (
									<TableRow key={index}>
										<TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>{new Date(alert.time / 1000).toLocaleString()}</TableCell>
										<TableCell>{alert.message}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>{alert.categories}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>{alert.severity}</TableCell>
										<TableCell sx={{ textAlign: 'center' }}>
											<Button variant="contained" onClick={() => HandleClick(alert)}>
												Получить рекомендацию
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					<Box sx={{ mb: 2, mt: 2 }}>
						<Button variant="contained" onClick={handleCreateExcel}>
							Создать Excel отчёт
						</Button>
					</Box>
				</Box>
			) : (
				<Box sx={{ mb: 2, mt: 2 }}></Box>
			)}

			<Modal open={open} onClose={handleClose}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '90%',
						bgcolor: 'background.paper',
						border: '2px solid #000',
						boxShadow: 24,
						p: 4,
					}}
				>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Рекомендация Gemini для алерта {currentAlertId}
					</Typography>
					<Typography id="modal-modal-description" sx={{ mt: 2 }}>
						{geminiRecommendation}
					</Typography>
					<Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
						Закрыть
					</Button>
				</Box>
			</Modal>
		</Box>
	);
}

export default NutanixAlerts;