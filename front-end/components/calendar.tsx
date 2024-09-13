import React, { useState, useMemo, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addHours,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  worker: string;
  location: string;
  supervisor: string;
  startTime: Date;
  duration: number; 
};

type CalendarProps = {
  tasks: Task[];
};

const ALL_OPTION = "all";

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [workerFilter, setWorkerFilter] = useState(ALL_OPTION);
  const [locationFilter, setLocationFilter] = useState(ALL_OPTION);
  const [supervisorFilter, setSupervisorFilter] = useState(ALL_OPTION);

  const uniqueWorkers = useMemo(() => Array.from(new Set(tasks.map(task => task.worker))), [tasks]);
  const uniqueLocations = useMemo(() => Array.from(new Set(tasks.map(task => task.location))), [tasks]);
  const uniqueSupervisors = useMemo(() => Array.from(new Set(tasks.map(task => task.supervisor))), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        (task.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.supervisor.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (workerFilter === ALL_OPTION || task.worker === workerFilter) &&
        (locationFilter === ALL_OPTION || task.location === locationFilter) &&
        (supervisorFilter === ALL_OPTION || task.supervisor === supervisorFilter)
    );
  }, [tasks, searchTerm, workerFilter, locationFilter, supervisorFilter]);

  const renderTasks = (day: Date) => {
    const dayTasks = filteredTasks.filter((task) =>
      isSameDay(task.startTime, day)
    );
    return dayTasks.map((task) => (
      <div key={task.id} className="text-xs bg-blue-200 p-1 mt-1 rounded">
        {task.worker} - {task.location}
      </div>
    ));
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-2 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            className={`p-2 border ${
              !isSameMonth(day, monthStart) ? "text-gray-400" : "text-black"
            } ${isSameDay(day, new Date()) ? "bg-blue-100" : ""}`}
          >
            <span className="text-sm">{format(cloneDay, "d")}</span>
            {renderTasks(cloneDay)}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const renderHeader = () => {
    const dateFormat = view === "monthly" ? "MMMM yyyy" : "MMMM d, yyyy";
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={prevDate}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, dateFormat)}
        </h2>
        <Button variant="outline" onClick={nextDate}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const days = Array.from({ length: 7 }, (_, i) =>
      addDays(startOfWeek(currentDate), i)
    );

    return (
      <div className="grid grid-cols-8 gap-1">
        <div></div>
        {days.map((day) => (
          <div key={day.toString()} className="text-center font-semibold">
            {format(day, "EEE d")}
          </div>
        ))}
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2 h-20 relative">
              <span className="absolute top-0 right-0 text-sm">{`${hour
                .toString()
                .padStart(2, "0")}:00`}</span>
            </div>
            {days.map((day) => {
              const dayTasks = filteredTasks.filter(
                (task) => isSameDay(task.startTime, day)
              );

              return (
                <div key={day.toString()} className="border relative h-20">
                  {dayTasks.map((task) => {
                    const taskStart = task.startTime;
                    const taskEnd = addHours(taskStart, task.duration / 60);
                    const cellStart = addHours(day, hour);
                    const cellEnd = addHours(cellStart, 1);

                    if (taskStart < cellEnd && taskEnd > cellStart) {
                      const top = Math.max(0, differenceInMinutes(taskStart, cellStart) / 60) * 100;
                      const height = Math.min(100, (Math.min(60, differenceInMinutes(taskEnd, cellStart)) / 60) * 100);

                      return (
                        <div
                          key={task.id}
                      className="absolute bg-blue-200 p-1 text-xs overflow-hidden h-50"
                          style={{
                            top: `${top}%`,
                            left: 0,
                            right: 0,
                            opacity: 0.8,
                          }}
                        >
                          <div>{task.worker}</div>
                          <div>{task.location}</div>
                          <div>Supervisor: {task.supervisor}</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDailyView = () => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const dayTasks = filteredTasks.filter(
      (task) => task.startTime >= dayStart && task.startTime < dayEnd
    );

    return (
      <div className="relative" style={{ height: "600px" }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="absolute w-full h-10"
            style={{ top: `${(hour / 24) * 100}%` }}
          >
            <div className="absolute left-0 w-16 text-right pr-2 text-sm">{`${hour
              .toString()
              .padStart(2, "0")}:00`}</div>
            <div className="absolute left-16 right-0 border-t border-gray-200"></div>
          </div>
        ))}
        {dayTasks.map((task) => {
          const startHour = task.startTime.getHours();
          const startMinute = task.startTime.getMinutes();
          const topPosition = `${((startHour + startMinute / 60) / 24) * 100}%`;
          const height = `${(task.duration / 1440) * 100}%`; // 1440 minutes in a day

          return (
            <div
              key={task.id}
          className="absolute bg-blue-200 text-xs p-1 h-50"
              style={{
                top: topPosition,
                left: '16px',
                right: '0',
                opacity: 0.8,
              }}
            >
              <div>{task.worker}</div>
              <div>{task.location}</div>
              <div>Supervisor: {task.supervisor}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const prevDate = () => {
    if (view === "monthly") {
      setCurrentDate((prev) => addDays(prev, -30));
    } else if (view === "weekly") {
      setCurrentDate((prev) => addDays(prev, -7));
    } else {
      setCurrentDate((prev) => addDays(prev, -1));
    }
  };

  const nextDate = () => {
    if (view === "monthly") {
      setCurrentDate((prev) => addDays(prev, 30));
    } else if (view === "weekly") {
      setCurrentDate((prev) => addDays(prev, 7));
    } else {
      setCurrentDate((prev) => addDays(prev, 1));
    }
  };

  const handleViewChange = (view: "daily" | "weekly" | "monthly" | "today") => {
    if (view === "today") {
      setCurrentDate(new Date());
      setView("daily");
    } else {
      setView(view as "daily" | "weekly" | "monthly");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search tasks by worker, location, or supervisor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-4"
          icon={Search}
        />
        <div className="flex items-center space-x-4">
          <Select value={workerFilter} onValueChange={setWorkerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Worker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>All Workers</SelectItem>
              {uniqueWorkers.map(worker => (
                <SelectItem key={worker} value={worker}>{worker}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>All Supervisors</SelectItem>
              {uniqueSupervisors.map(supervisor => (
                <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={view}
            onValueChange={handleViewChange}
            className="w-32"
          >
            <SelectTrigger>
              <SelectValue placeholder="View" />
              <ChevronDown className="h-4 w-4 ml-2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {renderHeader()}
      {view === "monthly" && (
        <>
          {renderDays()}
          {renderCells()}
        </>
      )}
      {view === "weekly" && renderWeeklyView()}
      {view === "daily" && renderDailyView()}
    </div>
  );
};

export default Calendar;