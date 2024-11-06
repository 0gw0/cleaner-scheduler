'use client';

import { SubmitMCDialog } from './dialogs/SubmitMCDialog';
import { ScheduleDialog } from './dialogs/ScheduleDialog';
import { MCHistoryDialog } from './dialogs/MCHistoryDialog';
import { ReallocationDialog } from './dialogs/ReallocationDialog';
import { Dialog } from '@/components/ui/dialog';
import {
	WorkerData,
	DialogState,
	ReallocationResult,
} from '@/types/workermanagement';

interface DialogsProps {
	dialogState: DialogState;
	onClose: (dialogType: keyof DialogState) => void;
	selectedWorker: WorkerData | null;
	mcDates: {
		startDate: string;
		endDate: string;
	};
	onMCDatesChange: (dates: { startDate: string; endDate: string }) => void;
	onSubmitMC: () => void;
	reallocationResults: ReallocationResult[]; // New prop
	onFinalClose: () => void; // New prop
}

export const Dialogs = ({
	dialogState,
	onClose,
	selectedWorker,
	mcDates,
	onMCDatesChange,
	onSubmitMC,
	reallocationResults,
	onFinalClose,
}: DialogsProps) => {
	// Helper function to handle dialog state changes
	const handleDialogChange = (dialogType: keyof DialogState) => () => {
		if (dialogType === 'showReallocation') {
			onFinalClose();
		} else {
			onClose(dialogType);
		}
	};

	return (
		<>
			<SubmitMCDialog
				showDialog={dialogState.showMC}
				onOpenChange={handleDialogChange('showMC')}
				selectedWorker={selectedWorker}
				mcStartDate={mcDates.startDate}
				mcEndDate={mcDates.endDate}
				onStartDateChange={(date) =>
					onMCDatesChange({ ...mcDates, startDate: date })
				}
				onEndDateChange={(date) =>
					onMCDatesChange({ ...mcDates, endDate: date })
				}
				onSubmit={onSubmitMC}
			/>

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

			<ReallocationDialog
				showDialog={dialogState.showReallocation}
				onOpenChange={handleDialogChange('showReallocation')}
				reallocationResults={reallocationResults}
				onClose={onFinalClose}
			/>
		</>
	);
};
