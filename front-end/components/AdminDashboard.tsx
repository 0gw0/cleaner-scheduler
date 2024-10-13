import React from 'react';
import { MonthlyData, ClientData, WorkerData } from '@/types/dashboard';
import StatusCard from './StatusCard';
import JobsChart from './JobsChart';
import ClientsTable from './ClientsTable';
import WorkerTable from './WorkerTable';
import { Users, Briefcase, UserPlus, UserMinus, XCircle } from 'lucide-react';

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
	const currentMonth = monthlyData[monthlyData.length - 1];

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
				<StatusCard
					title="Total Jobs This Month"
					value={currentMonth.jobs}
					icon={Briefcase}
				/>
				<StatusCard
					title="New Jobs"
					value={currentMonth.newJobs}
					icon={Briefcase}
				/>
				<StatusCard
					title="New Clients"
					value={currentMonth.newClients}
					icon={UserPlus}
				/>
				<StatusCard
					title="Terminated Clients"
					value={currentMonth.terminatedClients}
					icon={UserMinus}
				/>
				<StatusCard
					title="Cancellations"
					value={currentMonth.cancellations}
					icon={XCircle}
				/>
				<StatusCard
					title="Active Clients"
					value={clients.filter((c) => c.status === 'Active').length}
					icon={Users}
				/>
			</div>
			<div className="mb-6">
				<JobsChart data={monthlyData} />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<ClientsTable clients={clients} />
				<WorkerTable workerData={workerData} />
			</div>
		</div>
	);
};

export default AdminDashboard;
