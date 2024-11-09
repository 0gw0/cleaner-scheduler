'use client';

import { ScheduleDialog } from './dialogs/ScheduleDialog';
import { MCHistoryDialog } from './dialogs/MCHistoryDialog';
import { Dialog } from '@/components/ui/dialog';
import { WorkerData, DialogState } from '@/types/workermanagement';

interface DialogsProps {
	dialogState: DialogState;
	onClose: (dialogType: keyof DialogState) => void;
	selectedWorker: WorkerData | null;
}

export const Dialogs = ({
	dialogState,
	onClose,
	selectedWorker,
}: DialogsProps) => {
	// Helper function to handle dialog state changes
	const handleDialogChange = (dialogType: keyof DialogState) => () => {
		onClose(dialogType);
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
			/>
		</>
	);
};
