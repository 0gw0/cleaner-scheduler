import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/dashboard';

interface ClientsTableProps {
	clients: Client[];
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => (
	<Card>
		<CardHeader>
			<CardTitle>Clients&apos; Profile</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr>
							<th className="text-left p-2">Name</th>
							<th className="text-left p-2">Status</th>
							<th className="text-left p-2">Jobs</th>
						</tr>
					</thead>
					<tbody>
						{clients.map((client, index) => (
							<tr key={index}>
								<td className="p-2">{client.name}</td>
								<td className="p-2">{client.status}</td>
								<td className="p-2">{client.jobs}</td>
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

export default ClientsTable;
