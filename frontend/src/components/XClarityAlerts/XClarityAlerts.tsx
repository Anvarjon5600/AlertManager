import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGeminiRecommendations } from '../../store/Slice/XClarity.slice';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, CircularProgress, Typography, Box, Modal, Slide,
    IconButton, Grid, styled, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { RootState, AppDispatch } from '../../store/store';
import { exportAlerts } from '../../store/Slice/XClarity.slice';


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

const SeverityDot = styled(Box)({
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 8
});

interface XClarityAlertsProps {
    onClose: () => void;
}

function XClarityAlerts({ onClose }: XClarityAlertsProps) {
    const { alerts, loading, error } = useSelector((state: RootState) => state.xclarity);
    const dispatch: AppDispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAlert, setCurrentAlert] = useState<{
        id: string;
        recommendation: string;
        message?: string;
    } | null>(null);

    // Статистика алертов
    const alertStats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severityText === 'Critical').length,
        warning: alerts.filter(a => a.severityText === 'Warning').length,
        info: alerts.filter(a => a.severityText === 'Info').length
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return '#e74a3b';
            case 'Warning': return '#f6c23e';
            case 'Info': return '#1cc88a';
            default: return '#858796';
        }
    };

    const handleGetRecommendation = async (alert: any) => {
        setCurrentAlert({
            id: alert.alertID,
            recommendation: '',
            message: alert.msg
        });
        try {
            const result = await dispatch(fetchGeminiRecommendations(alert)).unwrap();
            // If result is an object like { alertID, recommendation }, extract the string
            const recommendationText = typeof result === 'string' ? result : result.recommendation;
            setCurrentAlert(prev => prev ? { ...prev, recommendation: recommendationText } : null);
            setIsModalOpen(true);
        } catch (error) {
            setCurrentAlert(prev => prev ? {
                ...prev,
                recommendation: 'Не удалось получить рекомендацию'
            } : null);
            setIsModalOpen(true);
        }
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }


    const handleCloseModal = () => {
        console.log('Modal closed');
        setIsModalOpen(false);
        setCurrentAlert(null);
    };

    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            {/* Кнопка закрытия */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 24,
                    top: 24,
                    color: 'text.secondary',
                    '&:hover': {
                        color: 'text.primary',
                        bgcolor: 'rgba(0,0,0,0.05)'
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Заголовок и статистика */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
                    Алерты XClarity
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Всего обнаружено {alertStats.total} алертов
                </Typography>
            </Box>

            {/* Карточки статистики */}
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
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                            {['Дата', 'Сообщение', 'Серьёзность', 'Тип системы', 'Имя системы', 'Действия'].map((header, i) => (
                                <TableCell key={i} align="center" sx={{ fontWeight: 600, py: 2 }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alerts.map((alert, index) => (
                            <TableRow
                                key={alert.alertID || index}
                                hover
                                sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                            >
                                <TableCell align="center">{alert.eventDate}</TableCell>
                                <TableCell>{alert.msg}</TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SeverityDot sx={{ bgcolor: getSeverityColor(alert.severityText) }} />
                                        {alert.severityText}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{alert.systemTypeText}</TableCell>
                                <TableCell align="center">{alert.systemName}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        onClick={() => handleGetRecommendation(alert)}
                                        disabled={loading && currentAlert?.id === alert.alertID}
                                        sx={{
                                            minWidth: 180,
                                            bgcolor: '#4e73df',
                                            '&:hover': { bgcolor: '#2e59d9' }
                                        }}
                                    >
                                        {loading && currentAlert?.id === alert.alertID ? (
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => exportAlerts(alerts, 'xclarity_alerts.xlsx')}
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
                            ℹ️Рекомендация для алерта: {currentAlert?.id}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                            "{currentAlert?.message}"
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
}

export default XClarityAlerts;