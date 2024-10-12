import React from "react";
import { WorkerData } from "@/types/dashboard";
import StatusCard from "./StatusCard";
import WorkerSchedule from "./WorkerSchedule";
import WorkerCalendar from "./WorkerCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home } from "lucide-react";

interface WorkerDashboardProps {
  workerData: WorkerData;
  onCancelShift: (shiftId: string, reason: string) => void;
}


const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  workerData,
  onCancelShift,
}) => {
  const getUpcomingShiftsCount = (shifts: WorkerData['shifts']): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= today;
    }).length;
  };

  const upcomingShiftsCount = getUpcomingShiftsCount(workerData.shifts);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatusCard title="Name" value={workerData.name} icon={Users} />
        <StatusCard
          title="Number of Upcoming Shifts"
          value={upcomingShiftsCount}
          icon={Home}
        />
        <StatusCard
          title="Supervisor ID"
          value={workerData.supervisor}
          icon={Users}
        />
      </div>
      <div className="mb-6">
        <WorkerCalendar workerData={workerData} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Worker Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Bio:</strong> {workerData.bio}
          </p>
          <p>
            <strong>Home Postal Code:</strong> {workerData.homePostalCode}
          </p>
          <p>
            <strong>Number:</strong> {workerData.phoneNumber}
          </p>
        </CardContent>
      </Card>
      <div className="mt-6">
        <WorkerSchedule
          schedule={workerData.shifts}
          onCancelShift={onCancelShift}
        />
      </div>
    </div>
  );
};

export default WorkerDashboard;
