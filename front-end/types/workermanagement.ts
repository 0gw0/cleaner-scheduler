export interface Property {
	propertyId: number;
	clientId: number;
	address: string;
	postalCode: string;
}

export interface Shift {
	id: number;
	worker: number;
	property: Property;
	date: string;
	startTime: string;
	endTime: string;
	status: string;
}

export interface Leave {
	id: number;
	startDate: string;
	endDate: string;
}

export interface WorkerData {
	id: number;
	name: string;
	shifts: Shift[];
	phoneNumber: string;
	supervisor: number;
	bio: string;
	annualLeaves: Leave[];
	medicalLeaves: Leave[];
	homePostalCode: string;
}
