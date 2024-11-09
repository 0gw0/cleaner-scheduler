import React, { useState, useEffect } from 'react';
import {
	UserData,
	MonthlyData,
	ClientData,
	WorkerData,
	Shift,
} from '@/types/dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import WorkerDashboard from '@/components/WorkerDashboard';
import axios from 'axios';

const Dashboard: React.FC = () => {
	const [userData, setUserData] = useState<UserData | null>(() => {
		const storedUser = localStorage.getItem('user');
		return storedUser ? JSON.parse(storedUser) : null;
	});

	const [dashboardData, setDashboardData] = useState<{
		clients: ClientData[];
		workers: WorkerData[];
		shifts: Shift[];
		monthlyData: MonthlyData[];
	}>({
		clients: [],
		workers: [],
		shifts: [],
		monthlyData: [],
	});

	const [worker] = useState<WorkerData>(() => ({
		...JSON.parse(localStorage.getItem('user') || '{}'),
	}));

	useEffect(() => {
		const fetchAdminDashboardData = async () => {
			if (!userData || userData.role === 'worker') return;

			try {
				const [clientsResponse, workersResponse, shiftsResponse] =
					await Promise.all([
						axios.get<ClientData[]>(
							'http://localhost:8080/clients'
						),
						axios.get<WorkerData[]>(
							'http://localhost:8080/workers'
						),
						axios.get<Shift[]>('http://localhost:8080/shifts'),
					]);

				const shiftsData = shiftsResponse.data;
				const clientsData = clientsResponse.data;

				// Process clients data
				const clientJobCounts = new Map<number, number>();
				shiftsData.forEach((shift) => {
					const clientId = shift.property.clientId;
					clientJobCounts.set(
						clientId,
						(clientJobCounts.get(clientId) || 0) + 1
					);
				});

				const transformedClients: ClientData[] = clientsData.map(
					(client) => ({
						id: client.id,
						name: client.name,
						properties: client.properties,
						address: client.properties[0]?.address || '',
						postalCode: client.properties[0]?.postalCode || '',
						status: client.status,
						cleaningJobs: [],
						preferredCleaner: 'Fatmimah',
						jobs: clientJobCounts.get(client.id) || 0,
					})
				);

				// Process shifts data
				const currentYear = new Date().getFullYear();
				const currentYearShifts = shiftsData.filter((shift) => {
					const shiftDate = new Date(shift.date);
					return shiftDate.getFullYear() === currentYear;
				});

				const monthlyData = processShiftData(shiftsData);

				setDashboardData({
					clients: transformedClients,
					workers: workersResponse.data,
					shifts: currentYearShifts,
					monthlyData,
				});
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			}
		};

		fetchAdminDashboardData();
	}, [userData?.role, userData]);

	const processShiftData = (shifts: Shift[]): MonthlyData[] => {
		const currentYear = new Date().getFullYear();
		const monthlyJobCounts: { [key: string]: number } = {};

		shifts
			.filter((shift) => {
				const shiftDate = new Date(shift.date);
				return shiftDate.getFullYear() === currentYear;
			})
			.forEach((shift) => {
				const date = new Date(shift.date);
				const monthYear = `${date.getFullYear()}-${String(
					date.getMonth() + 1
				).padStart(2, '0')}`;
				monthlyJobCounts[monthYear] =
					(monthlyJobCounts[monthYear] || 0) + 1;
			});

		const monthlyData: MonthlyData[] = Object.keys(monthlyJobCounts)
			.map((monthYear) => {
				const [year, month] = monthYear.split('-');
				return {
					month: new Date(
						parseInt(year),
						parseInt(month) - 1
					).toLocaleString('default', { month: 'short' }),
					jobs: monthlyJobCounts[monthYear],
				};
			})
			.sort((a, b) => {
				const dateA = new Date(`${a.month} 1, ${currentYear}`);
				const dateB = new Date(`${b.month} 1, ${currentYear}`);
				return dateA.getTime() - dateB.getTime();
			});

		return monthlyData;
	};

	if (!userData) {
		return <div>Loading...</div>;
	}

	if (userData.role === 'worker') {
		return <WorkerDashboard workerData={worker} />;
	}

	if (userData.role === 'admin' || userData.role === 'root') {
		return (
			<AdminDashboard
				monthlyData={dashboardData.monthlyData}
				clients={dashboardData.clients}
				workerData={dashboardData.workers}
				shifts={dashboardData.shifts}
			/>
		);
	}

	return <div>Unauthorized access</div>;
};

export default Dashboard;
