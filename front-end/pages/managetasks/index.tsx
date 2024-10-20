import React, { useEffect, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { Worker, Shift } from '@/types/task';
import AddTaskForm from '@/components/AddTaskForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const ManageTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">('asc');
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "UPCOMING">("ALL");
  const [selectedTask, setSelectedTask] = useState<Shift | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null); // Initially null
  const [shiftData, setShiftData] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const userDetails = localStorage.getItem('user');
        const supervisorId = userDetails ? JSON.parse(userDetails).id : null;

        if (!supervisorId) {
          throw new Error('No supervisor ID found in localStorage');
        }

        const response = await axios.get<Worker[]>(
          `http://localhost:8080/workers?supervisorId=${supervisorId}`
        );

        setWorkers(response.data);

        // Set the initial selected worker after workers are fetched
        if (response.data.length > 0) {
          setSelectedWorker(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch workers:', error);
        setError('Failed to load workers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    // Update shift data whenever workers or selected worker changes
    const allShifts = workers.flatMap(worker =>
      worker.shifts.map(shift => ({
        ...shift,
      }))
    );
    setShiftData(allShifts);
  }, [workers]);

  if (isLoading) {
    return <p>Loading workers...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const filteredTasks = shiftData.filter(
    (task) =>
      task.property.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "ALL" || task.status === statusFilter) &&
      (selectedWorker === null || task.worker === selectedWorker)
  );

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handleCardClick = (task: Shift) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetailModal = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleWorkerChange = (workerId: number) => {
    setSelectedWorker(workerId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <Select
            value={selectedWorker?.toString() || ""}
            onValueChange={(value) => handleWorkerChange(Number(value))}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              {workers.map((worker) => (
                <SelectItem key={worker.id} value={worker.id.toString()}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-grow flex items-center ml-2 mr-2">
          <Input
            className="w-full md:w-auto flex-grow"
            placeholder="Search by property address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex items-center ml-2">
          <Button variant="outline" onClick={handleSortToggle}>
            <Filter className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>
          </div>

        </div>

        <div className="flex-shrink-0">
          <AddTaskForm />
        </div>
      </div>


      {sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No tasks match the current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} shiftData={task} onCardClick={() => handleCardClick(task)} />
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          shiftData={selectedTask}
          isOpen={isTaskDetailModalOpen}
          onClose={handleCloseTaskDetailModal}
        />
      )}
    </div>
  );
};

export default ManageTasks;
