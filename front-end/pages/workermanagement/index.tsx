import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CustomPagination } from '@/components/CustomPagination';
import { WorkerCard } from '@/components/WorkerCard';
import { Dialogs } from '@/components/Dialogs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import {
	WorkerData,
	DialogState,
	MedicalLeave,
} from '@/types/workermanagement';

interface PendingMC {
	medicalLeave: MedicalLeave;
	isOverdue: boolean;
}

// Helper functions
const checkPendingMCDocuments = (worker: WorkerData): PendingMC[] => {
	const currentDate = new Date();

	return worker.medicalLeaves
		.filter((mc) => !mc.medicalCertificate)
		.map((mc) => ({
			medicalLeave: mc,
			isOverdue: new Date(mc.startDate) <= currentDate,
		}));
};

const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const WorkerManagement = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [workerData, setWorkerData] = useState<WorkerData[]>([]);
	const [workersWithPendingMC, setWorkersWithPendingMC] = useState<
		Map<number, PendingMC[]>
	>(new Map());

	const [dialogState, setDialogState] = useState<DialogState>({
		showSchedule: false,
		showMCHistory: false,
	});
	const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(
		null
	);

	const workersPerPage = 9;

	// Function to update pending MC status
	const updatePendingMCStatus = (data: WorkerData[]) => {
		const pendingMCMap = new Map<number, PendingMC[]>();
		data.forEach((worker) => {
			const pendingMCs = checkPendingMCDocuments(worker);
			if (pendingMCs.length > 0) {
				pendingMCMap.set(worker.id, pendingMCs);
			}
		});
		setWorkersWithPendingMC(pendingMCMap);
	};

	// Fetch worker data
	useEffect(() => {
		const fetchWorkerData = async () => {
			try {
				const response = await axios.get<WorkerData[]>(
					`http://localhost:8080/workers`
				);
				const cleanedData = response.data;
				setWorkerData(cleanedData);
				updatePendingMCStatus(cleanedData);
			} catch (error) {
				console.error('Error fetching worker data:', error);
				setWorkerData([]);
			}
		};

		fetchWorkerData();
	}, []);

	// Filter workers based on search
	const filteredWorkers = React.useMemo(() => {
		return workerData.filter(
			(worker) =>
				worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				worker.bio.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [searchTerm, workerData]);

	// Separate and sort workers
	const { pendingWorkers, otherWorkers } = React.useMemo(() => {
		const pending: WorkerData[] = [];
		const others: WorkerData[] = [];

		filteredWorkers.forEach((worker) => {
			const pendingMCs = workersWithPendingMC.get(worker.id) || [];
			if (pendingMCs.some((mc) => mc.isOverdue)) {
				pending.push(worker);
			} else {
				others.push(worker);
			}
		});

		return {
			pendingWorkers: pending.sort((a, b) =>
				a.name.localeCompare(b.name)
			),
			otherWorkers: others.sort((a, b) => a.name.localeCompare(b.name)),
		};
	}, [filteredWorkers, workersWithPendingMC]);

	// Pagination
	const totalWorkers = pendingWorkers.length + otherWorkers.length;
	const totalPages = Math.ceil(totalWorkers / workersPerPage);

	const handleDialogOpen = (
		dialogType: keyof DialogState,
		worker: WorkerData
	) => {
		setSelectedWorker(worker);
		setDialogState((prev) => ({
			...prev,
			[dialogType]: true,
		}));
	};

	const handleDialogClose = (dialogType: keyof DialogState) => {
		setDialogState((prev) => ({
			...prev,
			[dialogType]: false,
		}));
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Enhanced MC Alert with all pending submissions */}
			{workersWithPendingMC.size > 0 && (
				<Alert variant="destructive" className="mb-8">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle className="mb-2">
						Missing MC Documents
					</AlertTitle>
					<AlertDescription>
						<p className="mb-2">
							The following workers have not submitted their MC
							documents:
						</p>
						<ul className="list-disc pl-6 space-y-2">
							{Array.from(workersWithPendingMC.entries()).map(
								([workerId, pendingMCs]) => {
									const worker = workerData.find(
										(w) => w.id === workerId
									);
									return (
										<li key={workerId}>
											<span className="font-medium">
												{worker?.name}
											</span>
											<ul className="list-[circle] pl-6 mt-1 space-y-1">
												{pendingMCs.map((mc, index) => (
													<li
														key={`${workerId}-${index}`}
														className="text-sm"
													>
														{formatDate(
															mc.medicalLeave
																.startDate
														)}{' '}
														to{' '}
														{formatDate(
															mc.medicalLeave
																.endDate
														)}
														{mc.isOverdue && (
															<Badge
																variant="destructive"
																className="ml-2"
															>
																Overdue
															</Badge>
														)}
													</li>
												))}
											</ul>
										</li>
									);
								}
							)}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{/* Rest of the component remains the same */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold">Worker Management</h1>
				<div className="relative w-64">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
					<Input
						placeholder="Search workers..."
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Pending MC Workers Section */}
			{pendingWorkers.length > 0 && (
				<>
					<div className="mb-4">
						<h2 className="text-lg font-semibold text-red-600 mb-4">
							Workers with Overdue MC Documents
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
							{pendingWorkers.map((worker) => (
								<WorkerCard
									key={worker.id}
									worker={worker}
									onActionClick={(
										action: keyof DialogState
									) => handleDialogOpen(action, worker)}
									hasPendingMC={true}
								/>
							))}
						</div>
					</div>

					<Separator className="my-8" />
				</>
			)}

			{/* Other Workers Section */}
			<div>
				<h2 className="text-lg font-semibold mb-4">All Workers</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{otherWorkers.map((worker) => (
						<WorkerCard
							key={worker.id}
							worker={worker}
							onActionClick={(action: keyof DialogState) =>
								handleDialogOpen(action, worker)
							}
							hasPendingMC={false}
						/>
					))}
				</div>
			</div>

			{totalWorkers === 0 && (
				<div className="text-center py-8 text-gray-500">
					No workers found.{' '}
					{searchTerm && 'Try adjusting your search.'}
				</div>
			)}

			<Dialogs
				dialogState={dialogState}
				onClose={handleDialogClose}
				selectedWorker={selectedWorker}
			/>

			{totalWorkers > 0 && (
				<div className="mt-8">
					<CustomPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</div>
			)}
		</div>
	);
};

export default WorkerManagement;
