export interface Property {
	propertyId: number;
	clientId: number;
	address: string;
	postalCode: string;
}

export interface Shift {
	id: number;
	workers: number[];
	property: Property;
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	arrivalImage: {
		s3Key: string;
		uploadTime: string;
		fileName: string;
		presignedUrl: string;
	} | null;
	workerIds: number[];
	rescheduled: boolean;
}

export interface MedicalLeave {
	id: number;
	startDate: string;
	endDate: string;
	medicalCertificate: {
		s3Key: string;
		uploadTime: string;
		fileName: string;
		presignedUrl: string;
	} | null;
	approved: boolean;
}

export interface WorkerData {
	id: number;
	name: string;
	shifts: Shift[];
	phoneNumber: string;
	status: string;
	supervisorId: number;
	bio: string;
	isVerified: boolean;
	annualLeaves: any[];
	password: string;
	medicalLeaves: MedicalLeave[];
	homePostalCode: string;
}

export interface DialogState {
	showSchedule: boolean;
	showMCHistory: boolean;
}
