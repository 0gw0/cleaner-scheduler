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
import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { addDays, format } from 'date-fns';

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

	const validateDates = useCallback(() => {
		setError(null);

		const tomorrow = addDays(new Date(), 1);
		tomorrow.setHours(0, 0, 0, 0);

		if (mcStartDate) {
			const startDate = new Date(mcStartDate);
			startDate.setHours(0, 0, 0, 0);

			if (startDate < tomorrow) {
				setError('Start date must be at least tomorrow');
				return false;
			}

			if (mcEndDate) {
				const endDate = new Date(mcEndDate);
				endDate.setHours(0, 0, 0, 0);

				if (endDate < startDate) {
					setError('End date cannot be before start date');
					return false;
				}
			}
		}

		return true;
	}, [mcStartDate, mcEndDate]);

	// Update end date when start date changes
	useEffect(() => {
		if (mcStartDate) {
			// Only set end date if it's empty or less than start date
			const endDate = mcEndDate ? new Date(mcEndDate) : null;
			const startDate = new Date(mcStartDate);
			if (!endDate || endDate < startDate) {
				onEndDateChange(mcStartDate);
			}
		}
	}, [mcStartDate]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!showDialog) {
			onStartDateChange('');
			onEndDateChange('');
			setError(null);
		}
	}, [showDialog]);

	// Validate dates
	useEffect(() => {
		if (showDialog) {
			validateDates();
		}
	}, [validateDates, showDialog]);

	const getTomorrowDate = () => {
		const tomorrow = addDays(new Date(), 1);
		return format(tomorrow, 'yyyy-MM-dd');
	};

	const handleSubmit = () => {
		if (validateDates()) {
			onSubmit();
		}
	};

	return (
		<Dialog
			open={showDialog}
			onOpenChange={(open) => {
				if (!open) {
					setError(null);
				}
				onOpenChange(open);
			}}
		>
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
							min={getTomorrowDate()}
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
							min={mcStartDate || getTomorrowDate()}
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
