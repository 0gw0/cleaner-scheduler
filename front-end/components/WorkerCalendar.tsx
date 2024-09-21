import React, { useState, useMemo } from 'react';
import {
	Calendar,
	momentLocalizer,
	View,
	NavigateAction,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { WorkerData, ScheduleItem, Shift } from '../types/dashboard';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface WorkerCalendarProps {
	workerData: WorkerData;
}

const WorkerCalendar: React.FC<WorkerCalendarProps> = ({ workerData }) => {
	const [view, setView] = useState<View>('month');
	const [date, setDate] = useState(new Date());

	// Convert shifts and schedule to events for the calendar
	const events = useMemo(() => {
		const shiftEvents = workerData.shifts.map((shift: Shift) => ({
			title: 'Shift',
			start: new Date(`${shift.date}T${shift.startTime}`),
			end: new Date(`${shift.date}T${shift.endTime}`),
			allDay: false,
		}));

		const scheduleEvents = workerData.schedule.map(
			(item: ScheduleItem) => ({
				title: `Work at ${item.location}`,
				start: new Date(`${item.date}T${item.startTime}`),
				end: new Date(`${item.date}T${item.endTime}`),
				allDay: false,
			})
		);

		return [...shiftEvents, ...scheduleEvents];
	}, [workerData]);

	const handleViewChange = (newView: View) => {
		setView(newView);
	};

	const handleNavigate = (
		newDate: Date,
		view: View,
		action: NavigateAction
	) => {
		switch (action) {
			case 'PREV':
				setDate(moment(newDate).toDate());
				break;
			case 'NEXT':
				setDate(moment(newDate).toDate());
				break;
			case 'TODAY':
				setDate(new Date());
				break;
			default:
				setDate(newDate);
		}
	};

	// Custom toolbar component
	const CustomToolbar = () => null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Worker Calendar</CardTitle>
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<Button
							onClick={() => handleViewChange('day')}
							variant={view === 'day' ? 'default' : 'outline'}
						>
							Day
						</Button>
						<Button
							onClick={() => handleViewChange('week')}
							variant={view === 'week' ? 'default' : 'outline'}
						>
							Week
						</Button>
						<Button
							onClick={() => handleViewChange('month')}
							variant={view === 'month' ? 'default' : 'outline'}
						>
							Month
						</Button>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() =>
								handleNavigate(
									moment(date).subtract(1, view).toDate(),
									view,
									'PREV'
								)
							}
							variant="outline"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							onClick={() =>
								handleNavigate(new Date(), view, 'TODAY')
							}
							variant="outline"
						>
							Today
						</Button>
						<Button
							onClick={() =>
								handleNavigate(
									moment(date).add(1, view).toDate(),
									view,
									'NEXT'
								)
							}
							variant="outline"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div style={{ height: '500px' }}>
					<Calendar
						localizer={localizer}
						events={events}
						startAccessor="start"
						endAccessor="end"
						view={view}
						date={date}
						onView={handleViewChange}
						onNavigate={handleNavigate}
						views={['day', 'week', 'month']}
						components={{
							toolbar: CustomToolbar,
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default WorkerCalendar;
