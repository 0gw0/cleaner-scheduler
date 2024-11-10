'use client';

import { Dialog } from '@/components/ui/dialog';
import { ScheduleDialog } from './dialogs/ScheduleDialog';
import { MCHistoryDialog } from './dialogs/medical-leave/MCHistoryDialog';
import { WorkerData, DialogState } from '@/types/workermanagement';

interface DialogsProps {
	dialogState: DialogState;
	onClose: (dialogType: keyof DialogState) => void;
	selectedWorker: WorkerData | null;
	refreshWorkerData: () => Promise<void>;
}

export const Dialogs = ({
	dialogState,
	onClose,
	selectedWorker,
	refreshWorkerData,
}: DialogsProps) => {
	// Helper function to handle dialog state changes
	const handleDialogChange = (dialogType: keyof DialogState) => () => {
		onClose(dialogType);
	};

	const handleApprovalUpdate = async (
		workerId: number,
		leaveId: number,
		approved: boolean
	) => {
		try {
			const response = await fetch(
				`http://localhost:8080/workers/${workerId}/medical-leaves/${leaveId}?approved=${approved}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update approval status');
			}

			await refreshWorkerData();
		} catch (error) {
			console.error('Error updating approval:', error);
		}
	};

	return (
		<>
			<Dialog
				open={dialogState.showSchedule}
				onOpenChange={handleDialogChange('showSchedule')}
			>
				<ScheduleDialog shifts={selectedWorker?.shifts || []} />
			</Dialog>

			<MCHistoryDialog
				showDialog={dialogState.showMCHistory}
				onOpenChange={handleDialogChange('showMCHistory')}
				selectedWorker={selectedWorker}
				onApprovalUpdate={handleApprovalUpdate}
			/>
		</>
	);
};
