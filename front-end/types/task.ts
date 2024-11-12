
  
  export interface AnnualLeave {
    id: number;
    startDate: string;
    endDate: string; 
  }
  
  export interface MedicalLeave {
    id: number;
    startDate: string; 
    endDate: string; 
  }
  
export interface time{
    hour: number;
    minute: number;
    second: number;
    nano: number;
}

export interface TravelTime {
    totalTravelTime: number;
    travelTimeWithoutTraffic: number;
    travelTimeInTraffic: number;
  }
  
export interface RelevantShift {
    date: string;
    startTime: string;
    endTime: string;
  }

export interface WorkerTravelData {
    id: number;
    name: string;
    travelTimeToTarget: TravelTime;
    relevantShift: RelevantShift;
    originLocation: string;
  }

export interface ShiftData {
	id: number;
	worker: number;
    status: string;
	property: Property
    date: Date;
    startTime: time;
    endTime: time;
}

export interface TaskCardProps {
    ShiftData : ShiftData;
    WorkerTravelData: WorkerTravelData[];}

export interface ArrivalImage {
  s3Key: string;
  uploadTime: string; // ISO date-time string
  fileName: string;
}

// Represents an individual property linked to a shift.
export interface Property {
  id: number;
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
  status: "COMPLETED" | "PENDING" | "UPCOMING" | "IN PROGRESS" | "CANCELLED"; 
  arrivalImage?: ArrivalImage | null; 
  workerIds: number[]; 
  originalDate: string;
  originalStartTime : string;
  originalEndTime: string;
  presentWorkers : number[],
  completedWorkers: number[]
}

export interface Worker {
  id: number;
  name: string;
  phoneNumber: string;
  supervisorId: number;
  shifts: Shift[]; 
}

export interface ShiftsResponse {
  data: Shift[]; 
}

export interface WorkersResponse {
  data: Worker[]; 
}
