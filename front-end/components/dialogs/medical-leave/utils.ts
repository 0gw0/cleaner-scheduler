import { MCStatus } from "./types";

export const getMCStatus = (startDate: Date, endDate: Date): MCStatus => {
	const now = new Date();

	if (endDate < now) {
		return {
			label: 'COMPLETED',
			className: 'bg-green-100 text-green-800',
		};
	}
	if (startDate > now) {
		return {
			label: 'UPCOMING',
			className: 'bg-blue-100 text-blue-800',
		};
	}
	if (now >= startDate && now <= endDate) {
		return {
			label: 'ONGOING',
			className: 'bg-yellow-100 text-yellow-800',
		};
	}

	return {
		label: 'UNKNOWN',
		className: 'bg-gray-100 text-gray-800',
	};
};
