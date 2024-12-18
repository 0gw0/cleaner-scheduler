import React, { useState, useEffect } from 'react';
import {
	Search,
	MapPin,
	User,
	Calendar,
	Briefcase,
	Check,
	Filter,
	Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import AddClientForm from '@/components/AddClientForm';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
	id: number;
	client: number;
	address: string;
	postalCode: string;
	active: boolean;
}

interface PropertyPayload {
	address: string;
	postalCode: string;
	clientId: number;
}

interface ClientResponse {
	id: number;
	name: string;
	properties: Property[];
	status: string;
}

interface Client extends ClientResponse {}

interface ArrivalImage {
	s3Key: string;
	uploadTime: string;
	fileName: string;
}

interface Shift {
	id: number;
	workers: number[];
	workerIds: number[];
	property: {
		propertyId: number;
		clientId: number;
		address: string;
		postalCode: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	arrivalImage: ArrivalImage | null;
}

interface Worker {
	id: number;
	name: string;
	phoneNumber: string;
	supervisorId: number;
	bio: string;
	homePostalCode: string;
}

interface AddPropertyProps {
	clientId: number;
	onAdd: (property: Property) => void;
}

const ClientProfiles = () => {
	const [clients, setClients] = useState<Client[]>([]);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('ALL');
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [isTerminating, setIsTerminating] = useState(false);
	const [clientToTerminate, setClientToTerminate] = useState<number | null>(
		null
	);
	const [terminationError, setTerminationError] = useState<string | null>(
		null
	);

	const handleClientAdded = (newClient: Client) => {
		setClients((prevClients) => [...prevClients, newClient]);
	};

	const handlePropertyAdded = (clientId: number, newProperty: Property) => {
		setClients((prevClients) =>
			prevClients.map((client) =>
				client.id === clientId
					? {
							...client,
							properties: [...client.properties, newProperty],
					  }
					: client
			)
		);
	};

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const response = await fetch('http://localhost:8080/clients');
				const data = await response.json();
				setClients(data);
			} catch (error) {
				console.error('Error fetching clients:', error);
			}
		};

		const fetchShifts = async () => {
			try {
				const response = await fetch('http://localhost:8080/shifts');
				const data = await response.json();
				setShifts(data);
			} catch (error) {
				console.error('Error fetching shifts:', error);
			}
		};

		fetchClients();
		fetchShifts();
	}, []);

	useEffect(() => {
		let results = [...clients];
		if (searchTerm) {
			results = results.filter(
				(client) =>
					client.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					client.properties.some(
						(property) =>
							property.address
								.toLowerCase()
								.includes(searchTerm.toLowerCase()) ||
							property.postalCode.includes(searchTerm)
					)
			);
		}
		if (statusFilter !== 'ALL') {
			results = results.filter(
				(client) => client.status === statusFilter
			);
		}
		setFilteredClients(results);
	}, [searchTerm, clients, statusFilter]);

	const getUniqueStatuses = () => {
		const statuses = new Set(clients.map((client) => client.status));
		return Array.from(statuses);
	};

	const getStatusBadge = (status: string) => {
		const statusColors: { [key: string]: string } = {
			COMPLETED: 'bg-green-100 text-green-800',
			UPCOMING: 'bg-blue-100 text-blue-800',
			CANCELLED: 'bg-red-100 text-red-800',
			INPROGRESS: 'bg-yellow-100 text-yellow-800',
		};

		return (
			<Badge
				className={`${
					statusColors[status] || 'bg-gray-100 text-gray-800'
				}`}
			>
				{status}
			</Badge>
		);
	};

	const fetchWorkerDetails = async (workerId: number): Promise<Worker> => {
		try {
			const response = await fetch(
				`http://localhost:8080/workers/${workerId}`
			);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching worker details:', error);
			throw error;
		}
	};

	const AddProperty: React.FC<AddPropertyProps> = ({ clientId, onAdd }) => {
		const [isFormVisible, setIsFormVisible] = useState(false);
		const [isSuccess, setIsSuccess] = useState(false);
		const [isLoading, setIsLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [propertyData, setPropertyData] = useState<PropertyPayload>({
			address: '',
			postalCode: '',
			clientId,
		});

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			setPropertyData((prev) => ({ ...prev, [name]: value }));
		};

		const handleAddProperty = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const { data } = await axios.post<Property>(
					'http://localhost:8080/properties',
					propertyData
				);

				setIsSuccess(true);
				onAdd(data);
				handlePropertyAdded(clientId, data);

				// Reset form after successful submission
				setTimeout(() => {
					setIsSuccess(false);
					setPropertyData({ address: '', postalCode: '', clientId });
					setIsFormVisible(false);
				}, 1500);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: 'Failed to add property. Please try again.';
				setError(errorMessage);
				console.error('Error adding property:', err);
			} finally {
				setIsLoading(false);
			}
		};

		return (
			<div>
				<Button
					onClick={() => setIsFormVisible(!isFormVisible)}
					className="mb-4"
					disabled={isLoading}
				>
					{isFormVisible ? 'Cancel' : 'Add Property'}
				</Button>

				<AnimatePresence>
					{isFormVisible && (
						<motion.div
							key="form"
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -10, scale: 0.95 }}
							transition={{ duration: 0.3 }}
							className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-lg"
						>
							<div>
								<Label htmlFor="address">Address</Label>
								<Input
									id="address"
									name="address"
									value={propertyData.address}
									onChange={handleInputChange}
									required
									className="mt-2"
									disabled={isLoading}
								/>
							</div>
							<div>
								<Label htmlFor="postalCode">Postal Code</Label>
								<Input
									id="postalCode"
									name="postalCode"
									value={propertyData.postalCode}
									onChange={(e) => {
										const value = e.target.value;
										if (
											/^\d*$/.test(value) &&
											value.length <= 6
										) {
											handleInputChange(e);
										}
									}}
									required
									className="mt-2"
									disabled={isLoading}
								/>
							</div>
							{error && (
								<div className="text-red-500 text-sm">
									{error}
								</div>
							)}
							<Button
								onClick={handleAddProperty}
								disabled={isLoading}
							>
								{isLoading
									? 'Adding Property...'
									: 'Submit Property'}
							</Button>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{isSuccess && (
						<motion.div
							key="success"
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="flex justify-center items-center mt-4"
						>
							<Check className="text-green-500 w-12 h-12" />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	};

	const PropertiesDialog: React.FC<{
		properties: Property[];
		clientId: number;
	}> = ({ properties: initialProperties, clientId }) => {
		const [properties, setProperties] =
			useState<Property[]>(initialProperties);
		const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
		const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
		const [selectedProperty, setSelectedProperty] =
			useState<Property | null>(null);
		const [modifiedAddress, setModifiedAddress] = useState('');
		const [modifiedPostalCode, setModifiedPostalCode] = useState('');
		const [isLoading, setIsLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);

		const handleAddProperty = (newProperty: Property) => {
			setProperties((prev) => [...prev, newProperty]);
		};

		const handleModifyProperty = async () => {
			if (!selectedProperty) return;

			setIsLoading(true);
			setError(null);

			try {
				const { data } = await axios.put<Property>(
					`http://localhost:8080/properties/${selectedProperty.id}`,
					{
						address: modifiedAddress,
						postalCode: modifiedPostalCode,
					}
				);

				setProperties((prevProperties) =>
					prevProperties.map((prop) =>
						prop.id === selectedProperty.id
							? { ...prop, ...data }
							: prop
					)
				);

				setIsModifyDialogOpen(false);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to modify property. Please try again.';
				setError(errorMessage);
				console.error('Error modifying property:', error);
			} finally {
				setIsLoading(false);
			}
		};

		const handleDeleteProperty = async () => {
			if (!selectedProperty) return;

			setIsLoading(true);
			setError(null);

			try {
				await axios.delete(
					`http://localhost:8080/properties/${selectedProperty.id}`
				);
				setProperties((prevProperties) =>
					prevProperties.map((prop) =>
						prop.id === selectedProperty.id
							? { ...prop, active: false }
							: prop
					)
				);

				setIsDeleteDialogOpen(false);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to deactivate property. Please try again.';
				setError(errorMessage);
				console.error('Error deactivating property:', error);
			} finally {
				setIsLoading(false);
			}
		};

		const openModifyDialog = (property: Property) => {
			setSelectedProperty(property);
			setModifiedAddress(property.address);
			setModifiedPostalCode(property.postalCode);
			setError(null);
			setIsModifyDialogOpen(true);
		};

		const openDeleteDialog = (property: Property) => {
			setSelectedProperty(property);
			setError(null);
			setIsDeleteDialogOpen(true);
		};

		return (
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Client Properties</DialogTitle>
					<AddProperty
						clientId={clientId}
						onAdd={handleAddProperty}
					/>
				</DialogHeader>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Address</TableHead>
							<TableHead>Postal Code</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{properties.map((property) => (
							<TableRow key={property.id}>
								<TableCell>{property.address}</TableCell>
								<TableCell>{property.postalCode}</TableCell>
								<TableCell>
									<Badge
										variant={
											property.active
												? 'default'
												: 'destructive'
										}
									>
										{property.active
											? 'Active'
											: 'Inactive'}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												openModifyDialog(property)
											}
										>
											Modify
										</Button>
										{property.active && (
											<Button
												variant="destructive"
												size="sm"
												onClick={() =>
													openDeleteDialog(property)
												}
											>
												Delete
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<Dialog
					open={isModifyDialogOpen}
					onOpenChange={setIsModifyDialogOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Modify Property</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="modifyAddress">Address</Label>
								<Input
									id="modifyAddress"
									value={modifiedAddress}
									onChange={(e) =>
										setModifiedAddress(e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="modifyPostalCode">
									Postal Code
								</Label>
								<Input
									id="modifyPostalCode"
									value={modifiedPostalCode}
									onChange={(e) =>
										setModifiedPostalCode(e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
							{error && (
								<div className="text-red-500 text-sm">
									{error}
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsModifyDialogOpen(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={handleModifyProperty}
								disabled={isLoading}
							>
								{isLoading ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm Deactivation</DialogTitle>
							<DialogDescription>
								Are you sure you want to deactivate this
								property? The property will be marked as
								inactive.
							</DialogDescription>
						</DialogHeader>
						{error && (
							<div className="text-red-500 text-sm">{error}</div>
						)}
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteDialogOpen(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteProperty}
								disabled={isLoading}
							>
								{isLoading
									? 'Deactivating...'
									: 'Deactivate Property'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DialogContent>
		);
	};
  
	const ShiftsDialog = ({ clientId }: { clientId: number }) => {
		const [clientShifts, setClientShifts] = useState<Shift[]>([]);
		const [workerDetails, setWorkerDetails] = useState<{
			[key: number]: Worker;
		}>({});

		useEffect(() => {
			const validShifts = shifts.filter(
				(shift) =>
					typeof shift === 'object' &&
					shift !== null &&
					shift.property?.clientId === clientId
			);
			setClientShifts(validShifts);

			const fetchWorkers = async () => {
				const workerIds = new Set<number>();
				validShifts.forEach((shift) => {
					shift.workers?.forEach((id) => workerIds.add(id));
					shift.workerIds?.forEach((id) => workerIds.add(id));
				});

				const workerPromises = Array.from(workerIds).map((id) =>
					fetchWorkerDetails(id)
				);
				const workers = await Promise.all(workerPromises);
				const workerMap = workers.reduce((acc, worker) => {
					if (worker) {
						acc[worker.id] = worker;
					}
					return acc;
				}, {} as { [key: number]: Worker });
				setWorkerDetails(workerMap);
			};

			fetchWorkers();
		}, [clientId]);

		const getWorkerNames = (workerIds: number[]) => {
			return workerIds
				.map((id) => workerDetails[id]?.name || 'Loading...')
				.join(', ');
		};

		const getWorkerPhones = (workerIds: number[]) => {
			return workerIds
				.map((id) => workerDetails[id]?.phoneNumber || 'Loading...')
				.join(', ');
		};

		const getSupervisors = (workerIds: number[]) => {
			return workerIds
				.map((id) => workerDetails[id]?.supervisorId || 'Loading...')
				.join(', ');
		};

		return (
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Client Jobs</DialogTitle>
				</DialogHeader>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Workers</TableHead>
							<TableHead>Worker Phones</TableHead>
							<TableHead>Supervisor IDs</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{clientShifts.map((shift) => (
							<TableRow key={shift.id}>
								<TableCell>
									{new Date(shift.date).toLocaleDateString()}
								</TableCell>
								<TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
								<TableCell>
									{getStatusBadge(shift.status)}
								</TableCell>
								<TableCell>
									{getWorkerNames(
										shift.workers || shift.workerIds || []
									)}
								</TableCell>
								<TableCell>
									{getWorkerPhones(
										shift.workers || shift.workerIds || []
									)}
								</TableCell>
								<TableCell>
									{getSupervisors(
										shift.workers || shift.workerIds || []
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
		);
	};

	const handleRemoveClient = async (clientId: number) => {
		try {
			setIsTerminating(true);
			setTerminationError(null);

			const response = await axios.patch(
				`http://localhost:8080/clients/${clientId}/terminate`
			);

			if (response.status === 200) {
				setClients((prevClients) =>
					prevClients.map((client) =>
						client.id === clientId
							? {
									...client,
									status:
										response.data.status || 'TERMINATED',
							  }
							: client
					)
				);
				setClientToTerminate(null);
			}
		} catch (error) {
			console.error('Error terminating client:', error);
			setTerminationError(
				(axios.isAxiosError(error) && error.response?.data?.message) ||
					'Failed to terminate client. Please try again.'
			);
		} finally {
			setIsTerminating(false);
		}
	};

	const TerminationDialog = () => (
		<Dialog
			open={clientToTerminate !== null}
			onOpenChange={() => setClientToTerminate(null)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Client Termination</DialogTitle>
					<DialogDescription>
						Are you sure you want to terminate this client? This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				{terminationError && (
					<div className="text-red-500 text-sm mt-2">
						{terminationError}
					</div>
				)}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setClientToTerminate(null)}
						disabled={isTerminating}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() =>
							clientToTerminate &&
							handleRemoveClient(clientToTerminate)
						}
						disabled={isTerminating}
					>
						{isTerminating
							? 'Terminating...'
							: 'Confirm Termination'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	return (
		<div className="container mx-auto px-4 py-4 md:py-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
				<h1 className="text-xl md:text-2xl font-bold">
					Client Profiles
				</h1>
				<div className="w-full md:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								className="w-full flex justify-between items-center"
							>
								<span>Filters & Options</span>
								<Menu className="h-4 w-4" />
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="space-y-4 mt-8">
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
									<Input
										placeholder="Search clients..."
										className="pl-8 w-full"
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
									/>
								</div>
								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<SelectTrigger className="w-full">
										<div className="flex items-center gap-2">
											<Filter className="w-4 h-4" />
											<SelectValue placeholder="Filter by status" />
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">
											All Statuses
										</SelectItem>
										{getUniqueStatuses().map((status) => (
											<SelectItem
												key={status}
												value={status}
											>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<AddClientForm
									onClientAdded={handleClientAdded}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</div>

				<div className="hidden md:flex items-center gap-4">
					<div className="relative w-64">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
						<Input
							placeholder="Search clients..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select
						value={statusFilter}
						onValueChange={setStatusFilter}
					>
						<SelectTrigger className="w-[180px]">
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4" />
								<SelectValue placeholder="Filter by status" />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Statuses</SelectItem>
							{getUniqueStatuses().map((status) => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<AddClientForm onClientAdded={handleClientAdded} />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
				{filteredClients.map((client) => (
					<Card
						key={client.id}
						className="hover:shadow-lg transition-shadow"
					>
						<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 pb-2">
							<div className="flex-1 space-y-1">
								<CardTitle className="text-lg break-words">
									{client.name}
								</CardTitle>
								<Badge variant="secondary">
									{client.status}
								</Badge>
								<div className="flex items-center text-sm text-gray-500 mt-2">
									<MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
									<p className="truncate">
										{client.properties[0]?.address}
									</p>
								</div>
							</div>
							{client.status === 'Active' && (
								<Button
									className="text-red-500 hover:bg-red-50 rounded-full bg-white w-full sm:w-auto"
									onClick={() =>
										setClientToTerminate(client.id)
									}
								>
									Remove Client
								</Button>
							)}
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center text-sm text-gray-600">
										<User className="w-4 h-4 mr-1 flex-shrink-0" />
										<span>Postal Code:</span>
									</div>
									<span className="text-sm font-medium">
										{client.properties[0]?.postalCode}
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												className="w-full"
											>
												<Calendar className="w-4 h-4 mr-2" />
												Properties (
												{client.properties.length})
											</Button>
										</DialogTrigger>
										<PropertiesDialog
											properties={client.properties}
											clientId={client.id}
										/>
									</Dialog>

									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												className="w-full"
											>
												<Briefcase className="w-4 h-4 mr-2" />
												Jobs
											</Button>
										</DialogTrigger>
										<ShiftsDialog clientId={client.id} />
									</Dialog>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<TerminationDialog />
		</div>
	);
};

export default ClientProfiles;
