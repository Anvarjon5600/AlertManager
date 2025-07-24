// app/components/VmwareAlerts/VmwareAlerts.tsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVmwareGemini } from '../../store/Slice/vmware.slice';
import { RootState, AppDispatch } from '../../store/store';
import { exportAlerts } from '../../store/Slice/vmware.slice';
import {
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Button, CircularProgress, Typography, Box, Modal, Slide, IconButton, Grid, styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StatCard = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	borderRadius: 12,
	textAlign: 'center',
	boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const SeverityDot = styled(Box)({
	width: 10, height: 10, borderRadius: '50%', display: 'inline-block', marginRight: 8
});

interface Props { onClose: () => void }

function VmwareAlerts({ onClose }: Props) {
	const { alerts, loading, } = useSelector((s: RootState) => s.vmware);
	const dispatch: AppDispatch = useDispatch();
	const [modalOpen, setModalOpen] = useState(false);
	const [current, setCurrent] = useState<{ time: string; msg: string; recommendation?: string } | null>(null);

	type AlertLevel = 'Info' | 'Warning' | 'Error';
	const colors: Record<AlertLevel, string> = { Info: '#1cc88a', Warning: '#f6c23e', Error: '#e74a3b' };

	const handleGemini = async (a: any) => {
		setCurrent({ time: a.time, msg: a.msg });
		const res = await dispatch(fetchVmwareGemini(a)).unwrap();
		setCurrent({ time: a.time, msg: a.msg, recommendation: res.recommendation });
		setModalOpen(true);
	};

	return (
		<Box sx={{ p: 3, position: 'relative' }}>
			<IconButton onClick={onClose} sx={{ position: 'absolute', right: 24, top: 24 }}><CloseIcon /></IconButton>
			<Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Алерты VMware</Typography>
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{(['Info', 'Warning', 'Error'] as AlertLevel[]).map((lvl) => (
					<Grid item key={lvl} xs={4}>
						<StatCard sx={{ borderTop: `4px solid ${colors[lvl]}` }}>
							<Typography variant="h4">{alerts.filter(a => a.type === lvl).length}</Typography>
							<Typography>{lvl}</Typography>
						</StatCard>
					</Grid>
				))}
			</Grid>
			<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
				<Table>
					<TableHead>
						<TableRow>
							{['Время', 'Сообщение', 'Тип', 'Действия'].map((h, i) => <TableCell key={i}>{h}</TableCell>)}
						</TableRow>
					</TableHead>
					<TableBody>
						{alerts.map(a => (
							<TableRow key={a.time}>
								<TableCell>{new Date(a.time).toLocaleString()}</TableCell>
								<TableCell>{a.msg}</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<SeverityDot sx={{ bgcolor: colors[a.type] }} />{a.type}
									</Box>
								</TableCell>
								<TableCell>
									<Button
										variant="contained"
										onClick={() => handleGemini(a)}
										disabled={loading && current?.time === a.time}
										sx={{
											minWidth: 180,
											bgcolor: '#4e73df',
											'&:hover': { bgcolor: '#2e59d9' }
										}}>
										{loading && current?.time === a.time ? <CircularProgress size={20} /> : 'Рекомендация'}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
				<Button
					variant="contained"
					onClick={() => exportAlerts(alerts, 'vmware_alerts.xlsx')}
					disabled={loading}
					sx={{
						bgcolor: '#1cc88a',
						'&:hover': { bgcolor: '#17a673' }
					}}
				>
					Экспорт в Excel
				</Button>
			</Box>
			<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
				<Slide direction="up" in={modalOpen} mountOnEnter unmountOnExit>
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
						<Typography variant="h5">ℹ️Рекомендация</Typography>
						<Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>"{current?.msg}"</Typography>
						<Box sx={{
							bgcolor: 'rgba(0,0,0,0.02)',
							p: 3,
							borderRadius: 1,
							borderLeft: '4px solid #0056b3',
							mb: 3
						}}>
							<Typography whiteSpace="pre-line">{current?.recommendation || 'Загрузка...'}</Typography>
						</Box>
						<Box sx={{ mt: 2, textAlign: 'left' }}>
							<Button variant="contained" onClick={() => setModalOpen(false)}>Закрыть</Button>
						</Box>
					</Box>
				</Slide>
			</Modal>
		</Box>
	);
}

export default VmwareAlerts;
