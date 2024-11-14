import React, { useState } from 'react';
import { WorkerData } from '@/types/dashboard';
import StatusCard from './StatusCard';
import WorkerSchedule from './WorkerSchedule';
import WorkerCalendar from './WorkerCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Home } from 'lucide-react';
import axios from 'axios';

interface WorkerDashboardProps {
	workerData: WorkerData;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ workerData }) => {
	const [currentWorkerData, setCurrentWorkerData] = useState(workerData);

	const getUpcomingShiftsCount = (shifts: WorkerData['shifts']): number => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return shifts.filter((shift) => {
			const shiftDate = new Date(shift.date);
			return shiftDate >= today;
		}).length;
	};

	const refreshWorkerData = async () => {
		try {
			const userDetails = localStorage.getItem('user');
			const userId = userDetails ? JSON.parse(userDetails).id : null;

			if (!userId) return;

			const response = await axios.get<WorkerData>(
				`http://localhost:8080/workers/${userId}`
			);

			setCurrentWorkerData(response.data);
			return response.data;
		} catch (error) {
			console.error('Error refreshing worker data:', error);
		}
	};

	const upcomingShiftsCount = getUpcomingShiftsCount(
		currentWorkerData.shifts
	);

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<StatusCard
					title="Name"
					value={currentWorkerData.name}
					icon={Users}
				/>
				<StatusCard
					title="Number of Upcoming Shifts"
					value={upcomingShiftsCount}
					icon={Home}
				/>
				<StatusCard
					title="Supervisor ID"
					value={currentWorkerData.supervisorId}
					icon={Users}
				/>
				<StatusCard
					title="Status"
					value={currentWorkerData.status}
					icon={Users}
				/>
			</div>
			<div className="mb-6">
				<WorkerCalendar workerData={currentWorkerData} />
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Worker Information</CardTitle>
				</CardHeader>
				<CardContent>
					<p>
						<strong>Bio:</strong> {currentWorkerData.bio}
					</p>
					<p>
						<strong>Home Postal Code:</strong>{' '}
						{currentWorkerData.homePostalCode}
					</p>
					<p>
						<strong>Number:</strong> {currentWorkerData.phoneNumber}
					</p>
				</CardContent>
			</Card>
			<div className="mt-6">
				<WorkerSchedule
					schedule={currentWorkerData.shifts}
					onScheduleUpdate={refreshWorkerData}
				/>
			</div>
		</div>
	);
};

export default WorkerDashboard;
