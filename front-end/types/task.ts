export interface Property{
    propertyId : number;
    clientId : number;
    address : String;
    postalCode : String;
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
    WorkerTravelData: WorkerTravelData[];
}
