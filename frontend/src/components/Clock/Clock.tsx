import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";


export default function Clock() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};

	return (
		<Stack spacing={1}>
			<Typography variant="h2" sx={{ fontFamily: 'monospace' }}>
				{time.toLocaleTimeString()}
			</Typography>
			<Typography variant="h6">
				{time.toLocaleDateString(undefined, options)}
			</Typography>
		</Stack>
	);
}