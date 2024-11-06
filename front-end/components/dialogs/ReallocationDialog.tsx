'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarDays, Clock, ArrowRightCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ReallocationResult {
	originalWorker: string;
	replacementWorker: string;
	shiftDate: string;
	shiftTime: string;
}

interface ReallocationDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	reallocationResults: ReallocationResult[];
	onClose: () => void;
}

export const ReallocationDialog = ({
	showDialog,
	onOpenChange,
	reallocationResults,
	onClose,
}: ReallocationDialogProps) => {
	const formatDate = (dateStr: string) => {
		try {
			return format(new Date(dateStr), 'EEEE, MMMM do, yyyy');
		} catch {
			return dateStr;
		}
	};

	// Handle all close events
	const handleClose = () => {
		onClose(); // This will trigger the refresh
	};

	return (
		<Dialog
			open={showDialog}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
				onOpenChange(open);
			}}
		>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-center mb-4">
						Shift Reallocation Summary
					</DialogTitle>
					<DialogDescription>Shift Reallocation</DialogDescription>
				</DialogHeader>

				<div className="py-4 max-h-[60vh] overflow-y-auto space-y-4">
					{reallocationResults.length > 0 ? (
						reallocationResults.map((result, index) => (
							<Card key={index} className="p-4 shadow-sm">
								<div className="grid grid-cols-1 gap-3">
									<div className="flex items-center gap-2 text-gray-600">
										<CalendarDays className="h-4 w-4" />
										<span className="font-medium">
											{formatDate(result.shiftDate)}
										</span>
									</div>

									<div className="flex items-center gap-2 text-gray-600">
										<Clock className="h-4 w-4" />
										<span>{result.shiftTime}</span>
									</div>

									<div className="flex items-center gap-3 mt-2">
										<div className="flex-1">
											<div className="text-sm text-gray-500">
												Original Worker
											</div>
											<div className="font-semibold">
												{result.originalWorker}
											</div>
										</div>

										<ArrowRightCircle className="h-5 w-5 text-blue-500" />

										<div className="flex-1">
											<div className="text-sm text-gray-500">
												Reassigned To
											</div>
											<div className="font-semibold text-blue-600">
												{result.replacementWorker}
											</div>
										</div>
									</div>
								</div>
							</Card>
						))
					) : (
						<div className="text-center text-gray-500 py-8">
							No shifts were reassigned.
						</div>
					)}
				</div>

				<DialogFooter className="mt-6">
					<Button onClick={handleClose} className="w-full sm:w-auto">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
