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
	const [userData, setUserData] = useState<UserData | null>(null);
	const [clients, setClients] = useState<ClientData[]>([]);
	const [workerData, setWorkerData] = useState<WorkerData[]>([]);
	const [worker] = useState<WorkerData>({
		...JSON.parse(localStorage.getItem('user') || '{}'),
	});
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			const parsedUser = JSON.parse(storedUser);
			setUserData(parsedUser);
			console.log('User data:', parsedUser); // Debug log
		}
	}, []);

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const response = await fetch('http://localhost:8080/clients');
				if (!response.ok) {
					throw new Error('Failed to fetch clients');
				}
				const clientsData: ClientData[] = await response.json();

				const transformedClients: ClientData[] = clientsData.map(
					(client) => ({
						id: client.id,
						name: client.name,
						properties: client.properties,
						address: client.properties[0]?.address || '',
						postalCode: client.properties[0]?.postalCode || '',
						status: 'Active',
						cleaningJobs: [],
						preferredCleaner: 'Fake Halimah',
						jobs: 0,
					})
				);

				setClients(transformedClients);
			} catch (error) {
				console.error('Error fetching clients:', error);
			}
		};

		const fetchWorkers = async () => {
			if (!userData || userData.role !== 'admin') return;

			try {
				// Use user's ID as supervisorId if available
				const url = userData.id
					? `http://localhost:8080/workers?supervisorId=${userData.id}`
					: 'http://localhost:8080/workers';

				console.log('Fetching workers from:', url);
				const response = await axios.get<WorkerData[]>(url);
				const workers = response.data;
				console.log('Fetched workers:', workers);

				setWorkerData(workers);
			} catch (error) {
				console.error('Error fetching worker data:', error);
				setWorkerData([]);
			}
		};

		const fetchShifts = async () => {
			if (!userData || userData.role !== 'admin') return;

			try {
				const url = userData.id
					? `http://localhost:8080/workers/supervisor/${userData.id}/shifts`
					: 'http://localhost:8080/shifts';
				const response = await axios.get<Shift[]>(url);
				const shiftsData = response.data;

				const processedData = processShiftData(shiftsData);
				setMonthlyData(processedData);
			} catch (error) {
				console.error('Error fetching shifts:', error);
			}
		};

		if (userData) {
			fetchClients();
			if (userData.role === 'admin') {
				fetchWorkers();
				fetchShifts();
			}
		}
	}, [userData]);

	const processShiftData = (shifts: Shift[]): MonthlyData[] => {
		const monthlyJobCounts: { [key: string]: number } = {};

		shifts.forEach((shift) => {
			const date = new Date(shift.date);
			const monthYear = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, '0')}`;
			monthlyJobCounts[monthYear] =
				(monthlyJobCounts[monthYear] || 0) + 1;
		});

		const monthlyData: MonthlyData[] = Object.keys(monthlyJobCounts).map(
			(monthYear) => {
				const [year, month] = monthYear.split('-');
				return {
					month: new Date(
						parseInt(year),
						parseInt(month) - 1
					).toLocaleString('default', { month: 'short' }),
					jobs: monthlyJobCounts[monthYear],
				};
			}
		);

		monthlyData.sort((a, b) => {
			const dateA = new Date(a.month + ' 1, 2000');
			const dateB = new Date(b.month + ' 1, 2000');
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

	if (userData.role === 'admin') {
		return (
			<AdminDashboard
				monthlyData={monthlyData}
				clients={clients}
				workerData={workerData}
			/>
		);
	}

	return <div>Unauthorized access</div>;
};

export default Dashboard;
