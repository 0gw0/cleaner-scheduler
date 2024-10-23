import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WorkerData } from '@/types/dashboard';

interface WorkerTableProps {
	workerData: WorkerData[];
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workerData }) => {
	const displayedWorkers = workerData.slice(0, 2);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Workers Profile</CardTitle>
			</CardHeader>
			<CardContent>
				{displayedWorkers.map((workerData) => (
					<Card key={workerData.id} className="mb-4">
						<CardHeader>
							<CardTitle>{workerData.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								<strong>Phone:</strong> {workerData.phoneNumber}
							</p>
							<p>
								<strong>Supervisor:</strong>{' '}
								{workerData.supervisor}
							</p>
							<p>
								<strong>Bio:</strong> {workerData.bio}
							</p>
							{/* <p><strong>Upcoming Jobs:</strong> {workerData.schedule.filter(job => job.status === "upcoming").length}</p> */}
						</CardContent>
					</Card>
				))}

				{workerData.length > 2 && (
					<p className="text-gray-500">
						... and {workerData.length - 2} more workers
					</p>
				)}

				<Link href="/workermanagement">
					<Button className="mt-4">View All Workers</Button>
				</Link>
			</CardContent>
		</Card>
	);
};

export default WorkerTable;
