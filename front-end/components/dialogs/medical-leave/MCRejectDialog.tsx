import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MCRejectDialogProps {
	isOpen: boolean;
	leaveId: number | null;
	isUpdating: boolean;
	onClose: () => void;
	onConfirm: (leaveId: number) => Promise<void>;
}

export const MCRejectDialog = ({
	isOpen,
	leaveId,
	isUpdating,
	onClose,
	onConfirm,
}: MCRejectDialogProps) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reject Medical Leave?</AlertDialogTitle>
					<AlertDialogDescription>
						This will mark the MC as rejected. Are you sure you want
						to proceed?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isUpdating}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => leaveId && onConfirm(leaveId)}
						disabled={isUpdating}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isUpdating ? 'Rejecting...' : 'Reject MC'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
