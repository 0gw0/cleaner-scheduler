import { Phone, Calendar, FileText, Building, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shift, WorkerCardProps } from '@/types/workermanagement';
import { format } from 'date-fns';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
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

interface AnnualLeave {
	id: number;
	startDate: string;
	endDate: string;
	status: string;
}

export const WorkerCard = ({ worker, onActionClick }: WorkerCardProps) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isAnnualLeavesDialogOpen, setIsAnnualLeavesDialogOpen] =
		useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [annualLeaves, setAnnualLeaves] = useState<AnnualLeave[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedLeave, setSelectedLeave] = useState<{
		id: number;
		action: 'APPROVED' | 'REJECTED';
	} | null>(null);
	const [formData, setFormData] = useState({
		name: worker.name,
		phoneNumber: worker.phoneNumber,
		bio: worker.bio,
		status: worker.status,
	});
	const { toast } = useToast();

	const fetchAnnualLeaves = async () => {
		setIsLoading(true);
		try {
			const response = await axios.get(
				`http://localhost:8080/workers/${worker.id}/annual-leaves`
			);
			setAnnualLeaves(response.data);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to fetch annual leaves',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAnnualLeaveAction = async (
		leaveId: number,
		action: 'APPROVED' | 'REJECTED'
	) => {
		try {
			await axios.patch(
				`http://localhost:8080/workers/${worker.id}/annual-leaves/${leaveId}`,
				{ status: action }
			);

			setAnnualLeaves((prevLeaves) =>
				prevLeaves.map((leave) =>
					leave.id === leaveId ? { ...leave, status: action } : leave
				)
			);

			toast({
				title: 'Success',
				description: `Annual leave ${action.toLowerCase()} successfully`,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: `Failed to ${action.toLowerCase()} annual leave`,
				variant: 'destructive',
			});
		}
		setSelectedLeave(null);
	};
	// Calculate active MC count
	const activeMCCount = worker.medicalLeaves.filter(
		(leave) => new Date(leave.endDate) >= new Date()
	).length;

	// Get the next scheduled shift
	const getNextShift = (shifts: Shift[]): Shift | null => {
		const futureShifts = shifts
			.filter((shift) => new Date(shift.date) > new Date())
			.sort(
				(a, b) =>
					new Date(a.date).getTime() - new Date(b.date).getTime()
			);
		return futureShifts[0] || null;
	};

	const nextShift = getNextShift(worker.shifts);

	// Format the next shift date and time
	const formatNextShift = (shift: Shift | null): string => {
		if (!shift) return 'None scheduled';

		const shiftDate = new Date(shift.date);
		return `${format(shiftDate, 'dd MMM yyyy')} ${shift.startTime.slice(
			0,
			5
		)}-${shift.endTime.slice(0, 5)}`;
	};

	// Calculate worker status
	const getWorkerStatus = () => {
		const currentMC = worker.medicalLeaves.find((leave) => {
			const now = new Date();
			return (
				new Date(leave.startDate) <= now &&
				new Date(leave.endDate) >= now
			);
		});

		if (currentMC) {
			return {
				label: 'On MC',
				className: 'bg-red-100 text-red-800',
			};
		}

		const currentShift = worker.shifts.find((shift) => {
			const shiftDate = new Date(shift.date);
			const now = new Date();
			return (
				shiftDate.getDate() === now.getDate() &&
				shiftDate.getMonth() === now.getMonth() &&
				shiftDate.getFullYear() === now.getFullYear()
			);
		});

		if (currentShift) {
			return {
				label: 'On Duty',
				className: 'bg-green-100 text-green-800',
			};
		}

		return {
			label: 'Available',
			className: 'bg-gray-100 text-gray-800',
		};
	};

	const status = getWorkerStatus();

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleUpdateWorker = async () => {
		setIsUpdating(true);
		try {
			await axios.patch(
				`http://localhost:8080/workers/${worker.id}`,
				formData
			);
			Object.assign(worker, formData);

			setIsDialogOpen(false);
			toast({
				title: 'Success',
				description: 'Worker details updated successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update worker details',
				variant: 'destructive',
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleScheduleClick = () => {
		onActionClick('showSchedule', worker);
	};

	const handleMCHistoryClick = () => {
		onActionClick('showMCHistory', worker);
	};

	return (
		<Card className="hover:shadow-lg transition-shadow duration-200">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex flex-col">
					<CardTitle className="text-lg font-semibold">
						{worker.name}
					</CardTitle>
					<div className="flex items-center gap-2 mt-1">
						<Phone className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-600">
							{worker.phoneNumber}
						</span>
					</div>
				</div>
				<Badge className={status.className}>{status.label}</Badge>
			</CardHeader>

			<CardContent className="p-0">
				{/* Content section with padding */}
				<div className="px-6 pb-4 space-y-4">
					{/* Worker Bio */}
					<p className="text-sm text-gray-600 line-clamp-2">
						{worker.bio}
					</p>

					{/* Worker Stats */}
					<div className="grid grid-cols-3 gap-2 text-sm">
						<div className="flex items-center gap-1 text-gray-600">
							<Building className="w-4 h-4" />
							<span className="truncate">ID: {worker.id}</span>
						</div>
						<div className="flex items-center gap-1 text-gray-600">
							<Calendar className="w-4 h-4" />
							<span className="truncate">
								Shifts: {worker.shifts.length}
							</span>
						</div>
						<div className="flex items-center gap-1 text-gray-600">
							<Building className="w-4 h-4" />
							<span className="truncate">
								Status: {worker.status}
							</span>
						</div>
					</div>

					{/* Next Shift Information */}
					<div className="text-sm text-gray-600">
						<div className="flex justify-between items-center">
							<span className="font-medium">Next Shift:</span>
							<span>{formatNextShift(nextShift)}</span>
						</div>
					</div>
				</div>

				{/* Action Buttons Section */}
				<div className="border-t divide-y">
					{/* First Row - MC History and Annual Leave */}
					<div className="grid grid-cols-2 divide-x">
						<Button
							variant="ghost"
							onClick={handleMCHistoryClick}
							className="h-11 rounded-none hover:bg-gray-50"
						>
							<FileText className="w-4 h-4 mr-2" />
							<span className="truncate">
								MCs ({activeMCCount})
							</span>
						</Button>

						<Dialog
							open={isAnnualLeavesDialogOpen}
							onOpenChange={(open) => {
								setIsAnnualLeavesDialogOpen(open);
								if (open) fetchAnnualLeaves();
							}}
						>
							<DialogTrigger asChild>
								<Button
									variant="ghost"
									className="h-11 rounded-none hover:bg-gray-50"
								>
									<Briefcase className="w-4 h-4 mr-2" />
									Annual Leave
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[600px]">
								<DialogHeader>
									<DialogTitle>
										Annual Leaves Management
									</DialogTitle>
								</DialogHeader>
								<div className="py-4">
									{isLoading ? (
										<div className="text-center py-4">
											Loading annual leaves...
										</div>
									) : annualLeaves.length === 0 ? (
										<div className="text-center py-4">
											No annual leaves found
										</div>
									) : (
										<div className="space-y-4">
											{annualLeaves.map((leave) => (
												<div
													key={leave.id}
													className="flex items-center justify-between p-4 rounded-lg border"
												>
													<div className="space-y-1">
														<div className="font-medium">
															{format(
																new Date(
																	leave.startDate
																),
																'dd MMM yyyy'
															)}{' '}
															-{' '}
															{format(
																new Date(
																	leave.endDate
																),
																'dd MMM yyyy'
															)}
														</div>
														<Badge
															variant={
																leave.status ===
																'PENDING'
																	? 'outline'
																	: leave.status ===
																	  'APPROVED'
																	? 'default'
																	: 'destructive'
															}
														>
															{leave.status}
														</Badge>
													</div>
													{leave.status ===
														'PENDING' && (
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="default"
																onClick={() =>
																	setSelectedLeave(
																		{
																			id: leave.id,
																			action: 'APPROVED',
																		}
																	)
																}
															>
																Approve
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={() =>
																	setSelectedLeave(
																		{
																			id: leave.id,
																			action: 'REJECTED',
																		}
																	)
																}
															>
																Reject
															</Button>
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</DialogContent>
						</Dialog>
					</div>

					{/* Schedule Button */}
					<Button
						variant="ghost"
						onClick={handleScheduleClick}
						className="w-full h-11 rounded-none hover:bg-gray-50"
					>
						<Calendar className="w-4 h-4 mr-2" />
						<span>Schedule</span>
					</Button>

					{/* Modify Worker Details Button */}
					<Button
						variant="ghost"
						onClick={() => setIsDialogOpen(true)}
						className="w-full h-11 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
					>
						Modify Worker Details
					</Button>
				</div>
			</CardContent>

			{/* Edit Worker Details Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Worker Details</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								name="phoneNumber"
								value={formData.phoneNumber}
								onChange={handleInputChange}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								name="bio"
								value={formData.bio}
								onChange={handleInputChange}
								className="h-20"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="status">Status</Label>
							<Input
								id="status"
								name="status"
								value={formData.status}
								onChange={handleInputChange}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							className="mr-2"
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateWorker}
							disabled={isUpdating}
						>
							{isUpdating ? 'Updating...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Annual Leave Action Confirmation Dialog */}
			<AlertDialog
				open={selectedLeave !== null}
				onOpenChange={(open) => !open && setSelectedLeave(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Action</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to{' '}
							{selectedLeave?.action.toLowerCase()} this annual
							leave request?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (selectedLeave) {
									handleAnnualLeaveAction(
										selectedLeave.id,
										selectedLeave.action
									);
								}
							}}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
};
