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
  }

export interface Workers {
	name: string;
	jobs: number;
}

export interface Shift {
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
}

export interface ScheduleItem extends Shift {
	location: string;
	client_id: number;
	status: 'completed' | 'upcoming' | 'cancelled';
	cancelReason?: string;
	id: string;
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
}
