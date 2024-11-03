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

export const ScheduleDialog = ({ shifts }: ScheduleDialogProps) => {
	// Sort shifts by date and time
	const sortedShifts = [...shifts].sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);

		if (dateA.getTime() === dateB.getTime()) {
			// If same date, sort by start time
			const timeA = new Date(`2024-01-01T${a.startTime}`);
			const timeB = new Date(`2024-01-01T${b.startTime}`);
			return timeA.getTime() - timeB.getTime();
		}

		return dateA.getTime() - dateB.getTime();
	});

	// Group shifts by month and year
	const groupedShifts: { [key: string]: Shift[] } = sortedShifts.reduce(
		(groups, shift) => {
			const date = new Date(shift.date);
			const monthYear = date.toLocaleString('default', {
				month: 'long',
				year: 'numeric',
			});

			if (!groups[monthYear]) {
				groups[monthYear] = [];
			}
			groups[monthYear].push(shift);
			return groups;
		},
		{} as { [key: string]: Shift[] }
	);

	// Get today's date for status comparison
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return (
		<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Worker Schedule</DialogTitle>
			</DialogHeader>

			{Object.entries(groupedShifts).map(([monthYear, monthShifts]) => (
				<div key={monthYear} className="mb-6">
					<h3 className="font-semibold text-lg mb-3">{monthYear}</h3>
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
							{monthShifts.map((shift) => {
								const shiftDate = new Date(shift.date);
								const startTime = new Date(
									`2024-01-01T${shift.startTime}`
								);
								const endTime = new Date(
									`2024-01-01T${shift.endTime}`
								);
								const duration =
									(endTime.getTime() - startTime.getTime()) /
									(1000 * 60 * 60);

								// Determine status based on date if not provided
								let status = shift.status;
								if (!status) {
									if (shiftDate < today) {
										status = 'COMPLETED';
									} else if (
										shiftDate.getTime() === today.getTime()
									) {
										status = 'INPROGRESS';
									} else {
										status = 'UPCOMING';
									}
								}

								return (
									<TableRow key={shift.id}>
										<TableCell>
											{shiftDate.toLocaleDateString(
												'en-GB',
												{
													weekday: 'short',
													day: 'numeric',
													month: 'short',
												}
											)}
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
											{getStatusBadge(status)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			))}

			{shifts.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					No shifts scheduled.
				</div>
			)}
		</DialogContent>
	);
};
