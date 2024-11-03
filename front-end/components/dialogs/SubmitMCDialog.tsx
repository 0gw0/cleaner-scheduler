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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WorkerData } from '@/types/workermanagement';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MCDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	selectedWorker: WorkerData | null;
	mcStartDate: string;
	mcEndDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	onSubmit: () => void;
}

export const SubmitMCDialog = ({
	showDialog,
	onOpenChange,
	selectedWorker,
	mcStartDate,
	mcEndDate,
	onStartDateChange,
	onEndDateChange,
	onSubmit,
}: MCDialogProps) => {
	const [error, setError] = useState<string | null>(null);

	// Validate dates whenever they change
	useEffect(() => {
		validateDates();
	}, [mcStartDate, mcEndDate]);

	const validateDates = () => {
		// Reset error
		setError(null);

		// Get today's date at midnight for comparison
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (mcStartDate) {
			const startDate = new Date(mcStartDate);
			startDate.setHours(0, 0, 0, 0);

			// Check if start date is in the past
			if (startDate < today) {
				setError('Start date cannot be in the past');
				return false;
			}

			// If end date is set, validate the range
			if (mcEndDate) {
				const endDate = new Date(mcEndDate);
				endDate.setHours(0, 0, 0, 0);

				// Check if end date is before start date
				if (endDate < startDate) {
					setError('End date cannot be before start date');
					return false;
				}
			}
		}

		return true;
	};

	const handleSubmit = () => {
		if (validateDates()) {
			onSubmit();
		}
	};

	return (
		<Dialog open={showDialog} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Submit Medical Leave for {selectedWorker?.name}
					</DialogTitle>
					<DialogDescription>
						Submit a medical certificate for {selectedWorker?.name}.
						This will automatically handle shift reallocation.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<Label htmlFor="startDate">Start Date</Label>
						<Input
							id="startDate"
							type="date"
							value={mcStartDate}
							onChange={(e) => onStartDateChange(e.target.value)}
							className={
								error && error.includes('Start date')
									? 'border-red-500'
									: ''
							}
						/>
					</div>
					<div>
						<Label htmlFor="endDate">End Date</Label>
						<Input
							id="endDate"
							type="date"
							value={mcEndDate}
							onChange={(e) => onEndDateChange(e.target.value)}
							className={
								error && error.includes('End date')
									? 'border-red-500'
									: ''
							}
							min={mcStartDate} // Prevent selecting end date before start date
						/>
					</div>
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!!error || !mcStartDate || !mcEndDate}
					>
						Submit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
