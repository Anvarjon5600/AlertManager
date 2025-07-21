import { Box, Slide } from '@mui/material';
import VmwareConfigForm from '../VmwareForm/VmwareForm';
import VmwareAlerts from '../VmwareAlerts/VmwareAlerts';
import { useState } from 'react';

function VmwareContent() {
	const [showAlerts, setShowAlerts] = useState(false);

	const handleFormSubmitSuccess = () => setShowAlerts(true);

	return (
		<Box sx={{
			py: 0,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			textAlign: 'center',
			backgroundColor: 'background.default',
			minHeight: '100%',
		}}>
			{!showAlerts && (
				<VmwareConfigForm onSuccess={handleFormSubmitSuccess} />
			)}
			<Slide direction="up" in={showAlerts} mountOnEnter unmountOnExit timeout={300}>
				<Box sx={{ width: '100%' }}>
					<VmwareAlerts onClose={() => setShowAlerts(false)} />
				</Box>
			</Slide>
		</Box>
	);
}

export default VmwareContent;
