import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGeminiRecommendations } from '../../store/Slice/XClarity.slice';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Typography, Box, Modal } from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';

function XClarityAlerts() {
	const { alerts, loading, error } = useSelector((state: RootState) => state.xclarity);
	const dispatch: AppDispatch = useDispatch();
	const [open, setOpen] = useState(false);
	const [geminiRecommendation, setGeminiRecommendation] = useState('');
	const [currentAlertId, setCurrentAlertId] = useState('');

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const HandleClick = (alertID: string) => {
		setCurrentAlertId(alertID);
		const alert = alerts.find((a) => a.alertID === alertID); // Фильтрация алерта на фронтенде
		console.log(alert, 'alert')
		if (alert) {
			dispatch(fetchGeminiRecommendations(alert)) // Отправка алерта в виде JSON
				.then((response) => {
					setGeminiRecommendation(response.payload);
					handleOpen();
				})
				.catch((error) => {
					console.error('Error fetching Gemini recommendation:', error);
					setGeminiRecommendation('Не удалось получить рекомендацию.');
					handleOpen();
				});
		} else {
			console.error('Alert not found');
			setGeminiRecommendation('Алерт не найден.');
			handleOpen();
		}
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
				<Box>
					<Box sx={{ mb: 2, mt: 2 }}>
						<Typography variant="h4">Список алертов XClarity</Typography>
					</Box>
					<TableContainer component={Paper} sx={{ bgcolor: 'background.paper', minWidth: '100%' }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Дата события</TableCell>
									<TableCell>Сообщение</TableCell>
									<TableCell>Серьёзность</TableCell>
									<TableCell>Тип системы</TableCell>
									<TableCell>Имя системы</TableCell>
									<TableCell>Рекомендация Gemini</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{alerts.map((alert, index) => (
									<TableRow key={index}>
										<TableCell>{alert.eventDate}</TableCell>
										<TableCell>{alert.msg}</TableCell>
										<TableCell>{alert.severityText}</TableCell>
										<TableCell>{alert.systemTypeText}</TableCell>
										<TableCell>{alert.systemName}</TableCell>
										<TableCell>
											<Button variant="contained" onClick={() => HandleClick(alert.alertID)}>
												Получать рекомендация
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			) : (
				<Typography variant="h6"></Typography>
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

export default XClarityAlerts;