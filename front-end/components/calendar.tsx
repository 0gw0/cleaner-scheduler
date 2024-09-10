import React, { useState, useMemo } from "react";
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
  duration: 3 | 4; // in hours
};

type CalendarProps = {
  tasks: Task[];
};

const ALL_WORKERS = "all-workers";
const ALL_LOCATIONS = "all-locations";

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [workerFilter, setWorkerFilter] = useState(ALL_WORKERS);
  const [locationFilter, setLocationFilter] = useState(ALL_LOCATIONS);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        (task.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.supervisor.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (workerFilter === ALL_WORKERS || task.worker === workerFilter) &&
        (locationFilter === ALL_LOCATIONS || task.location === locationFilter)
    );
  }, [tasks, searchTerm, workerFilter, locationFilter]);


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
                (task) =>
                  isSameDay(task.startTime, day) &&
                  task.startTime.getHours() <= hour &&
                  task.startTime.getHours() + task.duration > hour
              );

              return (
                <div key={day.toString()} className="border relative h-20">
                  {dayTasks.map((task, i) => {
                    const taskStart =
                      task.startTime.getHours() +
                      task.startTime.getMinutes() / 60;
                    const topOffset =
                      taskStart > hour
                        ? 0
                        : ((hour - taskStart) / task.duration) * 100;
                    const height = Math.min(
                      100 - topOffset,
                      ((task.duration - (hour - taskStart)) / task.duration) *
                        100
                    );
                    const leftOffset = `${i * 15}px`; 

                    return (
                      <div
                        key={task.id}
                        className="absolute bg-blue-200 p-1 text-xs overflow-hidden"
                        style={{
                          top: `${topOffset}%`,
                          height: `${height}%`,
                          left: leftOffset,
                          width: `calc(100% - ${i * 15}px)`, 
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

    const taskGroups = groupTasksByStartTime(dayTasks);

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
        {taskGroups.map((group) => {
          const groupSize = group.tasks.length;

          return group.tasks.map((task, i) => {
            const startHour = task.startTime.getHours();
            const startMinute = task.startTime.getMinutes();
            const topPosition = `${
              ((startHour + startMinute / 60) / 24) * 100
            }%`;
            const height = `${(task.duration / 24) * 100}%`;
            const taskWidth = `calc(50% / ${groupSize})`;
            const leftOffset = `calc(${i} * (50% / ${groupSize}))`;

            return (
              <div
                key={task.id}
                className="absolute bg-blue-200 text-xs p-1"
                style={{
                  top: topPosition,
                  left: leftOffset,
                  width: taskWidth,
                  height,
                }}
              >
                <div>{task.worker}</div>
                <div>{task.location}</div>
                <div>Supervisor: {task.supervisor}</div>
              </div>
            );
          });
        })}
      </div>
    );
  };

  const groupTasksByStartTime = (tasks: Task[]) => {
    const groupedTasks: { startTime: Date; tasks: Task[] }[] = [];

    tasks.forEach((task) => {
      const startTime = task.startTime;
      const existingGroup = groupedTasks.find((group) =>
        isSameDay(group.startTime, startTime)
      );
      if (existingGroup) {
        existingGroup.tasks.push(task);
      } else {
        groupedTasks.push({ startTime, tasks: [task] });
      }
    });

    return groupedTasks;
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
      setView(view);
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
