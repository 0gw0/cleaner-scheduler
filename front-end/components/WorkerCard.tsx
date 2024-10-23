import { Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ScheduleDialog } from './ScheduleDialog';
import { WorkerData } from '@/types/workermanagement';

interface WorkerCardProps {
	worker: WorkerData;
	onSubmitMC: (worker: WorkerData) => void;
	onViewSchedule: (workerId: number) => void;
}

export const WorkerCard = ({ worker, onSubmitMC }: WorkerCardProps) => (
	<Card className="hover:shadow-lg transition-shadow">
		<CardHeader className="flex flex-row items-center space-x-4 pb-2">
			<div className="flex-1">
				<CardTitle className="text-lg">{worker.name}</CardTitle>
				<div className="flex items-center text-sm text-gray-500">
					<Phone className="w-4 h-4 mr-1" />
					<p>{worker.phoneNumber}</p>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div className="space-y-4">
				<p className="text-sm text-gray-600">{worker.bio}</p>

				<div className="flex items-center justify-between text-sm text-gray-500">
					<span>Supervisor ID: {worker.supervisor}</span>
					<span>Total Shifts: {worker.shifts.length}</span>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" className="w-full">
							<Calendar className="w-4 h-4 mr-2" />
							View Schedule ({worker.shifts.length} shifts)
						</Button>
					</DialogTrigger>
					<ScheduleDialog shifts={worker.shifts} />
				</Dialog>

				<Button
					variant="outline"
					onClick={() => onSubmitMC(worker)}
					className="w-full"
				>
					Submit MC
				</Button>

				<div className="flex justify-between text-sm text-gray-500">
					<span>
						Active MCs:{' '}
						{
							worker.medicalLeaves.filter(
								(leave) => new Date(leave.endDate) >= new Date()
							).length
						}
					</span>
					<span>
						Next Shift:{' '}
						{worker.shifts
							.filter(
								(shift) => new Date(shift.date) > new Date()
							)
							.sort(
								(a, b) =>
									new Date(a.date).getTime() -
									new Date(b.date).getTime()
							)[0]?.date || 'None scheduled'}
					</span>
				</div>
			</div>
		</CardContent>
	</Card>
);
