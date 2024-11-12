import React, { useEffect, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { Shift } from '@/types/task'; 
import AddTaskForm from '@/components/AddTaskForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { CustomPagination } from '@/components/CustomPagination';

const ManageTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">('desc');
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "UPCOMING" | "Cancelled">("ALL");
  const [selectedTask, setSelectedTask] = useState<Shift | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [workers, setWorkers] = useState<number[]>([]); 
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [shiftData, setShiftData] = useState<Shift[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = async () => {
    try {
      const userDetails = localStorage.getItem('user');
      const supervisorId = userDetails ? JSON.parse(userDetails).id : null;
  
      if (!supervisorId) {
        throw new Error('No supervisor ID found in localStorage');
      }
      
      //if root admin below
      if (supervisorId == 3)
      {const response = await axios.get<Shift[]>(
        `http://localhost:8080/shifts`
      );
  
      setShiftData(response.data);
  
      const uniqueWorkerIds = Array.from(new Set(response.data.flatMap(shift => shift.workerIds)));
      setWorkers(uniqueWorkerIds);
  
      if (selectedWorker === null && uniqueWorkerIds.length > 0) {
        setSelectedWorker(uniqueWorkerIds[0]);
      }}
      
      //if normal admin below
      else
      
      {const response = await axios.get<Shift[]>(
        `http://localhost:8080/workers/supervisor/${supervisorId}/shifts`
      );
  
      setShiftData(response.data);
  
      const uniqueWorkerIds = Array.from(new Set(response.data.flatMap(shift => shift.workerIds)));
      setWorkers(uniqueWorkerIds);
  
      if (uniqueWorkerIds.length > 0) {
        setSelectedWorker(uniqueWorkerIds[0]);
      }}

    } catch (error) { 
      console.error('Failed to fetch shifts:', error);
      setError('Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchShifts();
  }, []);

  const tasksPerPage = 12;

  const filteredTasks = Array.isArray(shiftData) ? shiftData.filter(
    (task) =>
      task.property.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "ALL" || task.status === statusFilter) &&
      (selectedWorker === null || task.workerIds.includes(selectedWorker))
  ) : [];
  

  const handleTaskUpdate = () => {
    fetchShifts(); 
    setTimeout(() => {
      setIsTaskDetailModalOpen(false);}, 1200)
      setSelectedTask(null)
  };

  const handleTaskAdded = () => {
    fetchShifts(); 
  };

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const indexOfLastTask = currentPage * tasksPerPage;
	const indexOfFirstWorker = indexOfLastTask - tasksPerPage;
	const currentTasks = sortedTasks.slice(indexOfFirstWorker,indexOfLastTask);
	const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

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

  const cancelShift = async (shiftId: number) => {
    try {
      const response = await axios.put(`http://localhost:8080/shifts/${shiftId}/update-status`, null, {
        params: {
          status: 'CANCELLED',
        },
      });
      console.log('Shift cancelled successfully:', response.data);
      fetchShifts(); 
    } catch (error) {
      console.error('Error cancelling shift:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <p>Loading shifts...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

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
              {workers.map((workerId) => (
                <SelectItem key={workerId} value={workerId.toString()}>
                  Worker {workerId}
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
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleSortToggle}>
              <Filter className="mr-2 h-4 w-4" />
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>

        </div>


      <div className="flex-grow flex items-center ml-2 mr-2 space-y-4 md:space-y-0 justify-between">
        <Input
          className="w-full md:w-auto flex-grow"
          placeholder="Search by property address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>


        <div className="flex-shrink-0">
          <AddTaskForm onTaskAdded={handleTaskAdded}/>
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
          {currentTasks.map((task) => (
            <TaskCard key={task.id} shiftData={task} onCardClick={() => handleCardClick(task)} cancelShift={() => cancelShift(task.id)}/>
          ))}
        </div>
      )}

      {/* Pagination */}
			{filteredTasks.length > 0 && (
				<CustomPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

      {selectedTask && (
        <TaskDetailModal
        onTaskUpdate={handleTaskUpdate}
        shiftData={selectedTask}
        isOpen={isTaskDetailModalOpen}
        onClose={handleCloseTaskDetailModal}
        onEdit={async (selectedTask: Shift) => {
          return Promise.resolve();
        }}
        />
      )}
    </div>
  );
};

export default ManageTasks;
