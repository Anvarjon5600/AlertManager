import { Box } from '@mui/material';
import NutanixConfigForm from '../NutanixConfigForm/NutanixConfigForm';
import NutanixAlerts from '../NutanixAlerts/NutanixAlerts';
import { useState } from 'react';
import { Slide } from '@mui/material';

function NutanixContent() {
	const [showAlerts, setShowAlerts] = useState(false);

	const handleFormSubmitSuccess = () => {
		setShowAlerts(true);
	};

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
			{!showAlerts && (
				<NutanixConfigForm onSuccess={handleFormSubmitSuccess} />
			)}


			<Slide
				direction="up"
				in={showAlerts}
				mountOnEnter
				unmountOnExit
				timeout={300}
			>
				<Box sx={{
					// position: 'relative', bottom: 0, left: 0, right: 0
				}}>
					<NutanixAlerts onClose={() => setShowAlerts(false)} />
				</Box>
			</Slide>
		</Box>
	);
}

export default NutanixContent;