'use client';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { WorkerData } from '@/types/workermanagement';

interface MCHistoryDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	selectedWorker: WorkerData | null;
}

export const MCHistoryDialog = ({
	showDialog,
	onOpenChange,
	selectedWorker,
}: MCHistoryDialogProps) => {
	return (
		<Dialog open={showDialog} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Medical Leave Records</DialogTitle>
					<DialogDescription>
						View past medical certificates and leave records
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="rounded-lg border">
						<div className="grid grid-cols-3 gap-4 p-4 font-medium bg-muted">
							<div>Start Date</div>
							<div>End Date</div>
							<div>Status</div>
						</div>
						{selectedWorker?.medicalLeaves &&
						selectedWorker.medicalLeaves.length > 0 ? (
							<div className="divide-y">
								{selectedWorker.medicalLeaves.map(
									(mc, index) => {
										const startDate = new Date(
											mc.startDate
										);
										const endDate = new Date(mc.endDate);
										const isOngoing =
											new Date() >= startDate &&
											new Date() <= endDate;

										return (
											<div
												key={index}
												className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-muted/50"
											>
												<div>
													{format(
														startDate,
														'dd MMM yyyy'
													)}
												</div>
												<div>
													{format(
														endDate,
														'dd MMM yyyy'
													)}
												</div>
												<div>
													<span
														className={`px-2 py-1 rounded-full text-sm ${
															isOngoing
																? 'bg-green-100 text-green-700'
																: new Date() <
																  startDate
																? 'bg-yellow-100 text-yellow-700'
																: 'bg-gray-100 text-gray-700'
														}`}
													>
														{isOngoing
															? 'Ongoing'
															: new Date() <
															  startDate
															? 'Upcoming'
															: 'Completed'}
													</span>
												</div>
											</div>
										);
									}
								)}
							</div>
						) : (
							<div className="p-4 text-center text-gray-500">
								No medical leave records found.
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
