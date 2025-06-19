import { Box } from '@mui/material';
import VmwareAlerts from '../VmwareAlerts/VmwareAlerts';
import VmwareForm from '../VmwareForm/VmwareForm';

function XClarityContent() {
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
			<VmwareForm />
			<VmwareAlerts />

		</Box>
	);
}

export default XClarityContent;