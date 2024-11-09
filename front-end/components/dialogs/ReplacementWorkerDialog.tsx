'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface TravelTime {
	totalTravelTime: number;
	travelTimeWithoutTraffic: number;
	travelTimeInTraffic: number;
}

interface TimeComponent {
	hour: number;
	minute: number;
	second: number;
	nano: number;
}

interface RelevantShift {
	date: string;
	startTime: TimeComponent;
	endTime: TimeComponent;
}

interface AvailableWorker {
	id: number;
	name: string;
	travelTimeToTarget: TravelTime;
	relevantShift: RelevantShift;
	originLocation: string;
}

interface ReplacementWorkerDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	availableWorkers: AvailableWorker[];
	onWorkerSelect: (workerId: number) => Promise<void>;
	currentShiftDate: string;
	isLoading: boolean;
}

export const ReplacementWorkerDialog = ({
	showDialog,
	onOpenChange,
	availableWorkers,
	onWorkerSelect,
	currentShiftDate,
	isLoading,
}: ReplacementWorkerDialogProps) => {
	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	};

	const formatTimeComponent = (time: TimeComponent) => {
		return `${String(time.hour).padStart(2, '0')}:${String(
			time.minute
		).padStart(2, '0')}`;
	};

	return (
		<Dialog open={showDialog} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>
						Select Replacement Worker for {currentShiftDate}
					</DialogTitle>
				</DialogHeader>

				<div className="mt-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Worker Name</TableHead>
								<TableHead>Travel Time</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Shift Time</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{availableWorkers.map((worker) => (
								<TableRow key={worker.id}>
									<TableCell className="font-medium">
										{worker.name}
									</TableCell>
									<TableCell>
										{formatDuration(
											worker.travelTimeToTarget
												.totalTravelTime
										)}
										<br />
										<span className="text-sm text-gray-500">
											(Traffic:{' '}
											{formatDuration(
												worker.travelTimeToTarget
													.travelTimeInTraffic
											)}
											)
										</span>
									</TableCell>
									<TableCell>
										{worker.originLocation}
									</TableCell>
									<TableCell>
										{formatTimeComponent(
											worker.relevantShift.startTime
										)}{' '}
										-{' '}
										{formatTimeComponent(
											worker.relevantShift.endTime
										)}
									</TableCell>
									<TableCell>
										<Button
											onClick={() =>
												onWorkerSelect(worker.id)
											}
											disabled={isLoading}
											size="sm"
										>
											Select
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{availableWorkers.length === 0 && (
						<div className="text-center py-4 text-gray-500">
							No available workers found for this shift.
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
