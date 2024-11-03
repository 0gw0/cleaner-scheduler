import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomPagination } from '@/components/CustomPagination';
import { WorkerCard } from '@/components/WorkerCard';
import {
	WorkerData,
	Shift,
	AvailableWorker,
	DialogState,
} from '@/types/workermanagement';
import { Dialogs } from '@/components/Dialogs';
import axios from 'axios';

const WorkerManagement = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [workerData, setWorkerData] = useState<WorkerData[]>([]);
	const [filteredWorkers, setFilteredWorkers] = useState<WorkerData[]>([]);
	const [supervisorId, setSupervisorId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Dialog states
	const [dialogState, setDialogState] = useState<DialogState>({
		showMC: false,
		showSchedule: false,
		showMCHistory: false,
		showReallocation: false,
	});
	const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(
		null
	);
	const [mcDates, setMcDates] = useState({
		startDate: '',
		endDate: '',
	});

	const workersPerPage = 9;

	// Get supervisor ID from localStorage when component mounts
	useEffect(() => {
		const userStr = localStorage.getItem('user');
		if (userStr) {
			try {
				const userData = JSON.parse(userStr);
				if (userData.id) {
					setSupervisorId(userData.id);
				}
			} catch (error) {
				console.error('Error parsing user data:', error);
			}
		}
	}, []);

	// Fetch worker data
	useEffect(() => {
		const fetchWorkerData = async () => {
			if (!supervisorId) return;

			try {
				const response = await axios.get<WorkerData[]>(
					`http://localhost:8080/workers?supervisorId=${supervisorId}`
				);
				setWorkerData(response.data);
				setFilteredWorkers(response.data);
			} catch (error) {
				console.error('Error fetching worker data:', error);
				setWorkerData([]);
				setFilteredWorkers([]);
			}
		};

		fetchWorkerData();
	}, [supervisorId]);

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
		setSelectedWorker(worker);
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
		if (dialogType === 'showMC') {
			setMcDates({ startDate: '', endDate: '' });
		}
	};

	// Helper function to sort workers by travel time
	const getBestWorker = (
		workers: AvailableWorker[]
	): AvailableWorker | null => {
		if (workers.length === 0) return null;
		return workers.reduce((best, current) => {
			return current.travelTimeToTarget.totalTravelTime <
				best.travelTimeToTarget.totalTravelTime
				? current
				: best;
		});
	};

	// Handle MC submission
	const handleSubmitMC = async () => {
		if (
			!selectedWorker ||
			!mcDates.startDate ||
			!mcDates.endDate ||
			isSubmitting
		)
			return;

		setIsSubmitting(true);
		try {
			console.log('1. Submitting MC with data:', {
				workerId: selectedWorker.id,
				startDate: mcDates.startDate,
				endDate: mcDates.endDate,
			});

			const mcResponse = await fetch(
				`http://localhost:8080/workers/${selectedWorker.id}/medical-leaves`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						startDate: mcDates.startDate,
						endDate: mcDates.endDate,
					}),
				}
			);

			if (!mcResponse.ok) {
				console.error(
					'MC submission failed with status:',
					mcResponse.status
				);
				throw new Error(`HTTP error! status: ${mcResponse.status}`);
			}

			const updatedWorker = await mcResponse.json();
			console.log(
				'MC submission successful. Updated worker data:',
				updatedWorker
			);

			const affectedShifts = updatedWorker.shifts.filter(
				(shift: Shift) => {
					const shiftDate = new Date(shift.date);
					const startDate = new Date(mcDates.startDate);
					const endDate = new Date(mcDates.endDate);
					return shiftDate >= startDate && shiftDate <= endDate;
				}
			);

			console.log('2. Affected shifts found:', affectedShifts);

			if (affectedShifts.length > 0) {
				for (const shift of affectedShifts) {
					// Changed to for...of loop for better async handling
					try {
						const availableWorkersRequestBody = {
							postalCode: shift.property.postalCode,
							startTime: shift.startTime,
							endTime: shift.endTime,
							date: shift.date,
						};

						console.log(
							'3. Fetching available workers with data:',
							availableWorkersRequestBody
						);

						const availableWorkersResponse = await fetch(
							'http://localhost:8080/shifts/available-workers',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(
									availableWorkersRequestBody
								),
							}
						);

						const responseText =
							await availableWorkersResponse.text();
						console.log('Raw response:', responseText);

						if (!availableWorkersResponse.ok) {
							console.error(
								'Failed to fetch available workers:',
								availableWorkersResponse.status,
								responseText
							);
							continue; // Skip to next shift instead of throwing
						}

						// Try parsing the response as JSON
						let availableWorkers;
						try {
							availableWorkers = JSON.parse(responseText);
							console.log(
								'4. Available workers found:',
								availableWorkers
							);
						} catch (e) {
							console.error(
								'Failed to parse available workers response:',
								e
							);
							continue;
						}

						const bestWorker = getBestWorker(availableWorkers);
						console.log('5. Selected best worker:', bestWorker);

						if (bestWorker) {
							const assignmentRequestBody = {
								frequency: {
									interval: 1,
									unit: 'DAYS',
								},
								startDate: shift.date,
								endDate: shift.date,
								startTime: shift.startTime,
								endTime: shift.endTime,
								propertyId: shift.property.propertyId,
							};

							console.log(
								'6. Attempting to assign shift with data:',
								assignmentRequestBody
							);

							const assignmentResponse = await fetch(
								`http://localhost:8080/workers/${bestWorker.id}/shifts`,
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify(assignmentRequestBody),
								}
							);

							const assignmentText =
								await assignmentResponse.text();
							console.log(
								'Raw assignment response:',
								assignmentText
							);

							if (!assignmentResponse.ok) {
								console.error(
									'Failed to assign shift:',
									assignmentResponse.status,
									assignmentText
								);
								continue;
							}

							console.log('7. Shift successfully assigned');
						} else {
							console.log('No best worker found for shift');
						}
					} catch (error) {
						console.error('Error processing shift:', error);
						// Continue with next shift instead of breaking
					}
				}
			}

			setWorkerData((prevData) =>
				prevData.map((worker) =>
					worker.id === selectedWorker.id ? updatedWorker : worker
				)
			);

			handleDialogClose('showMC');
			if (affectedShifts.length > 0) {
				setDialogState((prev) => ({ ...prev, showReallocation: true }));
			}
		} catch (error) {
			console.error('Error in MC submission process:', error);
		} finally {
			setIsSubmitting(false);
		}
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

			{/* Centralized Dialog Management */}
			<Dialogs
				dialogState={dialogState}
				onClose={handleDialogClose}
				selectedWorker={selectedWorker}
				mcDates={mcDates}
				onMCDatesChange={setMcDates}
				onSubmitMC={handleSubmitMC}
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
