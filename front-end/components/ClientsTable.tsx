import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClientData } from '@/types/dashboard';

interface ClientsTableProps {
	clients: ClientData[];
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => (
	<Card>
		<CardHeader>
			<CardTitle>Clients Profile</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr>
							<th className="text-left p-2">Name</th>
							<th className="text-left p-2">Address</th>
							<th className="text-left p-2">Postal Code</th>
							<th className="text-left p-2">Status</th>
							<th className="text-left p-2">Total Jobs</th>
							<th className="text-left p-2">Preferred Cleaner</th>
						</tr>
					</thead>
					<tbody>
						{clients.map((client) => (
							<tr key={client.id}>
								<td className="p-2">{client.name}</td>
								<td className="p-2">
									{client.properties[0]?.address ||
										'No address'}
								</td>
								<td className="p-2">
									{client.properties[0]?.postalCode ||
										'No postal code'}
								</td>
								<td className="p-2">
									<Badge
										variant={
											client.status === 'Active'
												? 'default'
												: 'secondary'
										}
									>
										{client.status}
									</Badge>
								</td>
								<td className="p-2">{client.jobs || 0}</td>
								<td className="p-2">
									{client.preferredCleaner || 'None'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className="mt-4 flex justify-between">
					<Link href="/clientprofile" passHref>
						<Button variant="default">View All Clients</Button>
					</Link>
				</div>
			</div>
		</CardContent>
	</Card>
);

export default ClientsTable;
