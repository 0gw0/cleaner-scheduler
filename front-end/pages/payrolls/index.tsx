import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, UserCheck, Clock, Mail } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Property {
	propertyId: number;
	clientId: number;
	address: string;
	postalCode: string;
}

interface Shift {
	id: number;
	workers: number[];
	property: Property;
	date: string;
	startTime: string;
	endTime: string;
	status: 'COMPLETED' | 'UPCOMING' | string;
	presentWorkers?: number[];
}

interface PayrollData {
	workerId: number;
	workerName: string;
	regularHours: number;
	overtimeHours: number;
	regularPay: number;
	overtimePay: number;
	totalPay: number;
	shifts: Shift[];
}

interface Worker {
	id: number;
	name: string;
}

type ShiftResponse = Shift | number;

interface PDFDocument extends jsPDF {
	autoTable: (options: AutoTableOptions) => void;
	lastAutoTable: {
		finalY: number;
	};
}

interface AutoTableOptions {
	startY: number;
	head: string[][];
	body: string[][];
}

interface APIError {
	error?: string;
	message?: string;
}

const BASE_HOURLY_RATE = 15;
const OVERTIME_HOURLY_RATE = 25;
const WEEKLY_HOUR_LIMIT = 44;

const PayrollManagementPage = () => {
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [workers, setWorkers] = useState<Worker[]>([]);
	const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
	const [loading, setLoading] = useState(true);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showEmailDialog, setShowEmailDialog] = useState(false);
	const [email, setEmail] = useState('');
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [sendingEmail, setSendingEmail] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState<string>(
		new Date().toISOString().slice(0, 7)
	);

	const fetchShifts = async () => {
		try {
			const response = await fetch('http://localhost:8080/shifts');
			const data = (await response.json()) as ShiftResponse[];
			setShifts(
				data.filter(
					(shift): shift is Shift => typeof shift !== 'number'
				)
			);
		} catch (error) {
			console.error('Error fetching shifts:', error);
		}
	};

	const fetchWorkers = async () => {
		try {
			const response = await fetch('http://localhost:8080/workers');
			const data = await response.json();
			const workerIds: number[] =
				JSON.parse(localStorage.getItem('user') || '{}').workers || [];
			const filteredWorkers = data.filter((worker: Worker) =>
				workerIds.includes(worker.id)
			);
			setWorkers(filteredWorkers);
		} catch (error) {
			console.error('Error fetching workers:', error);
		}
	};

	const calculatePayroll = React.useCallback(() => {
		const workerPayrollMap = new Map<number, PayrollData>();
		workers.forEach((worker) => {
			workerPayrollMap.set(worker.id, {
				workerId: worker.id,
				workerName: worker.name,
				regularHours: 0,
				overtimeHours: 0,
				regularPay: 0,
				overtimePay: 0,
				totalPay: 0,
				shifts: [],
			});
		});

		shifts.forEach((shift) => {
			if (
				shift.status === 'COMPLETED' &&
				shift.date.startsWith(selectedMonth)
			) {
				const start = new Date(`2000-01-01T${shift.startTime}`);
				const end = new Date(`2000-01-01T${shift.endTime}`);
				const shiftHours =
					(end.getTime() - start.getTime()) / (1000 * 60 * 60);

				shift.workers.forEach((workerId) => {
					if (shift.presentWorkers?.includes(workerId)) {
						const workerData = workerPayrollMap.get(workerId);
						if (workerData) {
							const currentTotalHours =
								workerData.regularHours +
								workerData.overtimeHours;
							const newTotalHours =
								currentTotalHours + shiftHours;

							if (newTotalHours <= WEEKLY_HOUR_LIMIT) {
								workerData.regularHours += shiftHours;
							} else {
								const remainingRegularHours = Math.max(
									0,
									WEEKLY_HOUR_LIMIT - currentTotalHours
								);
								workerData.regularHours +=
									remainingRegularHours;
								workerData.overtimeHours +=
									shiftHours - remainingRegularHours;
							}

							workerData.shifts.push(shift);
						}
					}
				});
			}
		});

		workerPayrollMap.forEach((workerData) => {
			workerData.regularPay = workerData.regularHours * BASE_HOURLY_RATE;
			workerData.overtimePay =
				workerData.overtimeHours * OVERTIME_HOURLY_RATE;
			workerData.totalPay =
				workerData.regularPay + workerData.overtimePay;
		});

		setPayrollData(Array.from(workerPayrollMap.values()));
	}, [shifts, workers, selectedMonth]);

	useEffect(() => {
		const fetchInitialData = async () => {
			setLoading(true);
			try {
				await Promise.all([fetchShifts(), fetchWorkers()]);
			} catch (error) {
				console.error('Error fetching initial data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchInitialData();
	}, []);

	useEffect(() => {
		if (shifts.length > 0 && workers.length > 0) {
			calculatePayroll();
		}
	}, [shifts, workers, selectedMonth, calculatePayroll]);

	const handleProcessPayroll = () => {
		if (payrollData.length === 0) {
			setSuccessMessage(
				'No payroll data available for the selected month.'
			);
			setShowSuccessAlert(true);
			setTimeout(() => setShowSuccessAlert(false), 3000);
			return;
		}

		const blob = generatePDF();
		setPdfBlob(blob);
		setShowEmailDialog(true);
	};

	const handleSendEmail = async () => {
		if (!email || !pdfBlob) {
			setSuccessMessage('Missing email or PDF data');
			setShowSuccessAlert(true);
			return;
		}

		setSendingEmail(true);
		try {
			const base64Data = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = reader.result?.toString().split(',')[1];
					if (result) {
						resolve(result);
					} else {
						reject(new Error('Failed to convert PDF to base64'));
					}
				};
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(pdfBlob);
			});

			const response = await fetch('/api/send-payroll', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to: email,
					subject: `Payroll Report - ${selectedMonth}`,
					pdfData: base64Data,
					filename: `payroll-${selectedMonth}.pdf`,
				}),
			});

			const data = (await response.json()) as APIError;

			if (!response.ok) {
				throw new Error(
					data.error || data.message || 'Failed to send email'
				);
			}

			setShowEmailDialog(false);
			setSuccessMessage('Payroll report sent successfully!');
			setShowSuccessAlert(true);
		} catch (error) {
			console.error('Error sending email:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Unknown error occurred';
			setSuccessMessage(`Error sending email: ${errorMessage}`);
			setShowSuccessAlert(true);
		} finally {
			setSendingEmail(false);
			setTimeout(() => setShowSuccessAlert(false), 3000);
		}
	};

	const generatePDF = () => {
		const doc = new jsPDF() as PDFDocument;
		const monthYear = new Date(selectedMonth).toLocaleString('default', {
			month: 'long',
			year: 'numeric',
		});

		doc.setFontSize(20);
		doc.text(`Payroll Report - ${monthYear}`, 15, 20);

		doc.setFontSize(12);
		doc.text(`Total Payroll: $${totalPayroll.toFixed(2)}`, 15, 35);
		doc.text(`Total Workers: ${totalWorkers}`, 15, 42);
		doc.text(`Average Pay: $${averagePay.toFixed(2)}`, 15, 49);

		const tableData = payrollData.map((worker) => [
			worker.workerName,
			worker.regularHours.toFixed(2),
			worker.overtimeHours.toFixed(2),
			`$${worker.regularPay.toFixed(2)}`,
			`$${worker.overtimePay.toFixed(2)}`,
			`$${worker.totalPay.toFixed(2)}`,
		]);

		doc.autoTable({
			startY: 60,
			head: [
				[
					'Worker',
					'Regular Hours',
					'OT Hours',
					'Regular Pay',
					'OT Pay',
					'Total Pay',
				],
			],
			body: tableData,
		});

		// Shift details
		let yPos = doc.lastAutoTable.finalY + 20;

		payrollData.forEach((worker) => {
			if (yPos > 250) {
				doc.addPage();
				yPos = 20;
			}

			doc.setFontSize(14);
			doc.text(`${worker.workerName}'s Shifts`, 15, yPos);
			yPos += 10;

			const shiftsData = worker.shifts.map((shift) => [
				shift.date,
				shift.startTime,
				shift.endTime,
				shift.property.address,
				shift.status,
			]);

			doc.autoTable({
				startY: yPos,
				head: [['Date', 'Start Time', 'End Time', 'Address', 'Status']],
				body: shiftsData,
			});

			yPos = doc.lastAutoTable.finalY + 15;
		});

		return doc.output('blob');
	};

	const { totalPayroll, totalWorkers, averagePay } = React.useMemo(() => {
		const totalPayroll = payrollData.reduce(
			(sum, data) => sum + data.totalPay,
			0
		);
		const totalWorkers = payrollData.length;
		const averagePay = totalWorkers > 0 ? totalPayroll / totalWorkers : 0;

		return { totalPayroll, totalWorkers, averagePay };
	}, [payrollData]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold mb-6 text-center">
				Payroll Management Dashboard
			</h1>

			<div className="flex justify-end mb-4">
				<Select onValueChange={setSelectedMonth} value={selectedMonth}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select month" />
					</SelectTrigger>
					<SelectContent>
						{Array.from({ length: 12 }, (_, i) => {
							const month = String(i + 1).padStart(2, '0');
							const value = `2024-${month}`;
							const date = new Date(2024, i, 1);
							return (
								<SelectItem key={i} value={value}>
									{date.toLocaleString('default', {
										month: 'long',
										year: 'numeric',
									})}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Payroll
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${totalPayroll.toFixed(2)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Workers
						</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalWorkers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Average Pay
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${averagePay.toFixed(2)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Payroll Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Worker</TableHead>
									<TableHead className="text-right">
										Regular Hours
									</TableHead>
									<TableHead className="text-right">
										Overtime Hours
									</TableHead>
									<TableHead className="text-right">
										Regular Pay
									</TableHead>
									<TableHead className="text-right">
										Overtime Pay
									</TableHead>
									<TableHead className="text-right">
										Total Pay
									</TableHead>
									<TableHead className="text-center">
										View Shifts
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payrollData.map((data) => (
									<TableRow
										key={data.workerId}
										className="hover:bg-muted/50 transition-colors"
									>
										<TableCell className="font-medium">
											{data.workerName}
										</TableCell>
										<TableCell className="text-right">
											{data.regularHours.toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											{data.overtimeHours.toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											${data.regularPay.toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											${data.overtimePay.toFixed(2)}
										</TableCell>
										<TableCell className="text-right font-bold">
											${data.totalPay.toFixed(2)}
										</TableCell>
										<TableCell className="text-center">
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														size="sm"
													>
														View Shifts
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-3xl">
													<DialogHeader>
														<DialogTitle>
															{data.workerName}
															&apos;s Shifts for{' '}
															{new Date(
																selectedMonth
															).toLocaleString(
																'default',
																{
																	month: 'long',
																	year: 'numeric',
																}
															)}
														</DialogTitle>
													</DialogHeader>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>
																	Date
																</TableHead>
																<TableHead>
																	Start Time
																</TableHead>
																<TableHead>
																	End Time
																</TableHead>
																<TableHead>
																	Address
																</TableHead>
																<TableHead>
																	Status
																</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{data.shifts.map(
																(shift) => (
																	<TableRow
																		key={
																			shift.id
																		}
																	>
																		<TableCell>
																			{
																				shift.date
																			}
																		</TableCell>
																		<TableCell>
																			{
																				shift.startTime
																			}
																		</TableCell>
																		<TableCell>
																			{
																				shift.endTime
																			}
																		</TableCell>
																		<TableCell>
																			{
																				shift
																					.property
																					.address
																			}
																		</TableCell>
																		<TableCell>
																			<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
																				{
																					shift.status
																				}
																			</span>
																		</TableCell>
																	</TableRow>
																)
															)}
														</TableBody>
													</Table>
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-center">
				<Button
					onClick={handleProcessPayroll}
					size="lg"
					className="w-full max-w-md"
				>
					Process Payroll
				</Button>
			</div>

			<Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Send Payroll Report</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex gap-4 items-center">
							<Input
								type="email"
								placeholder="Enter email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Button
								onClick={handleSendEmail}
								disabled={sendingEmail}
							>
								{sendingEmail ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Mail className="h-4 w-4 mr-2" />
										Send
									</>
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{showSuccessAlert && (
				<Alert
					variant="default"
					className="mt-4 bg-green-100 border-green-500"
				>
					<AlertTitle className="text-green-800">Success</AlertTitle>
					<AlertDescription className="text-green-700">
						{successMessage}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};

export default PayrollManagementPage;
