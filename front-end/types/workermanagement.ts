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

export interface WorkerCardProps {
	worker: WorkerData;
	onActionClick: (dialogType: keyof DialogState, worker: WorkerData) => void;
}

export interface TravelTime {
	totalTravelTime: number;
	travelTimeWithoutTraffic: number;
	travelTimeInTraffic: number;
}

export interface TimeObject {
	hour: number;
	minute: number;
	second: number;
	nano: number;
}

export interface RelevantShift {
	date: string;
	startTime: TimeObject;
	endTime: TimeObject;
}

export interface AvailableWorker {
	id: number;
	name: string;
	travelTimeToTarget: TravelTime;
	relevantShift: RelevantShift;
	originLocation: string;
}

export interface Property {
	propertyId: number;
	clientId: number;
	address: string;
	postalCode: string;
}

export interface ShiftAssignmentResponse {
	success: boolean;
	message: string;
	shifts: {
		id: number;
		worker: number;
		property: Property;
		date: string;
		startTime: TimeObject;
		endTime: TimeObject;
		status: string;
		arrivalImage: {
			s3Key: string;
			uploadTime: string;
			fileName: string;
		} | null;
	}[];
}

export interface DialogState {
	showMC: boolean;
	showSchedule: boolean;
	showMCHistory: boolean;
	showReallocation: boolean;
}

export interface DialogState {
	showMC: boolean;
	showSchedule: boolean;
	showMCHistory: boolean;
	showReallocation: boolean;
}

export interface MCDates {
	startDate: string;
	endDate: string;
}

export interface DialogsProps {
	dialogState: DialogState;
	onClose: (dialogType: keyof DialogState) => void;
	selectedWorker: WorkerData | null;
	mcDates: MCDates;
	onMCDatesChange: (dates: MCDates) => void;
	onSubmitMC: () => void;
}