export interface Property{
    propertyId : Number;
    clientId : Number;
    address : String;
    postalCode : String;
}

export interface time{
    hour: Number;
    minute: Number;
    second: Number;
    nano: Number;
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
	property: Property
    date: Date;
    startTime: time;
    endTime: time;
}

export interface TaskCardProps {
    ShiftData : ShiftData;
    WorkerTravelData: WorkerTravelData[];
}
