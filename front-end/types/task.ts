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
    status: "COMPLETED" | "IN PROGRESS" | "UPCOMING"; 
  }
  
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
  
  export interface Worker {
    id: number;
    name: string;
    phoneNumber: string;
    supervisor: number; 
    bio: string;
    homePostalCode: string;
    shifts: Shift[]; 
    annualLeaves: AnnualLeave[]; 
    medicalLeaves: MedicalLeave[]; 
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