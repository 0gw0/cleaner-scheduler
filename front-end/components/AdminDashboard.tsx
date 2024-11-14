import React from "react";
import { MonthlyData, ClientData, WorkerData } from "@/types/dashboard";
import StatusCard from "./StatusCard";
import JobsChart from "./JobsChart";
import ClientsTable from "./ClientsTable";
import WorkerTable from "./WorkerTable";
import WorkerStatistics from "./WorkerStatistics";
import WorkerLeaves from "./WorkerLeaves";
import {
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  Calendar,
  Download,
} from "lucide-react";

interface Shifts {
  [key: string]: any;
}

interface AdminDashboardProps {
  monthlyData: MonthlyData[];
  clients: ClientData[];
  workerData: WorkerData[];
  shifts: Shifts[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  monthlyData,
  clients,
  workerData,
  shifts,
}) => {
  const validMonthlyData = monthlyData.filter(
    (data) => data.month !== "Invalid Date"
  );

  console.table(shifts)
  
  const rescheduleShiftsCount = shifts.filter((shift) => shift.rescheduled).length;
  const cancelledShiftCount = shifts.filter((shift) => shift.status === "CANCELLED").length;

  const currentMonth = validMonthlyData[validMonthlyData.length - 1] || {
    month: "",
    jobs: 0,
  };
  const totalJobs = validMonthlyData.reduce(
    (sum, month) => sum + month.jobs,
    0
  );

  const workerStats = {
    totalWorkers: workerData.length,
    onLeave: workerData.filter(
      (worker) =>
        worker.annualLeaves.length > 0 || worker.medicalLeaves.length > 0
    ).length,
  };

  const clientStats = {
    totalActive: clients.filter((c) => c.status === "Active").length,
    totalInactive: clients.filter((c) => c.status !== "Active").length,
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Month",
        "Total Jobs",
        "Total Workers under me",
        "Number of workers on leave",
        "Active Clients",
        "Inactive Clients",
      ],
      ...validMonthlyData.map((month) => [
        month.month,
        month.jobs,
        workerStats.totalWorkers,
        workerStats.onLeave,
        clientStats.totalActive,
        clientStats.totalInactive,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "monthly-statistics.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-6">
        <StatusCard
          title="Total Jobs (All Time)"
          value={totalJobs}
          icon={Briefcase}
        />
        <StatusCard
          title={`Jobs in ${currentMonth.month}`}
          value={currentMonth.jobs}
          icon={Briefcase}
        />

        <StatusCard
          title="Average Jobs/Month"
          value={Math.round(totalJobs / validMonthlyData.length) || 0}
          icon={Briefcase}
        />
        <StatusCard
          title="Number of rescheduled Shifts"
          value={rescheduleShiftsCount}
          icon={Clock}
        />
         <StatusCard
          title="Number of cancelled Shifts"
          value={cancelledShiftCount}
          icon={Clock}
        />
         <StatusCard
          title="Total Workers"
          value={workerStats.totalWorkers}
          icon={Users}
        />
        <StatusCard
          title="Leaves this month"
          value={workerStats.onLeave}
          icon={Calendar}
        />
        <StatusCard
          title="Active Clients"
          value={clientStats.totalActive}
          icon={Users}
        />
        <StatusCard
          title="Inactive Clients"
          value={clientStats.totalInactive}
          icon={Users}
        />
      </div>

      {validMonthlyData.length > 0 ? (
        <div className="mb-6">
          <JobsChart data={validMonthlyData} />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <AlertCircle className="inline mr-2" />
          No monthly data available. The chart will appear when data is present.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ClientsTable clients={clients} />
        <WorkerTable workerData={workerData} />
      </div>

      <WorkerStatistics shifts={shifts} />
      <WorkerLeaves />
    </div>
  );
};

export default AdminDashboard;
