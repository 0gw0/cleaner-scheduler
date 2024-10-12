import { TaskCardProps, WorkerTravelData, ShiftData } from '@/types/task';
import TaskCard from '@/components/TaskCard';
import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react'; 
import Modal from '@/components/ui/modal';
import TaskDetailModal from '@/components/TaskDetailModal';

const fakeWorkerTravelData: WorkerTravelData[] = [
  {
    id: 1,
    name: "John Doe",
    travelTimeToTarget: {
      totalTravelTime: 45,
      travelTimeWithoutTraffic: 30,
      travelTimeInTraffic: 15,
    },
    relevantShift: {
      date: "2024-10-13",
      startTime: "09:00:00",
      endTime: "17:00:00",
    },
    originLocation: "123 Main St, Singapore",
  },
  {
    id: 2,
    name: "Jane Smith",
    travelTimeToTarget: {
      totalTravelTime: 30,
      travelTimeWithoutTraffic: 25,
      travelTimeInTraffic: 5,
    },
    relevantShift: {
      date: "2024-10-14",
      startTime: "10:00:00",
      endTime: "18:00:00",
    },
    originLocation: "456 Another St, Singapore",
  },
  {
    id: 3,
    name: "Alex Johnson",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "789 Some Blvd, Singapore",
  },
  {
    id: 4,
    name: "Bobby",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "700 DingDong Blvd, Singapore",
  },
  {
    id: 5,
    name: "Kevin",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "750 Dingus Blvd, Singapore",
  },
];


export const fakeShiftData: ShiftData[] = [
    {
      id: 101,
      worker: 1,
      property: {
        propertyId: 1001,
        clientId: 201,
        address: "789 Sample Blvd, Singapore",
        postalCode: "112233",
      },
      date: new Date("2024-10-13"),
      startTime: {
        hour: 9,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 17,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 102,
      worker: 2,
      property: {
        propertyId: 1002,
        clientId: 202,
        address: "456 Example St, Singapore",
        postalCode: "445566",
      },
      date: new Date("2024-10-14"),
      startTime: {
        hour: 10,
        minute: 30,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 18,
        minute: 30,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 103,
      worker: 3,
      property: {
        propertyId: 1003,
        clientId: 203,
        address: "123 Random Rd, Singapore",
        postalCode: "334455",
      },
      date: new Date("2024-10-15"),
      startTime: {
        hour: 8,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 16,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 104,
      worker: 4,
      property: {
        propertyId: 1004,
        clientId: 204,
        address: "321 Main St, Singapore",
        postalCode: "223344",
      },
      date: new Date("2024-10-16"),
      startTime: {
        hour: 7,
        minute: 30,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 15,
        minute: 30,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 105,
      worker: 5,
      property: {
        propertyId: 1005,
        clientId: 205,
        address: "789 Industrial Way, Singapore",
        postalCode: "556677",
      },
      date: new Date("2024-10-17"),
      startTime: {
        hour: 11,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 19,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
  ];
  

  
  const ManageTasks: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<ShiftData | null>(null)

  
    const filteredWorkers = fakeWorkerTravelData
    .filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.travelTimeToTarget.totalTravelTime - b.travelTimeToTarget.totalTravelTime);

  
    const filteredTasks = fakeShiftData.filter((task) =>
      task.property.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const sortedTasks = filteredTasks.sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime(); // Ascending
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // Descending
      }
    });

    const handleCardClick = (task: ShiftData) => {
        setSelectedTask(task)
        setIsModalOpen(true)
      }
    
      const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedTask(null)
      }
    
      const handleConfirmWorker = (workerId: number) => {
        console.log(`Worker ${workerId} confirmed for task ${selectedTask?.id}`)
        handleCloseModal()
      }
  

    const handleSortToggle = () => {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };
  
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by worker name or property address..."
            className="border border-gray-300 px-4 py-2 rounded-md w-3/4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
  
          {/* Sort Button */}
          <button
            className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
            style={{ height: "44px" }} 
            onClick={handleSortToggle}
          >
            <Filter className="mr-2 h-5 w-5" />
            {sortOrder === "asc" ? "Sort by Date (Oldest First)" : "Sort by Date (Newest First)"}
          </button>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            ShiftData={task}
            onCardClick={() => handleCardClick(task)}
          />
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <p className="text-gray-500">No tasks match the search term.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedTask && (
          <TaskDetailModal
            ShiftData={selectedTask}
            WorkerTravelData={filteredWorkers}
            onConfirm={handleConfirmWorker}
          />
        )}
      </Modal>
    </div>
  
    );
  };
  
  export default ManageTasks;
  