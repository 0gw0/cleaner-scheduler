import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScheduleItem } from '../types/dashboard';

interface WorkerScheduleProps {
	schedule: ScheduleItem[];
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({ schedule }) => (
	<Card>
		<CardHeader>
			<CardTitle>Upcoming Work Schedule</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="space-y-4">
				{schedule.map((item, index) => (
					<div key={index} className="bg-secondary p-4 rounded-lg">
						<p className="font-semibold">
							{new Date(item.date).toLocaleDateString()}
						</p>
						<p>{`${item.startTime} - ${item.endTime}`}</p>
						<p>{`Location: ${item.location}`}</p>
						<p>{`Client ID: ${item.client_id}`}</p>
					</div>
				))}
			</div>
		</CardContent>
	</Card>
);

export default WorkerSchedule;
