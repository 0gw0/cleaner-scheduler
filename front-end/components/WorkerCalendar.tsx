import React, { useState, useMemo } from 'react';
import {
	Calendar,
	momentLocalizer,
	View,
	NavigateAction,
} from 'react-big-calendar';
import moment, { DurationInputArg2 } from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { WorkerData } from '../types/dashboard';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const localizer = momentLocalizer(moment);

// Helper function to convert View to moment duration unit
const viewToDurationUnit = (view: View): DurationInputArg2 => {
	switch (view) {
		case 'month':
			return 'months';
		case 'week':
		case 'work_week':
			return 'weeks';
		case 'day':
		case 'agenda':
			return 'days';
		default:
			return 'days';
	}
};

interface WorkerCalendarProps {
	workerData: WorkerData;
}

interface CalendarEvent {
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	type: 'shift' | 'annualLeave' | 'medicalLeave';
}

const WorkerCalendar: React.FC<WorkerCalendarProps> = ({ workerData }) => {
	const [view, setView] = useState<View>('month');
	const [date, setDate] = useState(new Date());

	const events = useMemo(() => {
		const shiftEvents: CalendarEvent[] = workerData.shifts.map((shift) => ({
			title: `Shift at ${shift.property.address}`,
			start: new Date(`${shift.date}T${shift.startTime}`),
			end: new Date(`${shift.date}T${shift.endTime}`),
			allDay: false,
			type: 'shift',
		}));

		const annualLeaveEvents: CalendarEvent[] = workerData.annualLeaves.map(
			(leave) => ({
				title: 'Annual Leave',
				start: new Date(leave.startDate),
				end: new Date(leave.endDate),
				allDay: true,
				type: 'annualLeave',
			})
		);

		const medicalLeaveEvents: CalendarEvent[] =
			workerData.medicalLeaves.map((leave) => ({
				title: 'Medical Leave',
				start: new Date(leave.startDate),
				end: new Date(leave.endDate),
				allDay: true,
				type: 'medicalLeave',
			}));

		return [...shiftEvents, ...medicalLeaveEvents, ...annualLeaveEvents];
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

	const getHeaderText = () => {
		switch (view) {
			case 'month':
				return moment(date).format('MMMM YYYY');
			case 'week':
				const start = moment(date).startOf('week').format('MMM D');
				const end = moment(date).endOf('week').format('MMM D, YYYY');
				return `${start} - ${end}`;
			case 'day':
				return moment(date).format('dddd, MMMM D, YYYY');
			default:
				return '';
		}
	};

	const CustomToolbar = () => null;
	const eventStyleGetter = (event: CalendarEvent) => {
		let style: React.CSSProperties = {
			borderRadius: '5px',
			border: '0px',
			display: 'block',
		};

		switch (event.type) {
			case 'shift':
				style = {
					...style,
					backgroundColor: '#3174ad',
					color: 'white',
					opacity: 1,
				};
				break;
			case 'annualLeave':
				style = {
					...style,
					backgroundColor: '#4CAF50',
					color: 'white',
					opacity: 0.8,
				};
				break;
			case 'medicalLeave':
				style = {
					...style,
					backgroundColor: '#FF5722',
					color: 'white',
					opacity: 0.8,
				};
				break;
		}

		return { style };
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Worker Calendar</CardTitle>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Button
							onClick={() =>
								handleNavigate(
									moment(date)
										.subtract(1, viewToDurationUnit(view))
										.toDate(),
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
									moment(date)
										.add(1, viewToDurationUnit(view))
										.toDate(),
									view,
									'NEXT'
								)
							}
							variant="outline"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<span className="text-lg font-semibold ml-2">
							{getHeaderText()}
						</span>
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
						eventPropGetter={eventStyleGetter}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default WorkerCalendar;
