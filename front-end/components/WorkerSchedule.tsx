import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import PhotoUploadDialog from './PhotoUploadDialog';
import { Shift } from '@/types/dashboard';
import { WorkerData } from '@/types/dashboard';

interface PhotoUploadResponse {
	shift: Shift;
	imageUrl: string;
	message: string;
}

interface WorkerScheduleProps {
	schedule: Shift[];
	onScheduleUpdate: () => Promise<WorkerData | undefined>;
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
	const [isUpdating, setIsUpdating] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);

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
			{ past: [], current: [], upcoming: [] } as Record<string, Shift[]>
		);
	};

	const handleOpenPhotoDialog = (
		shiftId: number,
		type: 'arrival' | 'completion'
	) => {
		setSelectedShiftId(shiftId);
		setUploadType(type);
		setIsPhotoDialogOpen(true);
		setStatusMessage(null);
	};

	const handleClosePhotoDialog = () => {
		setIsPhotoDialogOpen(false);
		setSelectedShiftId(null);
	};

	const handlePhotoUploadSuccess = async (response: PhotoUploadResponse) => {
		try {
			setIsUpdating(true);
			await onScheduleUpdate();

			setStatusMessage({
				type: 'success',
				message:
					response.message ||
					`${
						uploadType === 'arrival' ? 'Arrival' : 'Completion'
					} photo uploaded successfully!`,
			});

			setTimeout(() => {
				setStatusMessage(null);
			}, 3000);
		} catch (error) {
			console.error('Error updating schedule:', error);

			setStatusMessage({
				type: 'error',
				message: 'Failed to upload photo. Please try again.',
			});
		} finally {
			setIsUpdating(false);
			handleClosePhotoDialog();
		}
	};

	const ScheduleSection = ({
		title,
		items,
	}: {
		title: string;
		items: Shift[];
	}) => (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Status Message */}
				{statusMessage && (
					<div
						className={`mb-4 p-3 rounded-md ${
							statusMessage.type === 'success'
								? 'bg-green-100 text-green-800 border border-green-200'
								: 'bg-red-100 text-red-800 border border-red-200'
						}`}
					>
						{statusMessage.message}
					</div>
				)}

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => {
						const isWorkerPresent =
							item.presentWorkers?.includes(workerId);
						const hasCompletionImage =
							item.completionImages?.length > 0;
						const hasArrivalImage = item.arrivalImages?.length > 0;

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

									{/* Photo Upload Status */}
									<div className="mt-2 space-y-1">
										{hasArrivalImage && (
											<div className="flex items-center text-sm text-green-600">
												<CheckCircle2 className="h-4 w-4 mr-1" />
												Arrival photo uploaded
											</div>
										)}
										{hasCompletionImage && (
											<div className="flex items-center text-sm text-green-600">
												<CheckCircle2 className="h-4 w-4 mr-1" />
												Completion photo uploaded
											</div>
										)}
									</div>

									{title === 'Current Schedule' &&
										!hasCompletionImage && (
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
														disabled={isUpdating}
													>
														Upload Arrival Photo
													</Button>
												)}
												{isWorkerPresent &&
													!hasCompletionImage && (
														<Button
															onClick={() =>
																handleOpenPhotoDialog(
																	item.id,
																	'completion'
																)
															}
															className="w-full"
															disabled={
																isUpdating
															}
														>
															Upload Completion
															Photo
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
