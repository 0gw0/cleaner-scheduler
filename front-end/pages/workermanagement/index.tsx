import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomPagination } from '@/components/CustomPagination';
import { WorkerCard } from '@/components/WorkerCard';
import { WorkerData, Shift, DialogState } from '@/types/workermanagement';
import { Dialogs } from '@/components/Dialogs';
import axios from 'axios';

// Helper function to validate shift data
const isValidShift = (shift: Shift): shift is Shift => {
	return (
		shift &&
		typeof shift === 'object' &&
		'id' in shift &&
		'property' in shift &&
		'date' in shift &&
		'startTime' in shift &&
		'endTime' in shift
	);
};

const WorkerManagement = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [workerData, setWorkerData] = useState<WorkerData[]>([]);
	const [filteredWorkers, setFilteredWorkers] = useState<WorkerData[]>([]);

	// Dialog states
	const [dialogState, setDialogState] = useState<DialogState>({
		showSchedule: false,
		showMCHistory: false,
	});
	const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(
		null
	);

	const workersPerPage = 9;

	// Fetch worker data and clean it
	useEffect(() => {
		const fetchWorkerData = async () => {
			try {
				const response = await axios.get<WorkerData[]>(
					`http://localhost:8080/workers`
				);

				// Clean and validate the worker data
				const cleanedData = response.data.map((worker) => ({
					...worker,
					shifts: Array.isArray(worker.shifts)
						? worker.shifts.filter(isValidShift)
						: [],
				}));

				setWorkerData(cleanedData);
				setFilteredWorkers(cleanedData);
			} catch (error) {
				console.error('Error fetching worker data:', error);
				setWorkerData([]);
				setFilteredWorkers([]);
			}
		};

		fetchWorkerData();
	}, []);

	const indexOfLastWorker = currentPage * workersPerPage;
	const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
	const currentWorkers = filteredWorkers.slice(
		indexOfFirstWorker,
		indexOfLastWorker
	);
	const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

	// Handle search filter
	useEffect(() => {
		const results = workerData.filter(
			(worker) =>
				worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				worker.bio.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredWorkers(results);
		setCurrentPage(1);
	}, [searchTerm, workerData]);

	const handleDialogOpen = (
		dialogType: keyof typeof dialogState,
		worker: WorkerData
	) => {
		// Clean the worker's shifts before setting
		const cleanedWorker = {
			...worker,
			shifts: Array.isArray(worker.shifts)
				? worker.shifts.filter(isValidShift)
				: [],
		};
		setSelectedWorker(cleanedWorker);
		setDialogState((prev) => ({
			...prev,
			[dialogType]: true,
		}));
	};

	const handleDialogClose = (dialogType: keyof typeof dialogState) => {
		setDialogState((prev) => ({
			...prev,
			[dialogType]: false,
		}));
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header and Search */}
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

			{/* Worker Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				{currentWorkers.map((worker) => (
					<WorkerCard
						key={worker.id}
						worker={worker}
						onActionClick={handleDialogOpen}
					/>
				))}
			</div>

			{/* Show message if no workers found */}
			{currentWorkers.length === 0 && (
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

			{/* Pagination */}
			{filteredWorkers.length > 0 && (
				<CustomPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}
		</div>
	);
};

export default WorkerManagement;
