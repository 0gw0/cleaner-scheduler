import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workers } from '../types/dashboard';

interface WorkerTableProps {
	workers: Workers[];
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers }) => (
	<Card>
		<CardHeader>
			<CardTitle>Workers&apos; Profile</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr>
							<th className="text-left p-2">Name</th>
							<th className="text-left p-2">Jobs</th>
						</tr>
					</thead>
					<tbody>
						{workers.map((worker, index) => (
							<tr key={index}>
								<td className="p-2">{worker.name}</td>
								<td className="p-2">{worker.jobs}</td>
							</tr>
						))}
					</tbody>
				</table>
				<Button className="mt-4" variant="outline">
					View All
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default WorkerTable;
