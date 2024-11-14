import { LucideIcon } from 'lucide-react';

export interface StatusCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
}

export interface MonthlyData {
	month: string;
	jobs: number;
}
export interface Property {
	id: number;
	address: string;
	postalCode: string;
	client: number;
}

export interface ClientData {
	id: number;
	name: string;
	properties: Array<{
		id: number;
		address: string;
		postalCode: string;
		active: boolean;
		client: number;
	}>;
	status: 'Active' | 'Inactive';
	preferredCleaner?: string;
	jobs?: number;
}

export interface Workers {
	name: string;
	jobs: number;
}

export interface ShiftImage {
	s3Key: string;
	uploadTime: string;
	fileName: string;
	presignedUrl: string;
	workerId: number;
}

export interface Shift {
	id: number;
	workers: number[];
	property: {
		propertyId: number;
		clientId: number;
		address: string;
		postalCode: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: 'COMPLETED' | 'UPCOMING' | 'CANCELLED' | string;
	arrivalImage: string | null;
	completionImage: string | null;
	arrivalImages: ShiftImage[];
	completionImages: ShiftImage[];
	workerIds: number[];
	originalDate: string;
	originalStartTime: string;
	originalEndTime: string;
	presentWorkers: number[] | null;
	rescheduled: boolean;
}

export interface WorkerData {
	id: number;
	name: string;
	role: string;
	shifts: Shift[];
	phoneNumber: number;
	supervisorId: number;
	bio: string;
	annualLeaves: Array<{
		id: number;
		startDate: string;
		endDate: string;
	}>;
	medicalLeaves: Array<{
		id: number;
		startDate: string;
		endDate: string;
	}>;
	homePostalCode: string;
	status: string;
}

export interface UserData {
	role: 'worker' | 'admin';
	id: string;
	name: string;
	workers?: string[];
}
