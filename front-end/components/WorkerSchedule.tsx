import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PhotoUploadDialog from './PhotoUploadDialog';

// Update the ScheduleItem interface to match the new data structure
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
	arrivalImage: string;
	completionImage: string;
	presentWorkers: number[];
	workerIds: number[];
}

interface WorkerScheduleProps {
	schedule: ScheduleItem[];
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({ schedule }) => {
	const [cancelReason, setCancelReason] = React.useState<string>('');
	const [selectedShiftId, setSelectedShiftId] = React.useState<number | null>(
		null
	);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

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

	const { past, current, upcoming } = categorizeSchedule();

	const handleConfirmCancel = () => {
		if (selectedShiftId && cancelReason.trim()) {
			setCancelReason('');
			setSelectedShiftId(null);
			setIsDialogOpen(false);
		}
	};

	const handleCloseDialog = () => {
		setSelectedShiftId(null);
		setCancelReason('');
		setIsDialogOpen(false);
	};

	const handleOpenPhotoDialog = (shiftId: number) => {
		setSelectedShiftId(shiftId);
		setIsPhotoDialogOpen(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setPhotoFile(file);
	};

	const openPhotoDialog = (shiftId: number) => {
		setSelectedShiftId(shiftId);
		setIsPhotoDialogOpen(true);
	};

	const handleClosePhotoDialog = () => {
		setIsPhotoDialogOpen(false);
		setSelectedShiftId(null);
		setPhotoFile(null);
	};

	function addMinutesToTime(timeString: string, minutesToAdd: number) {
		const [hours, minutes, seconds] = timeString.split(':').map(Number);

		const date = new Date();
		date.setHours(hours);
		date.setMinutes(minutes + minutesToAdd);
		date.setSeconds(seconds || 0);

		const updatedHours = String(date.getHours()).padStart(2, '0');
		const updatedMinutes = String(date.getMinutes()).padStart(2, '0');
		const updatedSeconds = String(date.getSeconds()).padStart(2, '0');

		return `${updatedHours}:${updatedMinutes}:${updatedSeconds}`;
	}

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
					{items.map((item) => (
						<Card key={item.id} className="bg-secondary">
							<CardContent className="pt-6">
								<div className="flex justify-between items-start mb-4">
									<p className="font-semibold">
										{new Date(
											item.date
										).toLocaleDateString()}
									</p>
									{/* add the status badge below */}
									{title === 'Past Schedule' && (
										<div>
											{(() => {
												const userDetails =
													localStorage.getItem(
														'user'
													);
												const workerId = userDetails
													? JSON.parse(userDetails).id
													: null;

												const isPresent =
													item.presentWorkers?.some(
														(presentWorker) =>
															presentWorker ===
															workerId
													);
												return (
													<p className="flex items-center">
														{isPresent ? (
															<span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-md">
																Attended
															</span>
														) : (
															<span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-md">
																Absent
															</span>
														)}
													</p>
												);
											})()}
										</div>
									)}
								</div>
								<p>{`${item.startTime} - ${item.endTime}`}</p>
								<p>{`Address: ${item.property.address}`}</p>
								<p>{`Postal Code: ${item.property.postalCode}`}</p>
								<p>{`Property ID: ${item.property.propertyId}`}</p>
								<p>{`Client ID: ${item.property.clientId}`}</p>

								{title === 'Current Schedule' &&
									item.arrivalImage === null && (
										<div>
											{/* Button to open arrival photo dialog */}
											<Button
												className="mt-3"
												onClick={() =>
													openPhotoDialog(item.id)
												}
											>
												Upload Arrival Photo
											</Button>
											<PhotoUploadDialog
												isOpen={isPhotoDialogOpen}
												onClose={handleClosePhotoDialog}
												endpoint={`http://localhost:8080/shifts/:shiftId/arrival-image`}
												shiftId={item.id}
												onUploadSuccess={(data) =>
													console.log(
														'Arrival photo uploaded:',
														data
													)
												}
											/>
										</div>
									)}
								{title === 'Current Schedule' &&
									item.arrivalImage != null && (
										<div>
											{/* Button to open completion photo dialog */}
											<Button
												className="mt-3"
												onClick={() =>
													openPhotoDialog(item.id)
												}
											>
												Upload Completion Photo
											</Button>
											<PhotoUploadDialog
												isOpen={isPhotoDialogOpen}
												onClose={handleClosePhotoDialog}
												endpoint={`http://localhost:8080/shifts/:shiftId/completion-image`}
												shiftId={item.id}
												onUploadSuccess={(data) =>
													console.log(
														'Completion photo uploaded:',
														data
													)
												}
											/>
										</div>
									)}
							</CardContent>
						</Card>
					))}
					{items.length === 0 && (
						<p className="text-muted-foreground">
							No shifts scheduled
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Shift</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this shift? Please
							provide a reason:
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Textarea
						value={cancelReason}
						onChange={(e) => setCancelReason(e.target.value)}
						placeholder="Enter reason for cancellation..."
						className="my-4"
					/>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCloseDialog}>
							Nevermind
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmCancel}
							disabled={!cancelReason.trim()}
						>
							Confirm Cancellation
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<ScheduleSection title="Current Schedule" items={current} />
			<ScheduleSection title="Upcoming Schedule" items={upcoming} />
			<ScheduleSection title="Past Schedule" items={past} />
		</div>
	);
};

export default WorkerSchedule;
