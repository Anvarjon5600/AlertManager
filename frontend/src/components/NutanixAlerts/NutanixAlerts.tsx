import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGeminiRecommendation, createExcelReport } from '../../store/Slice/Nutanix.slice';
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	CircularProgress,
	Modal,
	IconButton,
	Slide,
	Grid,
	styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { RootState, AppDispatch } from '../../store/store';
import { Alert } from '../../store/types/type';
import { useNavigate } from 'react-router-dom';

interface NutanixAlertsProps {
	onClose: () => void;
}

// Стилизованные компоненты
const StatCard = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	textAlign: 'center',
	borderRadius: '12px',
	boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
	transition: 'all 0.3s ease',
	'&:hover': {
		transform: 'translateY(-5px)',
		boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
	}
}));

const SeverityIndicator = styled(Box)({
	width: 10,
	height: 10,
	borderRadius: '50%',
	display: 'inline-block',
	marginRight: 8
});

const NutanixAlerts: React.FC<NutanixAlertsProps> = ({ onClose }) => {
	// Получение данных из Redux store
	const { alerts, loading, error } = useSelector((state: RootState) => state.nutanix);
	const dispatch: AppDispatch = useDispatch();
	const navigate = useNavigate();

	// Состояние компонента
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentAlert, setCurrentAlert] = useState<{ id: string, recommendation: string } | null>(null);

	// Статистика по алертам
	const alertStats = {
		total: alerts.length,
		critical: alerts.filter(a => a.severity === 'Critical').length,
		warning: alerts.filter(a => a.severity === 'Warning').length,
		info: alerts.filter(a => a.severity === 'Info').length
	};

	// Обработчики событий
	const handleGetRecommendation = async (alert: Alert) => {
		setCurrentAlert({ id: alert.id, recommendation: '' });
		try {
			const result = await dispatch(fetchGeminiRecommendation(alert)).unwrap();
			setCurrentAlert(prev => prev ? { ...prev, recommendation: result } : null);
			setIsModalOpen(true);
		} catch (error: any) {
			if (error?.includes('Unauthorized')) {
				navigate('/login');
			} else {
				setCurrentAlert(prev => prev ? { ...prev, recommendation: `Ошибка: ${error}` } : null);
				setIsModalOpen(true);
			}
		}
	};

	const handleExportExcel = async () => {
		try {
			await dispatch(createExcelReport()).unwrap();
		} catch (error) {
			console.error('Export error:', error);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setCurrentAlert(null);
	};

	// Цвета для статусов
	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'Critical': return '#e74a3b';
			case 'Warning': return '#f6c23e';
			case 'Info': return '#1cc88a';
			default: return '#858796';
		}
	};

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">{error}</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ p: "20px !important", position: 'relative' }}>
			{/* Кнопка закрытия */}
			<IconButton
				onClick={onClose}
				sx={{
					position: 'absolute',
					right: 24,
					top: -20,
					color: 'text.secondary',
					'&:hover': {
						color: 'text.primary'
					}
				}}
			>
				<CloseIcon />
			</IconButton>

			{/* Заголовок */}
			<Box sx={{ textAlign: 'center', mb: 4 }}>
				<Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
					Алерты Nutanix
				</Typography>
				<Typography variant="subtitle1" color="text.secondary">
					Всего обнаружено {alertStats.total} алертов
				</Typography>
			</Box>

			{/* Статистика */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{[
					{ label: 'Всего', value: alertStats.total, color: '#4e73df' },
					{ label: 'Critical', value: alertStats.critical, color: '#e74a3b' },
					{ label: 'Warning', value: alertStats.warning, color: '#f6c23e' },
					{ label: 'Info', value: alertStats.info, color: '#1cc88a' }
				].map((stat, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<StatCard sx={{ borderTop: `4px solid ${stat.color}` }}>
							<Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
								{stat.value}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{stat.label}
							</Typography>
						</StatCard>
					</Grid>
				))}
			</Grid>

			{/* Таблица алертов */}
			<TableContainer
				component={Paper}
				sx={{
					borderRadius: 2,
					boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
					mb: 3
				}}
			>
				<Table>
					<TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
						<TableRow>
							{['№', 'Время', 'Сообщение', 'Категория', 'Статус', 'Действия'].map((header, i) => (
								<TableCell
									key={i}
									align="center"
									sx={{ fontWeight: 500, py: 2 }}
								>
									{header}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{alerts.map((alert, index) => (
							<TableRow
								key={alert.id || index}
								hover
								sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.02)' } }}
							>
								<TableCell align="center">{index + 1}</TableCell>
								<TableCell align="center">
									{new Date(alert.time / 1000).toLocaleString()}
								</TableCell>
								<TableCell >{alert.message}</TableCell>
								<TableCell align="center" sx={{ color: '#22a5f7', fontWeight: 500 }}>
									{alert.categories}
								</TableCell>
								<TableCell align="center">
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
										<SeverityIndicator sx={{ bgcolor: getSeverityColor(alert.severity) }} />
										{alert.severity}
									</Box>
								</TableCell>
								<TableCell align="center">
									<Button
										variant="contained"
										onClick={() => handleGetRecommendation(alert)}
										disabled={loading && currentAlert?.id === alert.id}
										sx={{
											minWidth: 180,
											bgcolor: '#4e73df',
											'&:hover': { bgcolor: '#2e59d9' }
										}}
									>
										{loading && currentAlert?.id === alert.id ? (
											<CircularProgress size={24} sx={{ color: 'white' }} />
										) : (
											'Рекомендация'
										)}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Кнопка экспорта */}
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Button
					variant="contained"
					onClick={handleExportExcel}
					disabled={loading}
					sx={{
						bgcolor: '#1cc88a',
						'&:hover': { bgcolor: '#17a673' }
					}}
				>
					Экспорт в Excel
				</Button>
			</Box>

			{/* Модальное окно с рекомендацией */}
			<Modal open={isModalOpen} onClose={handleCloseModal}>
				<Slide direction="up" in={isModalOpen} mountOnEnter unmountOnExit>
					<Box sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%) !important',
						width: '90%',
						maxWidth: 800,
						maxHeight: '80vh',
						bgcolor: 'background.paper',
						borderRadius: 2,
						boxShadow: 24,
						p: 4,
						overflow: 'auto'
					}}>
						<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
							ℹ️ Рекомендация для алерта: {currentAlert?.id}
						</Typography>
						<Box sx={{
							bgcolor: 'rgba(0,0,0,0.02)',
							p: 3,
							borderRadius: 1,
							borderLeft: '4px solid #0056b3',
							mb: 3
						}}>
							<Typography whiteSpace="pre-line">
								{currentAlert?.recommendation || 'Загрузка...'}
							</Typography>
						</Box>
						<Button
							variant="contained"
							onClick={handleCloseModal}
							sx={{ mt: 2 }}
						>
							Закрыть
						</Button>
					</Box>
				</Slide>
			</Modal>
		</Box>
	);
};

export default NutanixAlerts;