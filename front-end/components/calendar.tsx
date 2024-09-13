import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

interface WorkerData {
  id: number;
  name: string;
  schedule: Array<{
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    client_id: number;
    valid: boolean;
  }>;
}

interface CalendarEvent {
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  client_id: number;
}

const WorkerCalendar: React.FC<{ workerData: WorkerData }> = ({ workerData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const events: CalendarEvent[] = useMemo(() => {
    return workerData.schedule.map(schedule => ({
      date: new Date(schedule.date),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      client_id: schedule.client_id,
    })).filter(event => 
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.client_id.toString().includes(searchTerm)
    );
  }, [workerData, searchTerm]);

  const displayDates = useMemo(() => {
    switch (view) {
      case 'daily':
        return [currentDate];
      case 'weekly':
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        });
      case 'monthly':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
    }
  }, [currentDate, view]);

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const renderTimeSlots = () => {
    return hours.map(hour => (
      <div key={hour} className="border-t h-12 flex items-center">
        <span className="text-xs text-gray-500 w-16">{hour}</span>
      </div>
    ));
  };

  const renderDayColumn = (day: Date) => {
    const dayEvents = events.filter(event => isSameDay(event.date, day));
    return (
      <div key={day.toString()} className="flex-1 border-l">
        <div className={`text-center py-2 font-semibold ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}`}>
          {format(day, 'EEE')}
          <br />
          {format(day, 'dd')}
        </div>
        <div className="relative h-[576px]"> {/* 24 hours * 24px per hour */}
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className="absolute w-full p-1 text-xs bg-blue-200 rounded overflow-hidden"
              style={{
                top: `${(parseInt(event.startTime.split(':')[0]) * 24 + parseInt(event.startTime.split(':')[1]) * 0.4)}px`,
                height: `${((parseInt(event.endTime.split(':')[0]) * 60 + parseInt(event.endTime.split(':')[1])) - 
                           (parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]))) * 0.4}px`,
              }}
            >
              <div className="font-bold">{event.startTime} - {event.endTime}</div>
              <div>{event.location}</div>
              <div>Client ID: {event.client_id}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = displayDates;
    const weeks = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-bold p-2">{day}</div>
        ))}
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div key={`${weekIndex}-${dayIndex}`} className="border p-1 h-24 overflow-y-auto">
              <div className={`text-right ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}`}>
                {format(day, 'd')}
              </div>
              {events.filter(event => isSameDay(event.date, day)).map((event, index) => (
                <div key={index} className="text-xs bg-blue-200 p-1 mb-1 rounded">
                  {event.startTime} - {event.endTime}
                  <br />
                  {event.location}
                </div>
              ))}
            </div>
          ))
        ))}
      </div>
    );
  };

  const changeDate = (amount: number) => {
    switch (view) {
      case 'daily':
        setCurrentDate(addDays(currentDate, amount));
        break;
      case 'weekly':
        setCurrentDate(addDays(currentDate, amount * 7));
        break;
      case 'monthly':
        setCurrentDate(addDays(currentDate, amount * 30)); // Approximation
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Worker Schedule: {workerData.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mb-4">
          <Input 
            placeholder="Search locations or client IDs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => setView('daily')} 
              variant={view === 'daily' ? 'default' : 'outline'}
            >
              Daily
            </Button>
            <Button 
              onClick={() => setView('weekly')} 
              variant={view === 'weekly' ? 'default' : 'outline'}
            >
              Weekly
            </Button>
            <Button 
              onClick={() => setView('monthly')} 
              variant={view === 'monthly' ? 'default' : 'outline'}
            >
              Monthly
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => changeDate(-1)} variant="outline">Previous</Button>
            <Button onClick={() => changeDate(1)} variant="outline">Next</Button>
            <Button onClick={goToToday} variant="outline">Today</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[600px] overflow-auto">
        {view === 'monthly' ? (
          renderMonthView()
        ) : (
          <div className="flex">
            <div className="w-16">
              {renderTimeSlots()}
            </div>
            {displayDates.map(renderDayColumn)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkerCalendar;