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
		try {
			const storedUser = localStorage.getItem('user');
			return storedUser ? JSON.parse(storedUser) : null;
		} catch (error) {
			console.error('Error parsing user data from localStorage:', error);
			return null;
		}
	});

	const [dashboardData, setDashboardData] = useState<{
		clients: ClientData[];
		workers: WorkerData[];
		shifts: Shift[];
		monthlyData: MonthlyData[];
		currentWorker?: WorkerData;
		isLoading: boolean;
	}>({
		clients: [],
		workers: [],
		shifts: [],
		monthlyData: [],
		isLoading: true,
	});

	// Add a function to update user data
	const updateUserData = (newUserData: UserData) => {
		try {
			localStorage.setItem('user', JSON.stringify(newUserData));
			setUserData(newUserData);
		} catch (error) {
			console.error('Error updating user data:', error);
		}
	};

	useEffect(() => {
		const fetchDashboardData = async () => {
			if (!userData) return;

			try {
				setDashboardData((prev) => ({ ...prev, isLoading: true }));

				if (userData.role === 'worker') {
					const workerResponse = await axios.get<WorkerData>(
						`http://localhost:8080/workers/${userData.id}`
					);

					// Convert the worker ID to string for comparison
					if (workerResponse.data.id.toString() === userData.id) {
						updateUserData({
							...userData,
							name: workerResponse.data.name,
							// Only include properties that exist in UserData interface
							role: 'worker',
						});
					}

					setDashboardData((prev) => ({
						...prev,
						currentWorker: workerResponse.data,
						isLoading: false,
					}));
				} else if (
					userData.role === 'admin' ||
					userData.role === 'root'
				) {
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
							preferredCleaner: 'Wati',
							jobs: clientJobCounts.get(client.id) || 0,
						})
					);

					const currentYearShifts =
						filterCurrentYearShifts(shiftsData);
					const monthlyData = processShiftData(shiftsData);

					setDashboardData({
						clients: transformedClients,
						workers: workersResponse.data,
						shifts: currentYearShifts,
						monthlyData,
						isLoading: false,
					});
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				setDashboardData((prev) => ({ ...prev, isLoading: false }));
			}
		};

		fetchDashboardData();
		const refreshInterval = setInterval(fetchDashboardData, 60000);

		return () => clearInterval(refreshInterval);
	}, [userData]);

	const filterCurrentYearShifts = (shifts: Shift[]): Shift[] => {
		const currentYear = new Date().getFullYear();
		return shifts.filter((shift) => {
			const shiftDate = new Date(shift.date);
			// return shiftDate.getFullYear() === currentYear;
			return !isNaN(shiftDate.getTime()); // Working Hours Chart
		});
	};

	const processShiftData = (shifts: Shift[]): MonthlyData[] => {
		const currentDate = new Date();
		const currentYear = new Date().getFullYear();
		const monthlyJobCounts: { [key: string]: number } = {};
		const validMonthlyJobCounts: { [key: string]: number } = {};

		shifts
			.filter((shift) => {
				const status = shift.status;
				return status.toLowerCase() === 'completed';
			})
			.forEach((shift) => {
				const date = new Date(shift.date);
				const monthYear = `${date.getFullYear()}-${String(
					date.getMonth() + 1
				).padStart(2, '0')}`;

				// Count all shifts for Total Jobs (All Time) stat
				monthlyJobCounts[monthYear] =
					(monthlyJobCounts[monthYear] || 0) + 1;

				// Count only past and current month shifts for other statistics
				if (date <= currentDate) {
					validMonthlyJobCounts[monthYear] =
						(validMonthlyJobCounts[monthYear] || 0) + 1;
				}
			});

		return Object.keys(validMonthlyJobCounts)
			.map((monthYear) => {
				const [year, month] = monthYear.split('-');
				return {
					month: new Date(
						parseInt(year),
						parseInt(month) - 1
					).toLocaleString('default', { month: 'short' }),
					// month: monthYear,
					jobs: validMonthlyJobCounts[monthYear],
				};
			})
			.sort((a, b) => {
				const dateA = new Date(`${a.month}-01`);
				const dateB = new Date(`${b.month}-01`);
				return dateA.getTime() - dateB.getTime();
			});
	};

	if (!userData) {
		return <div>Loading...</div>;
	}

	if (userData.role === 'worker') {
		if (dashboardData.isLoading) {
			return <div>Loading worker data...</div>;
		}

		if (!dashboardData.currentWorker) {
			return <div>Error loading worker data. Please try again.</div>;
		}

		return <WorkerDashboard workerData={dashboardData.currentWorker} />;
	}

	if (userData.role === 'admin' || userData.role === 'root') {
		if (dashboardData.isLoading) {
			return <div>Loading admin dashboard...</div>;
		}

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
