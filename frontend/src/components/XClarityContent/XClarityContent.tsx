import { Box } from '@mui/material';
import XClarityAlerts from '../XClarityAlerts/XClarityAlerts';
import XClarityConfigForm from '../XClarityForm/XClarityForm';

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
			<XClarityConfigForm />
			<XClarityAlerts />

		</Box>
	);
}

export default XClarityContent;