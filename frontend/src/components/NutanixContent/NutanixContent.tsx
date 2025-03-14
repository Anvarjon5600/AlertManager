import {  Box } from '@mui/material';
import NutanixConfigForm from '../NutanixConfigForm/NutanixConfigForm';
import NutanixAlerts from '../NutanixAlerts/NutanixAlerts';

function NutanixContent() {
	return (
		<Box
			sx={{
				py: 4,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				backgroundColor: 'background.default',
				minHeight: '100%',
			}}
		>
			<NutanixConfigForm />
			<NutanixAlerts />
		</Box>
	);
}

export default NutanixContent;