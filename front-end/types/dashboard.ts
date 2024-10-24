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
	properties: Property[];
	status: 'Active' | 'Inactive';
	cleaningJobs?: Array<{
		id: number;
		property: {
			propertyId: number;
			clientId: number;
			address: string;
			postalCode: string;
		};
		date: string;
		startTime: string;
		endTime: string;
		worker: number;
	}>;
	preferredCleaner: string;
	jobs: number;
}

export interface Workers {
	name: string;
	jobs: number;
}

export interface Shift {
	id: number;
	worker: number;
	property: {
		propertyId: number;
		clientId: number;
		address: string;
		postalCode: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: 'COMPLETED' | 'UPCOMING' | string;
}

export interface WorkerData {
	id: number;
	name: string;
	role: string;
	shifts: Array<{
		id: number;
		worker: number;
		property: {
			propertyId: number;
			clientId: number;
			address: string;
			postalCode: string;
		};
		date: string;
		startTime: string;
		endTime: string;
	}>;
	phoneNumber: number;
	supervisor: string;
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
}

export interface UserData {
	role: 'worker' | 'admin';
	id: string;
	name: string;
	workers?: string[];
}
