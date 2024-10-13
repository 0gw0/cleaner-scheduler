import React from 'react';
import { MonthlyData, ClientData, WorkerData } from '@/types/dashboard';
import StatusCard from './StatusCard';
import JobsChart from './JobsChart';
import ClientsTable from './ClientsTable';
import WorkerTable from './WorkerTable';
import { Users, Briefcase, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  monthlyData: MonthlyData[];
  clients: ClientData[];
  workerData: WorkerData[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  monthlyData,
  clients,
  workerData,
}) => {
  const currentMonth = monthlyData[monthlyData.length - 1] || { month: '', jobs: 0 };
  const totalJobs = monthlyData.reduce((sum, month) => sum + month.jobs, 0);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
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
          title="Active Clients"
          value={clients.filter((c) => c.status === 'Active').length}
          icon={Users}
        />
		<StatusCard
          title="Number of Workers"
  		  value={workerData.length}
          icon={Users}
        />
      </div>
      {monthlyData.length > 0 ? (
        <div className="mb-6">
          <JobsChart data={monthlyData} />
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
    </div>
  );
};

export default AdminDashboard;