import { LucideIcon } from 'lucide-react';

export interface StatusCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
}

export interface MonthlyData {
	month: string;
	jobs: number;
	newJobs: number;
	newClients: number;
	terminatedClients: number;
	cancellations: number;
}

export interface Client {
	name: string;
	status: string;
	jobs: number;
}

export interface Workers {
	name: string;
	jobs: number;
}

export interface Shift {
	date: string;
	startTime: string;
	endTime: string;
	valid: boolean;
}

export interface ScheduleItem extends Shift {
	location: string;
	client_id: number;
}

export interface WorkerData {
	id: number;
	name: string;
	shifts: Shift[];
	schedule: ScheduleItem[];
	phoneNumber: string;
	supervisor: number;
	supervisor_number: string;
	bio: string;
}

export interface UserData {
	role: 'worker' | 'admin';
	id: string;
	name: string;
}
