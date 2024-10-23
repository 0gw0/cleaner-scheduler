import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WorkerData } from '@/types/workermanagement';

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

export const MCDialog = ({
	showDialog,
	onOpenChange,
	selectedWorker,
	mcStartDate,
	mcEndDate,
	onStartDateChange,
	onEndDateChange,
	onSubmit,
}: MCDialogProps) => (
	<Dialog open={showDialog} onOpenChange={onOpenChange}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					Submit Medical Leave for {selectedWorker?.name}
				</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
				<div>
					<Label htmlFor="startDate">Start Date</Label>
					<Input
						id="startDate"
						type="date"
						value={mcStartDate}
						onChange={(e) => onStartDateChange(e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="endDate">End Date</Label>
					<Input
						id="endDate"
						type="date"
						value={mcEndDate}
						onChange={(e) => onEndDateChange(e.target.value)}
					/>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button onClick={onSubmit}>Submit</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
