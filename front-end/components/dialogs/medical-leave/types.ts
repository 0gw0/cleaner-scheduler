export interface MedicalCertificate {
	presignedUrl?: string;
	fileName: string;
}

export interface MedicalLeave {
	id: number;
	startDate: string;
	endDate: string;
	medicalCertificate: MedicalCertificate | null;
	approved: boolean;
}

export interface WorkerData {
	id: number;
	name: string;
	medicalLeaves: MedicalLeave[];
}

export interface MCStatus {
	label: 'COMPLETED' | 'ONGOING' | 'UPCOMING' | 'UNKNOWN';
	className: string;
}
