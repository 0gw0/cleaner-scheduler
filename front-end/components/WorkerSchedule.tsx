import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PhotoUploadDialog from './PhotoUploadDialog';

interface ScheduleItem {
	id: number;
	worker: number;
	property: {
		propertyId: number;
		clientId: number;
		address: string;
		postalCode: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	arrivalImage: string | null;
	completionImage: string | null;
	presentWorkers: number[] | null;
	workerIds: number[];
}

interface WorkerScheduleProps {
	schedule: ScheduleItem[];
	onScheduleUpdate?: (updatedSchedule: ScheduleItem[]) => void;
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({
	schedule,
	onScheduleUpdate,
}) => {
	const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
	const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
	const [uploadType, setUploadType] = useState<'arrival' | 'completion'>(
		'arrival'
	);

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	today.setHours(0, 0, 0, 0);

	const userDetails = localStorage.getItem('user');
	const workerId = userDetails ? JSON.parse(userDetails).id : null;

	const categorizeSchedule = () => {
		return schedule.reduce(
			(acc, item) => {
				const itemDate = new Date(item.date);
				itemDate.setHours(0, 0, 0, 0);
				if (itemDate < today) {
					acc.past.push(item);
				} else if (itemDate > today) {
					acc.upcoming.push(item);
				} else {
					acc.current.push(item);
				}
				return acc;
			},
			{ past: [], current: [], upcoming: [] } as Record<
				string,
				ScheduleItem[]
			>
		);
	};

	const handleOpenPhotoDialog = (
		shiftId: number,
		type: 'arrival' | 'completion'
	) => {
		setSelectedShiftId(shiftId);
		setUploadType(type);
		setIsPhotoDialogOpen(true);
	};

	const handleClosePhotoDialog = () => {
		setIsPhotoDialogOpen(false);
		setSelectedShiftId(null);
	};

	const handlePhotoUploadSuccess = (response: any) => {
		if (selectedShiftId && onScheduleUpdate) {
			const updatedSchedule = schedule.map((shift) => {
				if (shift.id === selectedShiftId) {
					return response.shift;
				}
				return shift;
			});
			onScheduleUpdate(updatedSchedule);
		}
		handleClosePhotoDialog();
	};

	const ScheduleSection = ({
		title,
		items,
	}: {
		title: string;
		items: ScheduleItem[];
	}) => (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => {
						const isWorkerPresent =
							item.presentWorkers?.includes(workerId);

						return (
							<Card key={item.id} className="bg-secondary">
								<CardContent className="pt-6">
									<div className="flex justify-between items-start mb-4">
										<p className="font-semibold">
											{new Date(
												item.date
											).toLocaleDateString()}
										</p>
										{title === 'Past Schedule' && (
											<div>
												<span
													className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
														isWorkerPresent
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													{isWorkerPresent
														? 'Attended'
														: 'Absent'}
												</span>
											</div>
										)}
									</div>
									<p>{`${item.startTime} - ${item.endTime}`}</p>
									<p>{`Address: ${item.property.address}`}</p>
									<p>{`Postal Code: ${item.property.postalCode}`}</p>
									<p>{`Property ID: ${item.property.propertyId}`}</p>
									<p>{`Client ID: ${item.property.clientId}`}</p>

									{title === 'Current Schedule' && (
										<div className="mt-3">
											{!isWorkerPresent && (
												<Button
													onClick={() =>
														handleOpenPhotoDialog(
															item.id,
															'arrival'
														)
													}
													className="w-full"
												>
													Upload Arrival Photo
												</Button>
											)}
											{isWorkerPresent &&
												!item.completionImage && (
													<Button
														onClick={() =>
															handleOpenPhotoDialog(
																item.id,
																'completion'
															)
														}
														className="w-full"
													>
														Upload Completion Photo
													</Button>
												)}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
					{items.length === 0 && (
						<p className="text-muted-foreground">
							No shifts scheduled
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);

	const { past, current, upcoming } = categorizeSchedule();

	return (
		<div className="space-y-6">
			{isPhotoDialogOpen && selectedShiftId && (
				<PhotoUploadDialog
					isOpen={isPhotoDialogOpen}
					onClose={handleClosePhotoDialog}
					endpoint={`http://localhost:8080/shifts/:shiftId/${
						uploadType === 'arrival'
							? 'arrival-image'
							: 'completion-image'
					}`}
					shiftId={selectedShiftId}
					onUploadSuccess={handlePhotoUploadSuccess}
				/>
			)}
			<ScheduleSection title="Current Schedule" items={current} />
			<ScheduleSection title="Upcoming Schedule" items={upcoming} />
			<ScheduleSection title="Past Schedule" items={past} />
		</div>
	);
};

export default WorkerSchedule;
