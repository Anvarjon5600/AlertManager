import { Box } from '@mui/material';
import XClarityAlerts from '../XClarityAlerts/XClarityAlerts';
import XClarityConfigForm from '../XClarityForm/XClarityForm';
import { useState } from 'react';
import { Slide } from '@mui/material';

function XClarityContent() {
	const [showAlerts, setShowAlerts] = useState(false);

	const handleFormSubmitSuccess = () => {
		setShowAlerts(true);
	};

	return (
		<Box
			sx={{
				py: "0px !important",
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				backgroundColor: 'background.default',
				minHeight: '100%',
			}}
		>
			{!showAlerts && (

				<XClarityConfigForm onSuccess={handleFormSubmitSuccess} />

			)}



			<Slide direction="up" in={showAlerts} mountOnEnter unmountOnExit timeout={300}>
				<Box sx={{ width: '100%' }}>
					<XClarityAlerts onClose={() => {
						setShowAlerts(false);
					}} />
				</Box>
			</Slide>
		</Box>
	);
}

export default XClarityContent;