import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomPagination } from '@/components/CustomPagination';
import { MCDialog } from '@/components/MCDialog';
import { WorkerCard } from '@/components/WorkerCard';
import { WorkerData, Shift } from '@/types/workermanagement';
import axios from 'axios';

const WorkerManagement = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [workerData, setWorkerData] = useState<WorkerData[]>([]);
	const [filteredWorkers, setFilteredWorkers] = useState<WorkerData[]>([]);
	const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(
		null
	);
	const [mcStartDate, setMcStartDate] = useState('');
	const [mcEndDate, setMcEndDate] = useState('');
	const [showMCDialog, setShowMCDialog] = useState(false);
	const [showReallocationDialog, setShowReallocationDialog] = useState(false);
	const [affectedShifts, setAffectedShifts] = useState<Shift[]>([]);

	const workersPerPage = 9;
	const router = useRouter();

	// Calculate pagination
	const indexOfLastWorker = currentPage * workersPerPage;
	const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
	const currentWorkers = filteredWorkers.slice(
		indexOfFirstWorker,
		indexOfLastWorker
	);
	const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

	// Fetch worker data
	useEffect(() => {
		const fetchWorkerData = async () => {
			try {
				const response = await axios.get<WorkerData[]>(
					'http://localhost:8080/workers'
				);
				const workers = response.data;
				console.log('Fetched workers:', workers);
				setWorkerData(workers);
				setFilteredWorkers(workers);
			} catch (error) {
				console.error('Error fetching worker data:', error);
				setWorkerData([]);
				setFilteredWorkers([]);
			}
		};

		fetchWorkerData();
	}, []);

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

	// Handle MC submission
	const handleSubmitMC = async () => {
		if (!selectedWorker || !mcStartDate || !mcEndDate) return;

		try {
			// Find affected shifts during MC period
			const affectedShifts = selectedWorker.shifts.filter((shift) => {
				const shiftDate = new Date(shift.date);
				const startDate = new Date(mcStartDate);
				const endDate = new Date(mcEndDate);
				return shiftDate >= startDate && shiftDate <= endDate;
			});

			// TODO: API call to submit MC
			// const response = await fetch('http://localhost:8080/medical-leave', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     workerId: selectedWorker.id,
			//     startDate: mcStartDate,
			//     endDate: mcEndDate,
			//     affectedShifts: affectedShifts.map(shift => shift.id)
			//   })
			// });

			setAffectedShifts(affectedShifts);
			setShowMCDialog(false);
			setShowReallocationDialog(true);
		} catch (error) {
			console.error('Error submitting MC:', error);
		}
	};

	// Handle view schedule
	const handleViewSchedule = (workerId: number) => {
		router.push(`/workerdashboard/${workerId}`);
	};

	// Handle submit MC button click
	const handleSubmitMCClick = (worker: WorkerData) => {
		setSelectedWorker(worker);
		setShowMCDialog(true);
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
						onSubmitMC={handleSubmitMCClick}
						onViewSchedule={handleViewSchedule}
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

			{/* Pagination */}
			{filteredWorkers.length > 0 && (
				<CustomPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			{/* Dialogs */}
			<MCDialog
				showDialog={showMCDialog}
				onOpenChange={setShowMCDialog}
				selectedWorker={selectedWorker}
				mcStartDate={mcStartDate}
				mcEndDate={mcEndDate}
				onStartDateChange={setMcStartDate}
				onEndDateChange={setMcEndDate}
				onSubmit={handleSubmitMC}
			/>
		</div>
	);
};

export default WorkerManagement;
