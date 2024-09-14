import React, { useState, useEffect } from 'react';
import {
	UserData,
	MonthlyData,
	Client,
	Workers,
	WorkerData,
} from '@/types/dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import WorkerDashboard from '@/components/WorkerDashboard';

const mockWorkerData: WorkerData = {
	id: 1,
	name: 'Mati',
	shifts: [
		{
			date: '2024-09-12',
			startTime: '09:00:00',
			endTime: '17:00:00',
			valid: true,
		},
		{
			date: '2024-09-16',
			startTime: '09:00:00',
			endTime: '17:00:00',
			valid: true,
		},
	],
	schedule: [
		{
			date: '2024-09-14',
			startTime: '09:00:00',
			endTime: '12:00:00',
			location: '123 Main St',
			client_id: 1,
			valid: true,
		},
		{
			date: '2024-09-14',
			startTime: '13:00:00',
			endTime: '17:00:00',
			location: '456 Elm',
			client_id: 2,
			valid: true,
		},
	],
	phoneNumber: '1234567890',
	supervisor: 1,
	supervisor_number: '0987654321',
	bio: 'eg bio 1',
};

const Dashboard: React.FC = () => {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [monthlyData] = useState<MonthlyData[]>([
		{
			month: 'Jan',
			jobs: 120,
			newJobs: 15,
			newClients: 5,
			terminatedClients: 2,
			cancellations: 8,
		},
		{
			month: 'Feb',
			jobs: 150,
			newJobs: 20,
			newClients: 7,
			terminatedClients: 1,
			cancellations: 10,
		},
		{
			month: 'Mar',
			jobs: 180,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'Apr',
			jobs: 160,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'May',
			jobs: 200,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'Jun',
			jobs: 180,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'Jul',
			jobs: 150,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'Aug',
			jobs: 160,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
		{
			month: 'Sept',
			jobs: 182,
			newJobs: 25,
			newClients: 10,
			terminatedClients: 3,
			cancellations: 12,
		},
	]);
	const [clients] = useState<Client[]>([
		{ name: 'Client A', status: 'Active', jobs: 5 },
		{ name: 'Client B', status: 'Inactive', jobs: 0 },
		{ name: 'Client C', status: 'Active', jobs: 3 },
	]);
	const [workers] = useState<Workers[]>([
		{ name: 'Worker A', jobs: 2 },
		{ name: 'Worker B', jobs: 1 },
		{ name: 'Worker C', jobs: 3 },
	]);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUserData(JSON.parse(storedUser));
		}
	}, []);

	if (!userData) {
		return <div>Loading...</div>;
	}

	if (userData.role === 'worker') {
		return <WorkerDashboard workerData={mockWorkerData} />;
	}

	if (userData.role === 'admin') {
		return (
			<AdminDashboard
				monthlyData={monthlyData}
				clients={clients}
				workers={workers}
			/>
		);
	}

	return <div>Unauthorized access</div>;
};

export default Dashboard;
