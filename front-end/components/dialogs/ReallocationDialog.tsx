'use client';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReallocationDialogProps {
	showDialog: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ReallocationDialog = ({
	showDialog,
	onOpenChange,
}: ReallocationDialogProps) => {
	return (
		<Dialog open={showDialog} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Shift Reallocation</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p>Shifts are being reallocated to available workers...</p>
				</div>
				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
