
  
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
  propertyId: number;
  clientId: number;
  address: string;
  postalCode: string;
}

export interface Shift {
  id: number;
  workers: number[]; // Array of worker IDs associated with this shift
  property: Property;
  date: string; // Date string (e.g., "2024-09-12")
  startTime: string; // Time string (e.g., "09:00:00")
  endTime: string; // Time string (e.g., "17:00:00")
  status: "COMPLETED" | "PENDING" | "UPCOMING" | "IN PROGRESS"; // Possible statuses
  arrivalImage?: ArrivalImage | null; // Optional, might be null if no image
  workerIds: number[]; // Duplicate of `workers`, but retained for compatibility if needed
}

export interface Worker {
  id: number;
  name: string;
  phoneNumber: string;
  supervisorId: number;
  shifts: Shift[]; // Array of Shift objects associated with the worker
}

export interface ShiftsResponse {
  data: Shift[]; // Array of Shift objects
}

export interface WorkersResponse {
  data: Worker[]; // Array of Worker objects
}
