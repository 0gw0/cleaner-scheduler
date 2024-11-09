'use client';

import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
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
import { format } from 'date-fns';
import { WorkerData, MedicalLeave } from '@/types/workermanagement';

interface MCHistoryDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	selectedWorker: WorkerData | null;
}

export function MCHistoryDialog({
	showDialog,
	onOpenChange,
	selectedWorker,
}: MCHistoryDialogProps) {
	const getMCStatus = (startDate: Date, endDate: Date) => {
		const now = new Date();

		const isPast = endDate < now;
		const isUpcoming = startDate > now;
		const isOngoing = now >= startDate && now <= endDate;

		if (isPast) {
			return {
				label: 'COMPLETED',
				className: 'bg-green-100 text-green-800',
			};
		} else if (isUpcoming) {
			return {
				label: 'UPCOMING',
				className: 'bg-blue-100 text-blue-800',
			};
		} else if (isOngoing) {
			return {
				label: 'INPROGRESS',
				className: 'bg-yellow-100 text-yellow-800',
			};
		}

		return {
			label: 'UNKNOWN',
			className: 'bg-gray-100 text-gray-800',
		};
	};

	// Group medical leaves by month and year
	const groupedLeaves =
		selectedWorker?.medicalLeaves.reduce(
			(groups: { [key: string]: MedicalLeave[] }, leave) => {
				const date = new Date(leave.startDate);
				const monthYear = date.toLocaleString('default', {
					month: 'long',
					year: 'numeric',
				});

				if (!groups[monthYear]) {
					groups[monthYear] = [];
				}
				groups[monthYear].push(leave);
				return groups;
			},
			{}
		) || {};

	return (
		<Dialog open={showDialog} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Medical Leave Records</DialogTitle>
					<DialogDescription>
						View past medical certificates and leave records
					</DialogDescription>
				</DialogHeader>

				{Object.entries(groupedLeaves).map(
					([monthYear, monthLeaves]) => (
						<div key={monthYear} className="mb-6">
							<h3 className="font-semibold text-lg mb-3">
								{monthYear}
							</h3>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Start Date</TableHead>
										<TableHead>End Date</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Approval</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{monthLeaves.map((leave) => {
										const startDate = new Date(
											leave.startDate
										);
										const endDate = new Date(leave.endDate);
										const status = getMCStatus(
											startDate,
											endDate
										);
										const duration =
											Math.ceil(
												(endDate.getTime() -
													startDate.getTime()) /
													(1000 * 60 * 60 * 24)
											) + 1;

										return (
											<TableRow key={leave.id}>
												<TableCell>
													{format(
														startDate,
														'EEE, d MMM'
													)}
												</TableCell>
												<TableCell>
													{format(
														endDate,
														'EEE, d MMM'
													)}
												</TableCell>
												<TableCell>
													{duration} day
													{duration !== 1 ? 's' : ''}
												</TableCell>
												<TableCell>
													<Badge
														className={
															status.className
														}
													>
														{status.label}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={
															leave.approved
																? 'bg-green-100 text-green-800'
																: 'bg-red-100 text-red-800'
														}
													>
														{leave.approved
															? 'APPROVED'
															: 'PENDING'}
													</Badge>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)
				)}

				{(!selectedWorker?.medicalLeaves ||
					selectedWorker.medicalLeaves.length === 0) && (
					<div className="text-center py-8 text-gray-500">
						No medical leave records found.
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
