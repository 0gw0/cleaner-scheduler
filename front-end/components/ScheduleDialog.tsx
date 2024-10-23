import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shift } from '@/types/workermanagement';

interface ScheduleDialogProps {
	shifts: Shift[];
}

const getStatusBadge = (status: string) => {
	const statusColors: { [key: string]: string } = {
		COMPLETED: 'bg-green-100 text-green-800',
		UPCOMING: 'bg-blue-100 text-blue-800',
		CANCELLED: 'bg-red-100 text-red-800',
		INPROGRESS: 'bg-yellow-100 text-yellow-800',
	};

	return (
		<Badge
			className={`${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
		>
			{status}
		</Badge>
	);
};

export const ScheduleDialog = ({ shifts }: ScheduleDialogProps) => (
	<DialogContent className="max-w-4xl">
		<DialogHeader>
			<DialogTitle>Worker Schedule</DialogTitle>
		</DialogHeader>
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>Time</TableHead>
					<TableHead>Duration</TableHead>
					<TableHead>Location</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{shifts.map((shift) => {
					const startTime = new Date(`2024-01-01T${shift.startTime}`);
					const endTime = new Date(`2024-01-01T${shift.endTime}`);
					const duration =
						(endTime.getTime() - startTime.getTime()) /
						(1000 * 60 * 60);

					return (
						<TableRow key={shift.id}>
							<TableCell>
								{new Date(shift.date).toLocaleDateString()}
							</TableCell>
							<TableCell>
								{shift.startTime.slice(0, 5)} -{' '}
								{shift.endTime.slice(0, 5)}
							</TableCell>
							<TableCell>{duration} hours</TableCell>
							<TableCell className="max-w-xs truncate">
								{shift.property.address}
							</TableCell>
							<TableCell>
								{getStatusBadge(shift.status)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	</DialogContent>
);
