'use client';

import React, { useState, useCallback } from 'react';
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
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { WorkerData } from './types';
import { getMCStatus } from './utils';
import { MCRejectDialog } from './MCRejectDialog';
import { MCTableRow } from './MCTableRow';

interface MCHistoryDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
	selectedWorker: WorkerData | null;
	onApprovalUpdate: (
		workerId: number,
		leaveId: number,
		approved: boolean
	) => Promise<void>;
}

export function MCHistoryDialog({
	showDialog,
	onOpenChange,
	selectedWorker,
	onApprovalUpdate,
}: MCHistoryDialogProps) {
	const [showRejectDialog, setShowRejectDialog] = useState<{
		show: boolean;
		leaveId: number | null;
	}>({ show: false, leaveId: null });
	const [isUpdating, setIsUpdating] = useState(false);

	const handleApprovalUpdate = useCallback(
		async (leaveId: number, approved: boolean) => {
			if (!selectedWorker) return;

			setIsUpdating(true);
			try {
				await onApprovalUpdate(selectedWorker.id, leaveId, approved);
			} finally {
				setShowRejectDialog({ show: false, leaveId: null });
				setIsUpdating(false);
			}
		},
		[selectedWorker, onApprovalUpdate]
	);

	const handleReject = useCallback((leaveId: number) => {
		setShowRejectDialog({ show: true, leaveId });
	}, []);

	const handleConfirmReject = useCallback(
		async (leaveId: number) => {
			await handleApprovalUpdate(leaveId, false);
		},
		[handleApprovalUpdate]
	);

	// Pre-sort medical leaves by date (most recent first)
	const sortedGroupedLeaves = React.useMemo(() => {
		const leaves =
			selectedWorker?.medicalLeaves.reduce(
				(
					groups: {
						[key: string]: typeof selectedWorker.medicalLeaves;
					},
					leave
				) => {
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

		// Sort each month's leaves by date
		Object.keys(leaves).forEach((monthYear) => {
			leaves[monthYear].sort(
				(a, b) =>
					new Date(b.startDate).getTime() -
					new Date(a.startDate).getTime()
			);
		});

		// Sort the months themselves
		return Object.entries(leaves).sort(([monthYearA], [monthYearB]) => {
			const dateA = new Date(monthYearA);
			const dateB = new Date(monthYearB);
			return dateB.getTime() - dateA.getTime();
		});
	}, [selectedWorker?.medicalLeaves]);

	return (
		<>
			<Dialog open={showDialog} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Medical Leave Records</DialogTitle>
						<DialogDescription>
							View and manage medical certificates and leave
							records
						</DialogDescription>
					</DialogHeader>

					{sortedGroupedLeaves.map(([monthYear, monthLeaves]) => (
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
										<TableHead>Leave Period</TableHead>
										<TableHead>MC Status</TableHead>
										<TableHead className="text-center">
											Actions
										</TableHead>
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
											<MCTableRow
												key={leave.id}
												leave={leave}
												status={status}
												duration={duration}
												isUpdating={isUpdating}
												onReject={handleReject}
												onApprove={(leaveId) =>
													handleApprovalUpdate(
														leaveId,
														true
													)
												}
											/>
										);
									})}
								</TableBody>
							</Table>
						</div>
					))}

					{(!selectedWorker?.medicalLeaves ||
						selectedWorker.medicalLeaves.length === 0) && (
						<div className="text-center py-8 text-gray-500">
							No medical leave records found.
						</div>
					)}
				</DialogContent>
			</Dialog>

			<MCRejectDialog
				isOpen={showRejectDialog.show}
				leaveId={showRejectDialog.leaveId}
				isUpdating={isUpdating}
				onClose={() =>
					setShowRejectDialog({ show: false, leaveId: null })
				}
				onConfirm={handleConfirmReject}
			/>
		</>
	);
}
